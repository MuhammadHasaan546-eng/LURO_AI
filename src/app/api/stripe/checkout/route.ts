import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { handleRouteError, HttpError, requireAiSession } from "@/lib/ai/http";
import {
  BillingConfigurationError,
  billingLog,
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
    // 1. Session Auth Check
    const session = await requireAiSession(request);
    if (!session || !session.userId) {
      throw new HttpError(401, "UNAUTHORIZED", "User session is invalid or missing.");
    }
    userId = session.userId;

    // 2. Safe Price ID Check
    const rawPriceId = env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRO_PRICE_ID;
    const priceId = typeof rawPriceId === "string" ? rawPriceId.trim() : undefined;

    if (!priceId || !priceId.startsWith("price_")) {
      throw new BillingConfigurationError(
        "STRIPE_PRO_PRICE_ID is missing or invalid. Configure a Stripe Price ID beginning with 'price_'."
      );
    }

    // 3. Database Check
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
        "Your Pro subscription is already active. Manage it from the billing portal."
      );
    }

    // 4. Safe Customer Check
    const userEmail = session.user?.email;
    const customer = await getOrCreateCustomer(session.userId, userEmail);
    
    if (!customer || !customer.stripeCustomerId) {
      throw new Error("Billing profile or Stripe Customer ID could not be retrieved.");
    }

    // 5. Safe Stripe Instance Call
    const stripe = getStripe();
    if (!stripe || !stripe.checkout || !stripe.checkout.sessions) {
      throw new Error("Stripe client failed to initialize properly.");
    }

    const appUrl = env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      client_reference_id: session.userId,
      metadata: { userId: session.userId },
      subscription_data: { metadata: { userId: session.userId } },
    });

    if (!checkout || !checkout.url) {
      throw new Error("Stripe checkout session did not include a redirect URL.");
    }

    billingLog("info", "checkout_created", {
      requestId,
      userId,
      checkoutSessionId: checkout.id,
      priceId,
      durationMs: Date.now() - startedAt,
    });

    return successResponse({ url: checkout.url }, "Checkout session created.");

  } catch (error: any) {
    // Exact Debugging Log for Terminal
    console.error(`[Checkout API Error] [ID: ${requestId}]:`, error);

    // Safe error context execution
    let errContext = {};
    try {
      errContext = stripeErrorContext(error) ?? {};
    } catch {
      errContext = { errorType: error?.name ?? "UnknownError", errorMessage: error?.message };
    }

    billingLog("error", "checkout_failed", {
      requestId,
      userId,
      durationMs: Date.now() - startedAt,
      ...errContext,
    });

    if (error instanceof BillingConfigurationError) {
      return errorResponse(error.code, error.message, error.status);
    }

    if (error instanceof Stripe?.errors?.StripeError) {
      return errorResponse(
        "STRIPE_REQUEST_FAILED",
        "Stripe could not start checkout. Please try again shortly.",
        502
      );
    }

    return handleRouteError(error);
  }
}