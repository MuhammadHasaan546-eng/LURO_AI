import { randomUUID } from "node:crypto";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const idField = {
  type: String,
  default: randomUUID,
  immutable: true,
  required: true,
} as const;
const ownerField = { type: String, required: true, ref: "User" } as const;
const tokenFields = {
  model: { type: String, required: true, maxlength: 100 },
  inputTokens: { type: Number, default: 0, min: 0 },
  outputTokens: { type: Number, default: 0, min: 0 },
} as const;
const schemaOptions = {
  id: false,
  versionKey: false,
  timestamps: true,
  toJSON: {
    transform: (_document: unknown, value: Record<string, unknown>) => {
      delete value._id;
      delete value.embedding;
      return value;
    },
  },
} as const;

const messageSchema = new Schema(
  {
    id: idField,
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true, maxlength: 100_000 },
    status: {
      type: String,
      enum: ["complete", "stopped", "error"],
      default: "complete",
      required: true,
    },
    model: { type: String, default: null, maxlength: 100 },
    inputTokens: { type: Number, default: 0, min: 0 },
    outputTokens: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false, id: false, versionKey: false },
);

const chatSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    title: { type: String, required: true, trim: true, maxlength: 120 },
    messages: { type: [messageSchema], default: [] },
    archivedAt: { type: Date, default: null },
  },
  schemaOptions,
);
chatSchema.index({ id: 1 }, { unique: true });
chatSchema.index({ userId: 1, updatedAt: -1 });

const generationSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    platform: {
      type: String,
      enum: ["x", "linkedin", "instagram", "facebook", "general"],
      required: true,
    },
    format: { type: String, required: true, maxlength: 50 },
    tone: { type: String, required: true, maxlength: 50 },
    topic: { type: String, required: true, maxlength: 10_000 },
    content: { type: String, required: true, maxlength: 100_000 },
    ...tokenFields,
  },
  schemaOptions,
);
generationSchema.index({ id: 1 }, { unique: true });
generationSchema.index({ userId: 1, createdAt: -1 });

const emailSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    purpose: { type: String, required: true, maxlength: 100 },
    tone: { type: String, required: true, maxlength: 50 },
    recipient: { type: String, default: null, maxlength: 254 },
    context: { type: String, required: true, maxlength: 20_000 },
    subject: { type: String, required: true, maxlength: 300 },
    body: { type: String, required: true, maxlength: 100_000 },
    ...tokenFields,
  },
  schemaOptions,
);
emailSchema.index({ id: 1 }, { unique: true });
emailSchema.index({ userId: 1, createdAt: -1 });

const translationSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    sourceLanguage: { type: String, required: true, maxlength: 80 },
    targetLanguage: { type: String, required: true, maxlength: 80 },
    sourceText: { type: String, required: true, maxlength: 50_000 },
    translatedText: { type: String, required: true, maxlength: 100_000 },
    ...tokenFields,
  },
  schemaOptions,
);
translationSchema.index({ id: 1 }, { unique: true });
translationSchema.index({ userId: 1, createdAt: -1 });

const imageSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    prompt: { type: String, required: true, maxlength: 8_000 },
    enhancedPrompt: { type: String, default: null, maxlength: 8_000 },
    category: { type: String, required: true, maxlength: 80 },
    size: {
      type: String,
      enum: ["1024x1024", "1024x1536", "1536x1024"],
      required: true,
    },
    quality: { type: String, enum: ["medium", "high"], required: true },
    cloudinaryPublicId: { type: String, required: true, maxlength: 500 },
    secureUrl: { type: String, required: true, maxlength: 2_048 },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
    model: { type: String, required: true, maxlength: 100 },
  },
  schemaOptions,
);
imageSchema.index({ id: 1 }, { unique: true });
imageSchema.index({ userId: 1, createdAt: -1 });

const documentSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    name: { type: String, required: true, trim: true, maxlength: 255 },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      required: true,
    },
    pageCount: { type: Number, default: 0, min: 0 },
    chunkCount: { type: Number, default: 0, min: 0 },
    byteSize: { type: Number, required: true, min: 1 },
    error: { type: String, default: null, maxlength: 1_000 },
  },
  schemaOptions,
);
documentSchema.index({ id: 1 }, { unique: true });
documentSchema.index({ userId: 1, createdAt: -1 });

const documentChunkSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    documentId: { type: String, required: true, ref: "Document" },
    chunkIndex: { type: Number, required: true, min: 0 },
    page: { type: Number, required: true, min: 1 },
    content: { type: String, required: true, maxlength: 20_000 },
    embedding: { type: [Number], required: true, select: false },
  },
  schemaOptions,
);
documentChunkSchema.index({ id: 1 }, { unique: true });
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
documentChunkSchema.index({ userId: 1, documentId: 1 });

const citationSchema = new Schema(
  {
    chunkId: { type: String, required: true },
    chunkIndex: { type: Number, required: true, min: 0 },
    page: { type: Number, required: true, min: 1 },
    excerpt: { type: String, required: true, maxlength: 1_000 },
    score: { type: Number, required: true, min: -1, max: 1 },
  },
  { _id: false, id: false },
);
const documentQuestionSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    documentId: { type: String, required: true, ref: "Document" },
    question: { type: String, required: true, maxlength: 8_000 },
    answer: { type: String, required: true, maxlength: 100_000 },
    citations: { type: [citationSchema], default: [] },
    ...tokenFields,
  },
  schemaOptions,
);
documentQuestionSchema.index({ id: 1 }, { unique: true });
documentQuestionSchema.index({ userId: 1, documentId: 1, createdAt: -1 });

const usageSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    feature: {
      type: String,
      enum: ["chat", "social", "email", "translation", "image", "pdf"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["tokens", "images", "pages"], required: true },
    model: { type: String, required: true, maxlength: 100 },
    resourceId: { type: String, default: null, maxlength: 100 },
    period: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  },
  schemaOptions,
);
usageSchema.index({ id: 1 }, { unique: true });
usageSchema.index({ userId: 1, period: 1, feature: 1, unit: 1 });

const subscriptionSchema = new Schema(
  {
    id: idField,
    userId: ownerField,
    stripeCustomerId: { type: String, required: true, maxlength: 255 },
    stripeCheckoutSessionId: { type: String, default: null, maxlength: 255 },
    stripeCheckoutSessionStatus: {
      type: String,
      enum: ["open", "complete", "expired", null],
      default: null,
    },
    stripeCheckoutUrl: { type: String, default: null, maxlength: 2048 },
    stripeSubscriptionId: { type: String, default: null, maxlength: 255 },
    stripePriceId: { type: String, default: null, maxlength: 255 },
    entitled: { type: Boolean, default: false, required: true },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "inactive",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
      ],
      default: "inactive",
      required: true,
    },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  schemaOptions,
);
subscriptionSchema.index({ id: 1 }, { unique: true });
subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ stripeCustomerId: 1 }, { unique: true });
subscriptionSchema.index({ stripeCheckoutSessionId: 1 }, { unique: true, sparse: true });
subscriptionSchema.index(
  { stripeSubscriptionId: 1 },
  { unique: true, sparse: true },
);

export type Chat = InferSchemaType<typeof chatSchema>;
export type Generation = InferSchemaType<typeof generationSchema>;
export type Email = InferSchemaType<typeof emailSchema>;
export type Translation = InferSchemaType<typeof translationSchema>;
export type Image = InferSchemaType<typeof imageSchema>;
export type Document = InferSchemaType<typeof documentSchema>;
export type DocumentChunk = InferSchemaType<typeof documentChunkSchema>;
export type DocumentQuestion = InferSchemaType<typeof documentQuestionSchema>;
export type Usage = InferSchemaType<typeof usageSchema>;
export type Subscription = InferSchemaType<typeof subscriptionSchema>;

const model = <T>(name: string, schema: Schema<T>): Model<T> =>
  (mongoose.models[name] as Model<T> | undefined) ??
  mongoose.model<T>(name, schema);

export const ChatModel = model("Chat", chatSchema);
export const GenerationModel = model("Generation", generationSchema);
export const EmailModel = model("Email", emailSchema);
export const TranslationModel = model("Translation", translationSchema);
export const ImageModel = model("Image", imageSchema);
export const DocumentModel = model("Document", documentSchema);
export const DocumentChunkModel = model("DocumentChunk", documentChunkSchema);
export const DocumentQuestionModel = model(
  "DocumentQuestion",
  documentQuestionSchema,
);
export const UsageModel = model("Usage", usageSchema);
export const SubscriptionModel = model("Subscription", subscriptionSchema);

export const productModels = [
  ChatModel,
  GenerationModel,
  EmailModel,
  TranslationModel,
  ImageModel,
  DocumentModel,
  DocumentChunkModel,
  DocumentQuestionModel,
  UsageModel,
  SubscriptionModel,
];
