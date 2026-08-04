import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { handleRouteError, HttpError, requireAiSession } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({
      userId: session.userId,
    }).lean();
    if (!subscription || Array.isArray(subscription))
      throw new HttpError(404, "NOT_FOUND", "Billing profile not found.");
    const portal = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.APP_URL}/app`,
    });
    return Response.json({ success: true, data: { url: portal.url } });
  } catch (error) {
    return handleRouteError(error);
  }
}
