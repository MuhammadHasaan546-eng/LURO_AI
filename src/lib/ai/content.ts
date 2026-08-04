import "server-only";

import type {
  EmailInput,
  SocialInput,
  TranslationInput,
} from "@/lib/ai/contracts";
import { completeText, parseJsonObject } from "@/lib/ai/generation";
import { connectToDatabase } from "@/lib/mongoose";
import { EmailModel, GenerationModel, TranslationModel } from "@/models";

export const createSocial = async (userId: string, input: SocialInput) => {
  const result = await completeText({
    userId,
    feature: "social",
    system:
      "Write polished social media content. Return only the requested post, with no preamble.",
    prompt: `Platform: ${input.platform}\nFormat: ${input.format}\nTone: ${input.tone}\nTopic: ${input.topic}`,
  });
  await connectToDatabase();
  return GenerationModel.create({
    userId,
    ...input,
    content: result.content,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });
};

export const createEmail = async (userId: string, input: EmailInput) => {
  const result = await completeText({
    userId,
    feature: "email",
    system:
      "Write a professional email. Return strict JSON with string properties subject and body, and no other text.",
    prompt: `Purpose: ${input.purpose}\nTone: ${input.tone}\nRecipient: ${input.recipient ?? "unspecified"}\nContext: ${input.context}`,
  });
  const parsed = parseJsonObject<{ subject?: unknown; body?: unknown }>(
    result.content,
  );
  if (typeof parsed.subject !== "string" || typeof parsed.body !== "string")
    throw new Error("Invalid email response shape");
  await connectToDatabase();
  return EmailModel.create({
    userId,
    ...input,
    subject: parsed.subject.slice(0, 300),
    body: parsed.body,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });
};

export const createTranslation = async (
  userId: string,
  input: TranslationInput,
) => {
  const result = await completeText({
    userId,
    feature: "translation",
    system:
      "Translate faithfully while preserving formatting, meaning, and tone. Return only the translation.",
    prompt: `Translate from ${input.sourceLanguage} to ${input.targetLanguage}:\n\n${input.text}`,
    maxOutputTokens: 4_000,
  });
  await connectToDatabase();
  return TranslationModel.create({
    userId,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    sourceText: input.text,
    translatedText: result.content,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });
};
