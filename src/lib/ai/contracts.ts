import Joi from "joi";

const strict = { allowUnknown: false, abortEarly: false } as const;
const history = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  before: Joi.date().iso(),
}).options(strict);

export const chatSchema = Joi.object({
  chatId: Joi.string().uuid(),
  message: Joi.string().trim().min(1).max(8_000).required(),
}).options(strict);
export const regenerateChatSchema = Joi.object({
  chatId: Joi.string().uuid().required(),
  messageId: Joi.string().uuid().required(),
}).options(strict);
export const socialSchema = Joi.object({
  topic: Joi.string().trim().min(1).max(10_000).required(),
  platform: Joi.string()
    .valid("x", "linkedin", "instagram", "facebook", "general")
    .required(),
  format: Joi.string().trim().min(1).max(50).required(),
  tone: Joi.string().trim().min(1).max(50).required(),
}).options(strict);
export const generatedEmailSchema = Joi.object({
  purpose: Joi.string().trim().min(1).max(100).required(),
  tone: Joi.string().trim().min(1).max(50).required(),
  recipient: Joi.string().trim().email().max(254).allow("", null),
  context: Joi.string().trim().min(1).max(20_000).required(),
}).options(strict);
export const translationSchema = Joi.object({
  sourceLanguage: Joi.string().trim().min(2).max(80).required(),
  targetLanguage: Joi.string().trim().min(2).max(80).required(),
  text: Joi.string().trim().min(1).max(50_000).required(),
}).options(strict);
export const imageSchema = Joi.object({
  prompt: Joi.string().trim().min(1).max(8_000).required(),
  category: Joi.string().trim().min(1).max(80).default("general"),
  size: Joi.string()
    .valid("1024x1024", "1024x1536", "1536x1024")
    .default("1024x1024"),
  quality: Joi.string().valid("medium", "high").default("medium"),
}).options(strict);
export const regenerateImageSchema = Joi.object({
  imageId: Joi.string().uuid().required(),
}).options(strict);
export const documentQuestionSchema = Joi.object({
  question: Joi.string().trim().min(1).max(8_000).required(),
}).options(strict);
export const idParamSchema = Joi.string().uuid().required();
export const historyQuerySchema = history;

export type ChatInput = { chatId?: string; message: string };
export type RegenerateChatInput = { chatId: string; messageId: string };
export type SocialInput = {
  topic: string;
  platform: "x" | "linkedin" | "instagram" | "facebook" | "general";
  format: string;
  tone: string;
};
export type EmailInput = {
  purpose: string;
  tone: string;
  recipient?: string | null;
  context: string;
};
export type TranslationInput = {
  sourceLanguage: string;
  targetLanguage: string;
  text: string;
};
export type ImageInput = {
  prompt: string;
  category: string;
  size: "1024x1024" | "1024x1536" | "1536x1024";
  quality: "medium" | "high";
};
