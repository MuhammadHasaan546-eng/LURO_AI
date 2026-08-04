import "server-only";

import { PDFParse } from "pdf-parse";
import { env } from "@/lib/env";
import {
  completeText,
  cosineSimilarity,
  embedTexts,
} from "@/lib/ai/generation";
import { HttpError } from "@/lib/ai/http";
import { assertUsageAvailable, recordUsage } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import {
  DocumentChunkModel,
  DocumentModel,
  DocumentQuestionModel,
} from "@/models";

const splitText = (text: string, size = 1_500, overlap = 200) => {
  const normalized = text
    .replace(/\0/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
  const chunks: string[] = [];
  for (let start = 0; start < normalized.length; start += size - overlap)
    chunks.push(normalized.slice(start, start + size));
  return chunks.filter(Boolean).slice(0, 500);
};

export const ingestPdf = async (userId: string, file: File) => {
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  )
    throw new HttpError(400, "INVALID_FILE", "Only PDF files are supported.");
  if (file.size < 1 || file.size > env.APP_MAX_PDF_BYTES)
    throw new HttpError(
      413,
      "FILE_TOO_LARGE",
      "PDF exceeds the configured file size limit.",
    );
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
  try {
    const result = await parser.getText();
    const pageCount = result.pages.length;
    await assertUsageAvailable(userId, "pages", pageCount);
    const chunks = splitText(result.text);
    if (!chunks.length)
      throw new HttpError(
        422,
        "PDF_TEXT_EMPTY",
        "No extractable text was found.",
      );
    await connectToDatabase();
    const document = await DocumentModel.create({
      userId,
      name: file.name,
      status: "processing",
      pageCount,
      chunkCount: chunks.length,
      byteSize: file.size,
    });
    try {
      const embeddings: number[][] = [];
      for (let offset = 0; offset < chunks.length; offset += 50)
        embeddings.push(
          ...(await embedTexts(chunks.slice(offset, offset + 50))),
        );
      await DocumentChunkModel.insertMany(
        chunks.map((content, index) => ({
          userId,
          documentId: document.id,
          chunkIndex: index,
          page: Math.min(
            pageCount,
            Math.max(1, Math.floor((index / chunks.length) * pageCount) + 1),
          ),
          content,
          embedding: embeddings[index],
        })),
      );
      document.status = "ready";
      await document.save();
      await recordUsage({
        userId,
        feature: "pdf",
        quantity: pageCount,
        unit: "pages",
        model: env.OPENAI_EMBEDDING_MODEL,
        resourceId: document.id,
      });
      return document;
    } catch (error) {
      document.status = "failed";
      document.error = "Document processing failed.";
      await document.save();
      throw error;
    }
  } finally {
    await parser.destroy();
  }
};

export const askDocument = async (
  userId: string,
  documentId: string,
  question: string,
) => {
  await connectToDatabase();
  const document = await DocumentModel.findOne({
    id: documentId,
    userId,
    status: "ready",
  }).lean();
  if (!document) throw new HttpError(404, "NOT_FOUND", "Document not found.");
  const [queryEmbedding] = await embedTexts([question]);
  const chunks = await DocumentChunkModel.find({ userId, documentId })
    .select("+embedding")
    .lean();
  const ranked = chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const context = ranked
    .map(
      ({ chunk }, index) =>
        `[${index + 1}] Page ${chunk.page}\n${chunk.content}`,
    )
    .join("\n\n");
  const result = await completeText({
    userId,
    feature: "pdf",
    system:
      "Answer only from the supplied document excerpts. If the answer is absent, say so. Cite sources inline using [1], [2].",
    prompt: `Excerpts:\n${context}\n\nQuestion: ${question}`,
    resourceId: documentId,
  });
  const citations = ranked.map(({ chunk, score }) => ({
    chunkId: chunk.id,
    chunkIndex: chunk.chunkIndex,
    page: chunk.page,
    excerpt: chunk.content.slice(0, 500),
    score,
  }));
  return DocumentQuestionModel.create({
    userId,
    documentId,
    question,
    answer: result.content,
    citations,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });
};
