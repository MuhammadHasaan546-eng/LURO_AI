import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { handleRouteError, HttpError, requireAiSession } from "@/lib/ai/http";
import {
  BillingConfigurationError,
  billingLog,
  getConfiguredProPrice,
  getOrCreateCustomer,
  stripeErrorContext,
} from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const startedAt = Date.now();
  let userId: string | undefined;

  try {
    const session = await requireAiSession(request);
    userId = session.userId;
    const price = await getConfiguredProPrice();

    await connectToDatabase();
    const existing = await SubscriptionModel.findOne({
      userId: session.userId,
    }).lean();
    if (
      existing &&
      !Array.isArray(existing) &&
      existing.plan === "pro" &&
      ["active", "trialing"].includes(existing.status)
    ) {
      throw new HttpError(
        409,
        "SUBSCRIPTION_ALREADY_ACTIVE",
        "Your Pro subscription is already active. Manage it from the billing portal.",
      );
    }

    const customer = await getOrCreateCustomer(
      session.userId,
      session.user.email,
    );
    if (!customer) throw new Error("Billing profile could not be created.");

    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${env.APP_URL}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/app/billing?checkout=canceled`,
      client_reference_id: session.userId,
      metadata: { userId: session.userId },
      subscription_data: { metadata: { userId: session.userId } },
      allow_promotion_codes: true,
      after_expiration: { recovery: { enabled: true } },
    });
    if (!checkout.url) {
      throw new Error("Stripe checkout session did not include a redirect URL.");
    }

    billingLog("info", "checkout_created", {
      requestId,
      userId,
      checkoutSessionId: checkout.id,
      priceId: price.id,
      durationMs: Date.now() - startedAt,
    });
    return successResponse({ url: checkout.url }, "Checkout session created.");
  } catch (error) {
    billingLog("error", "checkout_failed", {
      requestId,
      userId,
      durationMs: Date.now() - startedAt,
      ...stripeErrorContext(error),
    });
    if (error instanceof BillingConfigurationError) {
      return errorResponse(error.code, error.message, error.status);
    }
    if (error instanceof Stripe.errors.StripeError) {
      return errorResponse(
        "STRIPE_REQUEST_FAILED",
        "Stripe could not start checkout. Please try again shortly.",
        502,
      );
    }
    return handleRouteError(error);
  }
}
