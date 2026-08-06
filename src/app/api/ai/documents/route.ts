import { ingestPdf } from "@/lib/ai/documents";
import {
  handleRouteError,
  HttpError,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { DocumentModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAiSession();
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    const documents = await DocumentModel.find({
      userId: session.userId,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return successResponse(documents, "Document history loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "pdf-upload");
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 12_000_000)
      throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Upload is too large.");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      throw new HttpError(400, "INVALID_FILE", "A PDF file is required.");
    const document = await ingestPdf(session.userId, file);
    return successResponse(document, "Document processed.", 201);
  } catch (error) {
    console.error("DETAILED PDF UPLOAD ERROR:", error);
    return handleRouteError(error);
  }
}