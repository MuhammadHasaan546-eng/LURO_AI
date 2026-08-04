import { documentQuestionSchema } from "@/lib/ai/contracts";
import { askDocument } from "@/lib/ai/documents";
import {
  handleRouteError,
  parseBody,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { DocumentQuestionModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const session = await requireAiSession();
    const { id } = await context.params;
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    const items = await DocumentQuestionModel.find({
      userId: session.userId,
      documentId: id,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return successResponse(items, "Document conversation loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "pdf-chat");
    const { id } = await context.params;
    const input = await parseBody<{ question: string }>(
      request,
      documentQuestionSchema,
    );
    const answer = await askDocument(session.userId, id, input.question);
    return successResponse(answer, "Question answered.", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
