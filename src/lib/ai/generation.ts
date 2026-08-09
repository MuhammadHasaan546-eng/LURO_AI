import "server-only";

import { env } from "@/lib/env";
import {
  commitUsage,
  releaseUsage,
  reserveUsage,
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
  const maxOutputTokens = Math.min(input.maxOutputTokens ?? 2_000, 4_000);
  const estimatedInputTokens = Math.ceil((input.system.length + input.prompt.length) / 4);
  const reservation = await reserveUsage({
    userId: input.userId,
    feature: input.feature,
    unit: "tokens",
    quantity: estimatedInputTokens + maxOutputTokens,
    model: env.OPENROUTER_CHAT_MODEL,
    resourceId: input.resourceId,
  });

  try {
  const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Aipass AI Saas",
    },
    body: JSON.stringify({
      model: env.OPENROUTER_CHAT_MODEL,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt },
      ],
      max_tokens: maxOutputTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("OpenRouter Chat Error:", errorData);
    throw new HttpError(
      502,
      "PROVIDER_ERROR",
      "AI provider returned an error.",
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content)
    throw new HttpError(
      502,
      "EMPTY_PROVIDER_RESPONSE",
      "AI provider returned no content.",
    );

  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;

  await commitUsage(reservation.id, inputTokens + outputTokens);

  return { content, inputTokens, outputTokens, model: data.model || env.OPENROUTER_CHAT_MODEL };
  } catch (error) {
    await releaseUsage(reservation.id);
    throw error;
  }
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

export const embedTexts = async (texts: string[]) => {
  if (!texts.length || texts.length > 100)
    throw new HttpError(
      400,
      "INVALID_EMBEDDING_BATCH",
      "Invalid embedding batch.",
    );

  const response = await fetch(`${env.OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENROUTER_EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("OpenRouter Embedding Error:", errorData);
    throw new HttpError(
      502,
      "EMBEDDING_PROVIDER_ERROR",
      "Embedding provider returned an error.",
    );
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
};