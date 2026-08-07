import { randomUUID } from "node:crypto";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { productModels } from "@/models/product";

export * from "@/models/product";

const idField = {
  type: String,
  default: randomUUID,
  immutable: true,
  required: true,
} as const;
const nullableString = { type: String, default: null } as const;
const schemaOptions = {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: {
    transform: (_document: unknown, value: Record<string, unknown>) => {
      delete value._id;
      delete value.passwordHash;
      delete value.tokenHash;
      delete value.csrfTokenHash;
      delete value.stateHash;
      delete value.nonceHash;
      delete value.codeVerifier;
      return value;
    },
  },
} as const;

const userSchema = new Schema(
  {
    id: idField,
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    emailVerifiedAt: { type: Date, default: null },
    passwordHash: { ...nullableString, select: false },
    passwordChangedAt: { type: Date, default: null },
    lastAuthenticatedAt: { type: Date, default: null },
    welcomeEmailSentAt: { type: Date, default: null },
    loginNotificationSentAt: { type: Date, default: null },
  },
  schemaOptions,
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ id: 1 }, { unique: true });

const providerIdentitySchema = new Schema(
  {
    id: idField,
    provider: { type: String, enum: ["GOOGLE", "APPLE"], required: true },
    providerSubject: { type: String, required: true, maxlength: 512 },
    providerEmail: {
      type: String,
      default: null,
      lowercase: true,
      maxlength: 254,
    },
    emailVerified: { type: Boolean, required: true, default: false },
    displayName: { type: String, default: null, maxlength: 201 },
    userId: { type: String, required: true, ref: "User" },
  },
  schemaOptions,
);
providerIdentitySchema.index(
  { provider: 1, providerSubject: 1 },
  { unique: true },
);
providerIdentitySchema.index({ userId: 1 });
providerIdentitySchema.index({ id: 1 }, { unique: true });

const sessionSchema = new Schema(
  {
    id: idField,
    tokenHash: { type: String, required: true, select: false, length: 64 },
    csrfTokenHash: { type: String, required: true, select: false, length: 64 },
    userId: { type: String, required: true, ref: "User" },
    expiresAt: { type: Date, required: true },
    idleExpiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    authenticatedAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: null, maxlength: 500 },
    ipAddressHash: { ...nullableString, maxlength: 64 },
  },
  schemaOptions,
);
sessionSchema.index({ id: 1 }, { unique: true });
sessionSchema.index({ tokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: -1 });

const authTokenSchema = new Schema(
  {
    id: idField,
    tokenHash: { type: String, required: true, select: false, length: 64 },
    purpose: {
      type: String,
      enum: ["VERIFY_EMAIL", "RESET_PASSWORD"],
      required: true,
    },
    userId: { type: String, required: true, ref: "User" },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  schemaOptions,
);
authTokenSchema.index({ id: 1 }, { unique: true });
authTokenSchema.index({ tokenHash: 1 }, { unique: true });
authTokenSchema.index({ userId: 1, purpose: 1, usedAt: 1 });
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const oauthChallengeSchema = new Schema(
  {
    id: idField,
    stateHash: { type: String, required: true, select: false, length: 64 },
    nonceHash: { type: String, required: true, select: false, length: 64 },
    codeVerifier: {
      type: String,
      required: true,
      select: false,
      maxlength: 256,
    },
    provider: { type: String, enum: ["GOOGLE", "APPLE"], required: true },
    intent: { type: String, enum: ["signin", "signup", "link"], required: true },
    returnTo: { type: String, required: true, maxlength: 2048 },
    userId: { type: String, default: null, ref: "User" },
    expiresAt: { type: Date, required: true },
  },
  schemaOptions,
);
oauthChallengeSchema.index({ id: 1 }, { unique: true });
oauthChallengeSchema.index({ stateHash: 1 }, { unique: true });
oauthChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const rateLimitBucketSchema = new Schema(
  {
    id: { ...idField, default: undefined },
    count: { type: Number, required: true, min: 0 },
    windowStart: { type: Date, required: true },
    blockedUntil: { type: Date, default: null },
  },
  schemaOptions,
);
rateLimitBucketSchema.index({ id: 1 }, { unique: true });
rateLimitBucketSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

const auditEventSchema = new Schema(
  {
    id: idField,
    userId: { type: String, default: null, ref: "User" },
    event: { type: String, required: true, maxlength: 100 },
    outcome: { type: String, enum: ["SUCCESS", "FAILURE"], required: true },
    ipAddressHash: { ...nullableString, maxlength: 64 },
    userAgent: { type: String, default: null, maxlength: 500 },
    metadata: { type: String, default: null, maxlength: 2000 },
  },
  schemaOptions,
);
auditEventSchema.index({ id: 1 }, { unique: true });
auditEventSchema.index({ userId: 1, createdAt: -1 });

export type User = InferSchemaType<typeof userSchema>;
export type ProviderIdentity = InferSchemaType<typeof providerIdentitySchema>;
export type Session = InferSchemaType<typeof sessionSchema>;
export type AuthToken = InferSchemaType<typeof authTokenSchema>;
export type OAuthChallenge = InferSchemaType<typeof oauthChallengeSchema>;
export type RateLimitBucket = InferSchemaType<typeof rateLimitBucketSchema>;
export type AuditEvent = InferSchemaType<typeof auditEventSchema>;
export type OAuthProvider = ProviderIdentity["provider"];
export type TokenPurpose = AuthToken["purpose"];
export type AuditOutcome = AuditEvent["outcome"];

const model = <T>(name: string, schema: Schema<T>): Model<T> =>
  (mongoose.models[name] as Model<T> | undefined) ??
  mongoose.model<T>(name, schema);

export const UserModel = model("User", userSchema);
export const ProviderIdentityModel = model(
  "ProviderIdentity",
  providerIdentitySchema,
);
export const SessionModel = model("Session", sessionSchema);
export const AuthTokenModel = model("AuthToken", authTokenSchema);
export const OAuthChallengeModel = model(
  "OAuthChallenge",
  oauthChallengeSchema,
);
export const RateLimitBucketModel = model(
  "RateLimitBucket",
  rateLimitBucketSchema,
);
export const AuditEventModel = model("AuditEvent", auditEventSchema);

export const applicationModels = [
  UserModel,
  ProviderIdentityModel,
  SessionModel,
  AuthTokenModel,
  OAuthChallengeModel,
  RateLimitBucketModel,
  AuditEventModel,
  ...productModels,
];
