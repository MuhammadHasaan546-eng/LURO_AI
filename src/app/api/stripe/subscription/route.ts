import { handleRouteError, requireAiSession } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAiSession();
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({
      userId: session.userId,
    }).lean();
    return successResponse(
      subscription ?? {
        plan: "free",
        status: "inactive",
        entitled: false,
        cancelAtPeriodEnd: false,
      },
      "Subscription loaded.",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
