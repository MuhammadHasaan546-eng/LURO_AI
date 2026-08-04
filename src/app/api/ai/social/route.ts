import { socialSchema, type SocialInput } from "@/lib/ai/contracts";
import { createSocial } from "@/lib/ai/content";
import {
  handleRouteError,
  parseBody,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { GenerationModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAiSession();
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    const items = await GenerationModel.find({
      userId: session.userId,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return successResponse(items, "Social generation history loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "social");
    const input = await parseBody<SocialInput>(request, socialSchema);
    const item = await createSocial(session.userId, input);
    return successResponse(item, "Social content generated.", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
