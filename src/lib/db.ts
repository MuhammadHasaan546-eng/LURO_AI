import mongoose, { type ClientSession } from "mongoose";
import { connectToDatabase, withMongoTransaction } from "@/lib/mongoose";
import {
  AuditEventModel,
  AuthTokenModel,
  ChatModel,
  DocumentChunkModel,
  DocumentModel,
  DocumentQuestionModel,
  EmailModel,
  GenerationModel,
  ImageModel,
  OAuthChallengeModel,
  ProviderIdentityModel,
  RateLimitBucketModel,
  SessionModel,
  SubscriptionModel,
  TranslationModel,
  UsageCounterModel,
  UsageModel,
  UserModel,
  type AuditEvent,
  type AuthToken,
  type OAuthChallenge,
  type OAuthProvider,
  type ProviderIdentity,
  type RateLimitBucket,
  type Session,
  type User,
} from "@/models";

export type {
  AuditOutcome,
  OAuthProvider,
  TokenPurpose,
  User,
  ProviderIdentity,
  Session,
  AuthToken,
  OAuthChallenge,
} from "@/models";

export type CurrentSession = Session & {
  user: User & { identities: ProviderIdentity[] };
};

type Selection = Record<string, boolean> | undefined;
const projection = (select: Selection) =>
  select
    ? Object.fromEntries(
        Object.entries(select).map(([key, enabled]) => [key, enabled ? 1 : 0]),
      )
    : undefined;
const withoutMongoId = <T extends Record<string, unknown>>(value: T | null) => {
  if (!value) return null;
  const document = { ...value };
  delete document._id;
  return document as Omit<T, "_id">;
};
const leanOne = async <T>(query: { lean: () => Promise<T | null> }) =>
  withoutMongoId(
    (await query.lean()) as Record<string, unknown> | null,
  ) as T | null;

export const db = {
  user: {
    findUnique: async ({
      where,
      select,
    }: {
      where: { id?: string; email?: string };
      select?: Selection;
    }): Promise<User | null> => {
      await connectToDatabase();
      const query = UserModel.findOne(where, projection(select));
      if (select?.passwordHash) query.select("+passwordHash");
      return leanOne<User>(query);
    },
    create: async ({
      data,
      select,
    }: {
      data: Partial<User> &
        Pick<User, "email"> & {
          identities?: {
            create: Omit<
              ProviderIdentity,
              "id" | "userId" | "createdAt" | "updatedAt"
            >;
          };
        };
      select?: Selection;
    }) => {
      await connectToDatabase();
      const { identities, ...userData } = data;
      const create = async (session?: ClientSession) => {
        const [user] = await UserModel.create(
          [
            {
              firstName: "",
              lastName: "",
              emailVerifiedAt: null,
              passwordHash: null,
              passwordChangedAt: null,
              lastAuthenticatedAt: null,
              ...userData,
            },
          ],
          { session },
        );
        if (identities) {
          await ProviderIdentityModel.create(
            [{ ...identities.create, userId: user.id }],
            { session },
          );
        }
        const value = user.toObject() as Record<string, unknown>;
        const clean = withoutMongoId(value)!;
        return (
          select
            ? Object.fromEntries(
                Object.keys(select)
                  .filter((key) => select[key])
                  .map((key) => [key, clean[key]]),
              )
            : clean
        ) as User;
      };
      return identities ? withMongoTransaction(create) : create();
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<User>;
    }) => {
      await connectToDatabase();
      return leanOne<User>(
        UserModel.findOneAndUpdate(
          where,
          { $set: data },
          { new: true, runValidators: true },
        ),
      );
    },
    claimNotification: async ({
      id,
      field,
      before,
      now,
    }: {
      id: string;
      field: "welcomeEmailSentAt" | "loginNotificationSentAt";
      before: Date;
      now: Date;
    }) => {
      await connectToDatabase();
      const claimed = await UserModel.findOneAndUpdate(
        {
          id,
          // sanitizeFilter protects user-supplied filters by escaping operators.
          // This query is server-generated and intentionally uses $lt.
          $or: [
            { [field]: null },
            { [field]: mongoose.trusted({ $lt: before }) },
          ],
        },
        { $set: { [field]: now } },
        { new: false, runValidators: true },
      ).lean();
      return Boolean(claimed);
    },
    releaseNotification: async ({
      id,
      field,
      claimedAt,
    }: {
      id: string;
      field: "welcomeEmailSentAt" | "loginNotificationSentAt";
      claimedAt: Date;
    }) => {
      await connectToDatabase();
      await UserModel.updateOne(
        { id, [field]: claimedAt },
        { $set: { [field]: null } },
      );
    },
    delete: async ({ where }: { where: { id: string } }) =>
      withMongoTransaction(async (session) => {
        const user = await leanOne<User>(
          UserModel.findOneAndDelete(where, { session }),
        );
        await Promise.all([
          ProviderIdentityModel.deleteMany({ userId: where.id }, { session }),
          SessionModel.deleteMany({ userId: where.id }, { session }),
          AuthTokenModel.deleteMany({ userId: where.id }, { session }),
          OAuthChallengeModel.deleteMany({ userId: where.id }, { session }),
          ChatModel.deleteMany({ userId: where.id }, { session }),
          GenerationModel.deleteMany({ userId: where.id }, { session }),
          EmailModel.deleteMany({ userId: where.id }, { session }),
          TranslationModel.deleteMany({ userId: where.id }, { session }),
          ImageModel.deleteMany({ userId: where.id }, { session }),
          DocumentModel.deleteMany({ userId: where.id }, { session }),
          DocumentChunkModel.deleteMany({ userId: where.id }, { session }),
          DocumentQuestionModel.deleteMany({ userId: where.id }, { session }),
          UsageModel.deleteMany({ userId: where.id }, { session }),
          UsageCounterModel.deleteMany({ userId: where.id }, { session }),
          SubscriptionModel.deleteMany({ userId: where.id }, { session }),
          AuditEventModel.updateMany(
            { userId: where.id },
            { $set: { userId: null } },
            { session },
          ),
        ]);
        return user;
      }),
  },
  providerIdentity: {
    findUnique: async ({
      where,
    }: {
      where: {
        provider_providerSubject: {
          provider: OAuthProvider;
          providerSubject: string;
        };
      };
    }) => {
      await connectToDatabase();
      return leanOne<ProviderIdentity>(
        ProviderIdentityModel.findOne(where.provider_providerSubject),
      );
    },
    findFirst: async ({ where }: { where: Partial<ProviderIdentity> }) => {
      await connectToDatabase();
      return leanOne<ProviderIdentity>(ProviderIdentityModel.findOne(where));
    },
    create: async (
      data: Omit<ProviderIdentity, "id" | "createdAt" | "updatedAt">,
    ) => {
      await connectToDatabase();
      const value = await ProviderIdentityModel.create(data);
      return withoutMongoId(value.toObject() as Record<string, unknown>);
    },
    upsert: async ({
      where,
      create,
      update,
    }: {
      where: {
        provider_providerSubject: {
          provider: OAuthProvider;
          providerSubject: string;
        };
      };
      create: Omit<ProviderIdentity, "id" | "createdAt" | "updatedAt">;
      update: Partial<ProviderIdentity>;
    }) => {
      await connectToDatabase();
      return leanOne<ProviderIdentity>(
        ProviderIdentityModel.findOneAndUpdate(
          where.provider_providerSubject,
          { $set: update, $setOnInsert: create },
          { upsert: true, new: true, runValidators: true },
        ),
      );
    },
    delete: async ({ where }: { where: { id: string } }) => {
      await connectToDatabase();
      return leanOne<ProviderIdentity>(
        ProviderIdentityModel.findOneAndDelete(where),
      );
    },
  },
  session: {
    create: async ({
      data,
    }: {
      data: Omit<
        Session,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "lastSeenAt"
        | "authenticatedAt"
        | "revokedAt"
      >;
    }) => {
      await connectToDatabase();
      const now = new Date();
      const value = await SessionModel.create({
        ...data,
        lastSeenAt: now,
        authenticatedAt: now,
        revokedAt: null,
      });
      return withoutMongoId(value.toObject() as Record<string, unknown>);
    },
    findUnique: async ({
      where,
      include,
    }: {
      where: { tokenHash: string };
      include?: unknown;
    }) => {
      await connectToDatabase();
      const session = await leanOne<Session>(
        SessionModel.findOne(where).select("+tokenHash +csrfTokenHash"),
      );
      if (!session || !include) return session;
      const user = await leanOne<User>(
        UserModel.findOne({ id: session.userId }).select("+passwordHash"),
      );
      if (!user) return null;
      const identities = (
        await ProviderIdentityModel.find({ userId: user.id }).lean()
      ).map(
        (item) => withoutMongoId(item as unknown as Record<string, unknown>)!,
      ) as ProviderIdentity[];
      return { ...session, user: { ...user, identities } } as CurrentSession;
    },
    findMany: async ({
      where,
      select,
    }: {
      where: { userId: string; revokedAt: null; expiresAt: { gt: Date } };
      select?: Selection;
      orderBy?: Record<string, "asc" | "desc">;
    }) => {
      await connectToDatabase();
      const values = await SessionModel.find(
        {
          userId: where.userId,
          revokedAt: null,
          expiresAt: mongoose.trusted({ $gt: where.expiresAt.gt }),
        },
        projection(select),
      )
        .sort({ createdAt: -1 })
        .lean();
      return values.map(
        (item) => withoutMongoId(item as unknown as Record<string, unknown>)!,
      );
    },
    touch: async ({
      id,
      now,
      idleExpiresAt,
    }: {
      id: string;
      now: Date;
      idleExpiresAt: Date;
    }) => {
      await connectToDatabase();
      const cutoff = new Date(now.getTime() - 15 * 60_000);
      await SessionModel.updateOne(
        {
          id,
          revokedAt: null,
          lastSeenAt: mongoose.trusted({ $lt: cutoff }),
        },
        { $set: { lastSeenAt: now, idleExpiresAt } },
        { runValidators: true },
      );
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<Session>;
    }) => {
      await connectToDatabase();
      return leanOne<Session>(
        SessionModel.findOneAndUpdate(
          where,
          { $set: data },
          { new: true, runValidators: true },
        ),
      );
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<Session>;
    }) => {
      await connectToDatabase();
      const filter = { ...where };
      if (
        where.id &&
        typeof where.id === "object" &&
        "not" in (where.id as object)
      )
        filter.id = { $ne: (where.id as { not: string }).not };
      const result = await SessionModel.updateMany(
        filter,
        { $set: data },
        { runValidators: true },
      );
      return { count: result.modifiedCount };
    },
  },
  authToken: {
    create: async ({
      data,
    }: {
      data: Omit<AuthToken, "id" | "createdAt" | "updatedAt" | "usedAt">;
    }) => {
      await connectToDatabase();
      const value = await AuthTokenModel.create({ ...data, usedAt: null });
      return withoutMongoId(value.toObject() as Record<string, unknown>);
    },
    findUnique: async ({ where }: { where: { tokenHash: string } }) => {
      await connectToDatabase();
      return leanOne<AuthToken>(
        AuthTokenModel.findOne(where).select("+tokenHash"),
      );
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Partial<AuthToken>;
      data: Partial<AuthToken>;
    }) => {
      await connectToDatabase();
      const result = await AuthTokenModel.updateMany(
        where,
        { $set: data },
        { runValidators: true },
      );
      return { count: result.modifiedCount };
    },
  },
  oAuthChallenge: {
    create: async ({
      data,
    }: {
      data: Omit<OAuthChallenge, "id" | "createdAt" | "updatedAt">;
    }) => {
      await connectToDatabase();
      const value = await OAuthChallengeModel.create(data);
      return withoutMongoId(value.toObject() as Record<string, unknown>);
    },
    findUnique: async ({ where }: { where: { stateHash: string } }) => {
      await connectToDatabase();
      return leanOne<OAuthChallenge>(
        OAuthChallengeModel.findOne(where).select(
          "+stateHash +nonceHash +codeVerifier",
        ),
      );
    },
    delete: async ({ where }: { where: { id: string } }) => {
      await connectToDatabase();
      return leanOne<OAuthChallenge>(
        OAuthChallengeModel.findOneAndDelete(where),
      );
    },
  },
  rateLimitBucket: {
    findUnique: async ({ where }: { where: { id: string } }) => {
      await connectToDatabase();
      return leanOne<RateLimitBucket>(RateLimitBucketModel.findOne(where));
    },
    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { id: string };
      create: Omit<RateLimitBucket, "createdAt" | "updatedAt">;
      update: Partial<RateLimitBucket>;
    }) => {
      await connectToDatabase();
      // MongoDB rejects an upsert when the same path appears in both $set and
      // $setOnInsert. Only retain insert-only values in $setOnInsert.
      const insertOnly = Object.fromEntries(
        Object.entries(create).filter(([key]) => !(key in update)),
      );
      return leanOne(
        RateLimitBucketModel.findOneAndUpdate(
          where,
          { $set: update, $setOnInsert: insertOnly },
          { upsert: true, new: true, runValidators: true },
        ),
      );
    },
  },
  auditEvent: {
    create: async ({
      data,
    }: {
      data: Pick<AuditEvent, "event" | "outcome"> & Partial<AuditEvent>;
    }) => {
      await connectToDatabase();
      const value = await AuditEventModel.create({
        userId: null,
        ipAddressHash: null,
        userAgent: null,
        metadata: null,
        ...data,
      });
      return withoutMongoId(value.toObject() as Record<string, unknown>);
    },
  },
};
