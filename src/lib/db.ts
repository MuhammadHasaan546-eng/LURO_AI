import { randomUUID } from "node:crypto";
import {
  type Collection,
  type Db,
  type Filter,
  type MongoClient,
  type OptionalUnlessRequiredId,
  type UpdateFilter,
  MongoClient as MongoClientConstructor,
} from "mongodb";
import { env } from "@/lib/env";

export type OAuthProvider = "GOOGLE" | "APPLE";
export type TokenPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";
export type AuditOutcome = "SUCCESS" | "FAILURE";

type BaseDocument = {
  _id?: unknown;
  id: string;
  createdAt: Date;
};

export type User = BaseDocument & {
  email: string;
  firstName: string;
  lastName: string;
  emailVerifiedAt: Date | null;
  passwordHash: string | null;
  passwordChangedAt: Date | null;
  lastAuthenticatedAt: Date | null;
  updatedAt: Date;
};

export type ProviderIdentity = BaseDocument & {
  provider: OAuthProvider;
  providerSubject: string;
  providerEmail: string | null;
  emailVerified: boolean;
  displayName: string | null;
  userId: string;
  updatedAt: Date;
};

export type Session = BaseDocument & {
  tokenHash: string;
  csrfTokenHash: string;
  userId: string;
  expiresAt: Date;
  idleExpiresAt: Date;
  lastSeenAt: Date;
  authenticatedAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddressHash: string | null;
};

export type AuthToken = BaseDocument & {
  tokenHash: string;
  purpose: TokenPurpose;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type OAuthChallenge = BaseDocument & {
  stateHash: string;
  nonceHash: string;
  codeVerifier: string;
  provider: OAuthProvider;
  intent: string;
  returnTo: string;
  userId: string | null;
  expiresAt: Date;
};

type RateLimitBucket = {
  _id?: unknown;
  id: string;
  count: number;
  windowStart: Date;
  blockedUntil: Date | null;
  updatedAt: Date;
};

type AuditEvent = BaseDocument & {
  userId: string | null;
  event: string;
  outcome: AuditOutcome;
  ipAddressHash: string | null;
  userAgent: string | null;
  metadata: string | null;
};

export type CurrentSession = Session & {
  user: User & { identities: ProviderIdentity[] };
};

type Collections = {
  users: Collection<User>;
  providerIdentities: Collection<ProviderIdentity>;
  sessions: Collection<Session>;
  authTokens: Collection<AuthToken>;
  oauthChallenges: Collection<OAuthChallenge>;
  rateLimitBuckets: Collection<RateLimitBucket>;
  auditEvents: Collection<AuditEvent>;
};

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
  mongoIndexesPromise?: Promise<void>;
};

const clientPromise =
  globalForMongo.mongoClientPromise ??
  new MongoClientConstructor(env.MONGODB_URI).connect();

if (env.NODE_ENV !== "production")
  globalForMongo.mongoClientPromise = clientPromise;

const database = async (): Promise<Db> =>
  (await clientPromise).db(env.MONGODB_DATABASE);

const collections = async (): Promise<Collections> => {
  const mongo = await database();
  const result: Collections = {
    users: mongo.collection<User>("users"),
    providerIdentities:
      mongo.collection<ProviderIdentity>("providerIdentities"),
    sessions: mongo.collection<Session>("sessions"),
    authTokens: mongo.collection<AuthToken>("authTokens"),
    oauthChallenges: mongo.collection<OAuthChallenge>("oauthChallenges"),
    rateLimitBuckets: mongo.collection<RateLimitBucket>("rateLimitBuckets"),
    auditEvents: mongo.collection<AuditEvent>("auditEvents"),
  };

  globalForMongo.mongoIndexesPromise ??= Promise.all([
    result.users.createIndex({ email: 1 }, { unique: true }),
    result.providerIdentities.createIndex(
      { provider: 1, providerSubject: 1 },
      { unique: true },
    ),
    result.providerIdentities.createIndex({ userId: 1 }),
    result.sessions.createIndex({ tokenHash: 1 }, { unique: true }),
    result.sessions.createIndex({ userId: 1, revokedAt: 1 }),
    result.authTokens.createIndex({ tokenHash: 1 }, { unique: true }),
    result.authTokens.createIndex({ userId: 1, purpose: 1 }),
    result.oauthChallenges.createIndex({ stateHash: 1 }, { unique: true }),
    result.oauthChallenges.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    ),
    result.rateLimitBuckets.createIndex(
      { updatedAt: 1 },
      { expireAfterSeconds: 86400 },
    ),
    result.auditEvents.createIndex({ userId: 1, createdAt: -1 }),
  ]).then(() => undefined);
  await globalForMongo.mongoIndexesPromise;
  return result;
};

const clean = <T extends { _id?: unknown }>(document: T | null) => {
  if (!document) return null;
  const { _id: _ignored, ...value } = document;
  return value as Omit<T, "_id">;
};

const insert = async <T extends BaseDocument>(
  collection: Collection<T>,
  data: Omit<OptionalUnlessRequiredId<T>, "_id">,
) => {
  await collection.insertOne(data as OptionalUnlessRequiredId<T>);
  return clean(data as unknown as T)!;
};

const selectFields = <T extends object>(
  value: T | null,
  select?: Record<string, boolean>,
) => {
  if (!value || !select) return value;
  return Object.fromEntries(
    Object.keys(select)
      .filter((key) => select[key])
      .map((key) => [key, value[key as keyof T]]),
  ) as Pick<T, keyof T>;
};

const nowDocument = () => ({ id: randomUUID(), createdAt: new Date() });

export const mongo = {
  users: async () => (await collections()).users,
  providerIdentities: async () => (await collections()).providerIdentities,
  sessions: async () => (await collections()).sessions,
  authTokens: async () => (await collections()).authTokens,
  oauthChallenges: async () => (await collections()).oauthChallenges,
  rateLimitBuckets: async () => (await collections()).rateLimitBuckets,
  auditEvents: async () => (await collections()).auditEvents,
  clean,
  insert,
  nowDocument,
};

export const db = {
  user: {
    findUnique: async ({
      where,
      select,
    }: {
      where: { id?: string; email?: string };
      select?: Record<string, boolean>;
    }) =>
      selectFields(
        clean(await (await mongo.users()).findOne(where as Filter<User>)),
        select,
      ),
    create: async ({
      data,
      select,
    }: {
      data: Partial<User> & Pick<User, "email"> & { identities?: unknown };
      select?: Record<string, boolean>;
    }) => {
      const timestamp = new Date();
      const identityData = (
        data as typeof data & {
          identities?: {
            create: Omit<
              ProviderIdentity,
              keyof BaseDocument | "userId" | "updatedAt"
            >;
          };
        }
      ).identities;
      const user = await insert(await mongo.users(), {
        ...nowDocument(),
        firstName: "",
        lastName: "",
        emailVerifiedAt: null,
        passwordHash: null,
        passwordChangedAt: null,
        lastAuthenticatedAt: null,
        ...data,
        identities: undefined,
        updatedAt: timestamp,
      } as unknown as User);
      if (identityData) {
        await insert(await mongo.providerIdentities(), {
          ...nowDocument(),
          ...identityData.create,
          userId: user.id,
          updatedAt: timestamp,
        } as ProviderIdentity);
      }
      return selectFields(user, select);
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<User>;
    }) =>
      clean(
        await (
          await mongo.users()
        ).findOneAndUpdate(
          where,
          { $set: { ...data, updatedAt: new Date() } },
          { returnDocument: "after" },
        ),
      ),
    delete: async ({ where }: { where: { id: string } }) => {
      const stores = await collections();
      const user = clean(await stores.users.findOneAndDelete(where));
      await Promise.all([
        stores.providerIdentities.deleteMany({ userId: where.id }),
        stores.sessions.deleteMany({ userId: where.id }),
        stores.authTokens.deleteMany({ userId: where.id }),
        stores.oauthChallenges.deleteMany({ userId: where.id }),
        stores.auditEvents.updateMany(
          { userId: where.id },
          { $set: { userId: null } },
        ),
      ]);
      return user;
    },
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
    }) =>
      clean(
        await (
          await mongo.providerIdentities()
        ).findOne(where.provider_providerSubject),
      ),
    findFirst: async ({ where }: { where: Partial<ProviderIdentity> }) =>
      clean(
        await (
          await mongo.providerIdentities()
        ).findOne(where as Filter<ProviderIdentity>),
      ),
    create: async (
      data: Omit<ProviderIdentity, keyof BaseDocument | "updatedAt">,
    ) =>
      insert(await mongo.providerIdentities(), {
        ...nowDocument(),
        ...data,
        providerEmail: data.providerEmail ?? null,
        emailVerified: data.emailVerified ?? false,
        displayName: data.displayName ?? null,
        updatedAt: new Date(),
      } as ProviderIdentity),
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
      create: Omit<ProviderIdentity, keyof BaseDocument | "updatedAt">;
      update: Partial<ProviderIdentity>;
    }) => {
      const timestamp = new Date();
      return clean(
        await (
          await mongo.providerIdentities()
        ).findOneAndUpdate(
          where.provider_providerSubject,
          {
            $set: { ...update, updatedAt: timestamp },
            $setOnInsert: { ...nowDocument(), ...create },
          },
          { upsert: true, returnDocument: "after" },
        ),
      );
    },
    delete: async ({ where }: { where: { id: string } }) =>
      clean(await (await mongo.providerIdentities()).findOneAndDelete(where)),
  },
  session: {
    create: async ({
      data,
    }: {
      data: Omit<
        Session,
        keyof BaseDocument | "lastSeenAt" | "authenticatedAt" | "revokedAt"
      >;
    }) => {
      const timestamp = new Date();
      return insert(await mongo.sessions(), {
        ...nowDocument(),
        ...data,
        userAgent: data.userAgent ?? null,
        ipAddressHash: data.ipAddressHash ?? null,
        lastSeenAt: timestamp,
        authenticatedAt: timestamp,
        revokedAt: null,
      } as Session);
    },
    findUnique: async ({
      where,
      include,
    }: {
      where: { tokenHash: string };
      include?: unknown;
    }) => {
      const session = clean(await (await mongo.sessions()).findOne(where));
      if (!session || !include) return session;
      const user = clean(
        await (await mongo.users()).findOne({ id: session.userId }),
      );
      if (!user) return null;
      const identities = (
        await (await mongo.providerIdentities())
          .find({ userId: user.id })
          .toArray()
      ).map(clean);
      return { ...session, user: { ...user, identities } } as CurrentSession;
    },
    findMany: async ({
      where,
      select,
    }: {
      where: { userId: string; revokedAt: null; expiresAt: { gt: Date } };
      select?: Record<string, boolean>;
      orderBy?: Record<string, "asc" | "desc">;
    }) =>
      (
        await (
          await mongo.sessions()
        )
          .find({
            userId: where.userId,
            revokedAt: null,
            expiresAt: { $gt: where.expiresAt.gt },
          })
          .sort({ createdAt: -1 })
          .toArray()
      )
        .map((item) => selectFields(clean(item), select))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<Session>;
    }) =>
      clean(
        await (
          await mongo.sessions()
        ).findOneAndUpdate(where, { $set: data }, { returnDocument: "after" }),
      ),
    updateMany: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<Session>;
    }) => {
      const filter: Record<string, unknown> = { ...where };
      if (
        where.id &&
        typeof where.id === "object" &&
        where.id !== null &&
        "not" in where.id
      )
        filter.id = { $ne: (where.id as { not: string }).not };
      const result = await (
        await mongo.sessions()
      ).updateMany(filter, { $set: data } as UpdateFilter<Session>);
      return { count: result.modifiedCount };
    },
  },
  authToken: {
    create: async ({
      data,
    }: {
      data: Omit<AuthToken, keyof BaseDocument | "usedAt">;
    }) =>
      insert(await mongo.authTokens(), {
        ...nowDocument(),
        ...data,
        usedAt: null,
      } as AuthToken),
    findUnique: async ({ where }: { where: { tokenHash: string } }) =>
      clean(await (await mongo.authTokens()).findOne(where)),
    updateMany: async ({
      where,
      data,
    }: {
      where: Partial<AuthToken>;
      data: Partial<AuthToken>;
    }) => {
      const result = await (
        await mongo.authTokens()
      ).updateMany(where as Filter<AuthToken>, { $set: data });
      return { count: result.modifiedCount };
    },
  },
  oAuthChallenge: {
    create: async ({
      data,
    }: {
      data: Omit<OAuthChallenge, keyof BaseDocument>;
    }) =>
      insert(await mongo.oauthChallenges(), {
        ...nowDocument(),
        ...data,
        userId: data.userId ?? null,
      } as OAuthChallenge),
    findUnique: async ({ where }: { where: { stateHash: string } }) =>
      clean(await (await mongo.oauthChallenges()).findOne(where)),
    delete: async ({ where }: { where: { id: string } }) =>
      clean(await (await mongo.oauthChallenges()).findOneAndDelete(where)),
  },
  rateLimitBucket: {
    findUnique: async ({ where }: { where: { id: string } }) =>
      clean(await (await mongo.rateLimitBuckets()).findOne(where)),
    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { id: string };
      create: Omit<RateLimitBucket, "_id" | "updatedAt">;
      update: Partial<RateLimitBucket>;
    }) =>
      clean(
        await (
          await mongo.rateLimitBuckets()
        ).findOneAndUpdate(
          where,
          { $set: { ...update, updatedAt: new Date() }, $setOnInsert: create },
          { upsert: true, returnDocument: "after" },
        ),
      ),
  },
  auditEvent: {
    create: async ({
      data,
    }: {
      data: Pick<AuditEvent, "event" | "outcome"> & Partial<AuditEvent>;
    }) =>
      insert(await mongo.auditEvents(), {
        ...nowDocument(),
        userId: null,
        ipAddressHash: null,
        userAgent: null,
        metadata: null,
        ...data,
      } as AuditEvent),
  },
};
