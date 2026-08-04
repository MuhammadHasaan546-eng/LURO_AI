import { handleRouteError, requireAiSession } from "@/lib/ai/http";
import { usageSummary } from "@/lib/ai/usage";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAiSession();
    return successResponse(
      await usageSummary(session.userId),
      "Usage summary loaded.",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
