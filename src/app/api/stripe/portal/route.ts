import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { handleRouteError, HttpError, requireAiSession } from "@/lib/ai/http";
import {
  billingLog,
  stripeErrorContext,
} from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const session = await requireAiSession(request);
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({
      userId: session.userId,
    }).lean();
    if (!subscription || Array.isArray(subscription))
      throw new HttpError(404, "NOT_FOUND", "Billing profile not found.");
    if (!subscription.stripeCustomerId) {
      throw new HttpError(404, "BILLING_PROFILE_INCOMPLETE", "Billing profile is incomplete.");
    }
    const portal = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${env.APP_URL}/app/billing`,
    });
    billingLog("info", "portal_created", {
      requestId,
      userId: session.userId,
      portalCustomerId: subscription.stripeCustomerId,
    });
    return successResponse({ url: portal.url }, "Billing portal created.");
  } catch (error) {
    billingLog("error", "portal_failed", {
      requestId,
      ...stripeErrorContext(error),
    });
    if (error instanceof Stripe.errors.StripeError) {
      return errorResponse(
        "STRIPE_REQUEST_FAILED",
        "Stripe could not open billing management. Please try again shortly.",
        502,
      );
    }
    return handleRouteError(error);
  }
}
