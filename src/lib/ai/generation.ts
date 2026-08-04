import "server-only";

import { env } from "@/lib/env";
import { getOpenAI } from "@/lib/ai/providers";
import {
  assertUsageAvailable,
  recordUsage,
  type UsageFeature,
} from "@/lib/ai/usage";
import { HttpError } from "@/lib/ai/http";

export type CompletionResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
};

export const completeText = async (input: {
  userId: string;
  feature: Exclude<UsageFeature, "image" | "pdf"> | "pdf";
  system: string;
  prompt: string;
  resourceId?: string;
  maxOutputTokens?: number;
}): Promise<CompletionResult> => {
  await assertUsageAvailable(input.userId, "tokens", 1);
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.prompt },
    ],
    max_completion_tokens: Math.min(input.maxOutputTokens ?? 2_000, 4_000),
  });
  const content = response.choices[0]?.message.content?.trim();
  if (!content)
    throw new HttpError(
      502,
      "EMPTY_PROVIDER_RESPONSE",
      "AI provider returned no content.",
    );
  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;
  await recordUsage({
    userId: input.userId,
    feature: input.feature,
    quantity: inputTokens + outputTokens,
    unit: "tokens",
    model: response.model,
    resourceId: input.resourceId,
  });
  return { content, inputTokens, outputTokens, model: response.model };
};

export const parseJsonObject = <T>(content: string): T => {
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    const value: unknown = JSON.parse(cleaned);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value as T;
  } catch {
    throw new HttpError(
      502,
      "INVALID_PROVIDER_RESPONSE",
      "AI provider returned an invalid response.",
    );
  }
};

export const cosineSimilarity = (a: number[], b: number[]) => {
  if (!a.length || a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] ** 2;
    normB += b[index] ** 2;
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : -1;
};

export const embedTexts = async (texts: string[]) => {
  if (!texts.length || texts.length > 100)
    throw new HttpError(
      400,
      "INVALID_EMBEDDING_BATCH",
      "Invalid embedding batch.",
    );
  const response = await getOpenAI().embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((item) => item.embedding);
};
