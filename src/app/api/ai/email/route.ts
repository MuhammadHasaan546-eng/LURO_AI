import { generatedEmailSchema, type EmailInput } from "@/lib/ai/contracts";
import { createEmail } from "@/lib/ai/content";
import {
  handleRouteError,
  parseBody,
  parseHistoryQuery,
  requireAiSession,
} from "@/lib/ai/http";
import { enforceAiRateLimit, trustedBeforeFilter } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { EmailModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAiSession();
    const { limit, before } = parseHistoryQuery(request);
    await connectToDatabase();
    const items = await EmailModel.find({
      userId: session.userId,
      ...trustedBeforeFilter(before),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return successResponse(items, "Email generation history loaded.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await enforceAiRateLimit(session.userId, "email");
    const input = await parseBody<EmailInput>(request, generatedEmailSchema);
    const item = await createEmail(session.userId, input);
    return successResponse(item, "Email generated.", 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
