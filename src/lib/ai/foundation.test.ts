import { describe, expect, it } from "vitest";
import {
  generatedEmailSchema,
  imageSchema,
  socialSchema,
  translationSchema,
} from "@/lib/ai/contracts";
import { cosineSimilarity } from "@/lib/ai/vector";
import {
  ChatModel,
  DocumentChunkModel,
  StripeWebhookEventModel,
  SubscriptionModel,
} from "@/models";

describe("AI feature contracts", () => {
  it("rejects oversized and unknown social input", () => {
    expect(
      socialSchema.validate({
        topic: "x".repeat(10_001),
        platform: "x",
        format: "post",
        tone: "clear",
      }).error,
    ).toBeDefined();
    expect(
      socialSchema.validate({
        topic: "hello",
        platform: "x",
        format: "post",
        tone: "clear",
        secret: "no",
      }).error,
    ).toBeDefined();
  });

  it("validates email, translation, and image constraints", () => {
    expect(
      generatedEmailSchema.validate({
        purpose: "intro",
        tone: "warm",
        recipient: "bad",
        context: "hello",
      }).error,
    ).toBeDefined();
    expect(
      translationSchema.validate({
        sourceLanguage: "en",
        targetLanguage: "fr",
        text: "hello",
      }).error,
    ).toBeUndefined();
    expect(
      imageSchema.validate({ prompt: "scene", size: "1x1" }).error,
    ).toBeDefined();
  });

  it("calculates cosine similarity safely", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1], [1, 2])).toBe(-1);
  });
});

describe("AI model ownership and indexes", () => {
  it("requires resource ownership", async () => {
    await expect(
      new ChatModel({ title: "Missing owner" }).validate(),
    ).rejects.toThrow();
  });

  it("defines document and subscription integrity indexes", () => {
    expect(DocumentChunkModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { documentId: 1, chunkIndex: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
    expect(SubscriptionModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ userId: 1 }, expect.objectContaining({ unique: true })],
        [
          { stripeSubscriptionId: 1 },
          expect.objectContaining({ unique: true, sparse: true }),
        ],
      ]),
    );
    expect(StripeWebhookEventModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ id: 1 }, expect.objectContaining({ unique: true })],
      ]),
    );
  });
});
