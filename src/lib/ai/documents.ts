import "server-only";

import PDFParser from "pdf2json";
import { env } from "@/lib/env";
import { completeText, embedTexts } from "@/lib/ai/generation";
import { cosineSimilarity } from "@/lib/ai/vector";
import { HttpError } from "@/lib/ai/http";
import { commitUsage, releaseUsage, reserveUsage } from "@/lib/ai/usage";
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

// Helper function to extract text using pdf2json (No worker issues)
type PdfTextObject = { R?: Array<{ T?: string }> };
type PdfPage = { Texts?: PdfTextObject[] };
type PdfData = { Pages?: PdfPage[] };
type PdfErrorData = { parserError?: string };

type PdfParserInstance = {
  on(event: "pdfParser_dataError", listener: (error: PdfErrorData) => void): void;
  on(event: "pdfParser_dataReady", listener: (data: PdfData) => void): void;
  parseBuffer(buffer: Buffer): void;
};

type PdfParserConstructor = new () => PdfParserInstance;

const parsePdfBuffer = async (buffer: Buffer): Promise<{ text: string; pageCount: number }> => {
  return new Promise((resolve, reject) => {
    const PdfParser = PDFParser as unknown as PdfParserConstructor;
    const pdfParser = new PdfParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(new Error(errData.parserError || "Failed to parse PDF"));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        let extractedText = "";
        const pages = pdfData.Pages || [];
        
        for (const page of pages) {
          const texts = page.Texts || [];
          for (const textObj of texts) {
            const decoded = decodeURIComponent(textObj.R?.[0]?.T || "");
            extractedText += decoded + " ";
          }
          extractedText += "\n";
        }

        resolve({
          text: extractedText.trim(),
          pageCount: pages.length || 1,
        });
      } catch (e) {
        reject(e);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
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

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { text, pageCount } = await parsePdfBuffer(buffer);
    
    const reservation = await reserveUsage({
      userId,
      feature: "pdf",
      unit: "pages",
      quantity: pageCount,
      model: env.OPENROUTER_EMBEDDING_MODEL,
    });
    const chunks = splitText(text);
    if (!chunks.length) {
      await releaseUsage(reservation.id);
      throw new HttpError(
        422,
        "PDF_TEXT_EMPTY",
        "No extractable text was found.",
      );
    }

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

      await commitUsage(reservation.id, pageCount);
      return document;
    } catch (processingError) {
      await releaseUsage(reservation.id);
      document.status = "failed";
      document.error = "Document processing failed.";
      await document.save();
      throw processingError;
    }
  } catch (parseError) {
    if (parseError instanceof HttpError) throw parseError;
    throw new HttpError(400, "INVALID_PDF", "Could not read or parse the PDF file.");
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