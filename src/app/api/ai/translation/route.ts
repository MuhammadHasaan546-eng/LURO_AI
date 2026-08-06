import { translationSchema, type TranslationInput } from "@/lib/ai/contracts";
import { createTranslation } from "@/lib/ai/content";
import {
  handleRouteError,
  parseBody,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { TranslationModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAiSession();
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    const items = await TranslationModel.find({
      userId: session.userId,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return successResponse(items, "Translation history loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "translation");
    const input = await parseBody<TranslationInput>(request, translationSchema);
    const item = await createTranslation(session.userId, input);
    return successResponse(item, "Text translated.", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}