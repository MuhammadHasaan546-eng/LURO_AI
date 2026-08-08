import "server-only";

import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { hasProEntitlementForPrice } from "@/app/constant/pricing";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";

export type BillingPrice = {
  id: string;
  currency: string;
  unitAmount: number;
  interval: "day" | "week" | "month" | "year";
  intervalCount: number;
};

export const hasProEntitlement = (input: {
  plan?: string | null;
  status?: string | null;
  stripePriceId?: string | null;
}) =>
  hasProEntitlementForPrice({
    ...input,
    configuredPriceId: env.STRIPE_PRO_PRICE_ID,
  });

export class BillingConfigurationError extends Error {
  readonly code = "BILLING_CONFIGURATION_INVALID";
  readonly status = 503;

  constructor(
    message =
      "Pro checkout is unavailable until a valid Stripe Price ID is configured.",
  ) {
    super(message);
    this.name = "BillingConfigurationError";
  }
}

export const billingLog = (
  level: "info" | "error",
  event: string,
  context: Record<string, unknown> = {},
) => {
  const entry = JSON.stringify({
    scope: "billing",
    event,
    ...context,
  });
  if (level === "error") console.error(entry);
  else console.info(entry);
};

// FULLY SAFE STRIPE ERROR CONTEXT
export const stripeErrorContext = (error: unknown) => {
  if (!error) return { errorType: "UnknownError" };

  if (typeof error === "object" && error !== null && "type" in error && "code" in error) {
    const err = error as any;
    return {
      errorType: err.type || "StripeError",
      stripeCode: err.code,
      stripeRequestId: err.requestId,
      stripeStatus: err.statusCode,
    };
  }

  return {
    errorType: error instanceof Error ? error.name : "UnknownError",
    errorMessage: error instanceof Error ? error.message : String(error),
  };
};

export const getConfiguredProPrice = async (): Promise<BillingPrice> => {
  const priceId = env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID;
  if (!env.STRIPE_SECRET_KEY || !priceId) {
    throw new BillingConfigurationError();
  }

  let price: Stripe.Price;
  try {
    price = await getStripe().prices.retrieve(priceId);
  } catch (error) {
    billingLog("error", "price_validation_failed", {
      priceId,
      ...stripeErrorContext(error),
    });
    throw new BillingConfigurationError();
  }

  const supportedIntervals = ["day", "week", "month", "year"] as const;
  const interval = price.recurring?.interval;
  if (
    !price.active ||
    !price.recurring ||
    price.unit_amount === null ||
    !supportedIntervals.some((value) => value === interval)
  ) {
    billingLog("error", "price_configuration_rejected", {
      priceId: price.id,
      active: price.active,
      recurring: Boolean(price.recurring),
      hasUnitAmount: price.unit_amount !== null,
      interval,
    });
    throw new BillingConfigurationError();
  }

  return {
    id: price.id,
    currency: price.currency,
    unitAmount: price.unit_amount,
    interval: interval as BillingPrice["interval"],
    intervalCount: price.recurring.interval_count,
  };
};

export const getOrCreateCustomer = async (userId: string, email?: string) => {
  if (!userId) throw new Error("User ID is required to get or create customer.");

  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({ userId });

  if (existing?.stripeCustomerId) {
    try {
      const customer = await getStripe().customers.retrieve(
        existing.stripeCustomerId,
      );
      if (!customer.deleted) return existing;
    } catch (error: any) {
      if (error?.code !== "resource_missing") {
        throw error;
      }
      billingLog("info", "stale_customer_replaced", {
        userId,
        stripeCustomerId: existing.stripeCustomerId,
      });
    }
  }

  // Safe email handle (agar email empty/undefined ho)
  const customerPayload: Stripe.CustomerCreateParams = {
    metadata: { userId },
  };
  if (email && typeof email === "string" && email.trim() !== "") {
    customerPayload.email = email.trim();
  }

  const customer = await getStripe().customers.create(
    customerPayload,
    { idempotencyKey: `luro-customer-${userId}` },
  );

  const updatedDoc = await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: { stripeCustomerId: customer.id },
      $setOnInsert: {
        userId,
        plan: "free",
        status: "inactive",
        entitled: false,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  return updatedDoc;
};

export const syncStripeCheckoutSession = async (
  checkout: Stripe.Checkout.Session,
) => {
  const customerId =
    typeof checkout.customer === "string"
      ? checkout.customer
      : checkout.customer?.id;
  await connectToDatabase();
  const existing = customerId
    ? await SubscriptionModel.findOne({ stripeCustomerId: customerId }).lean()
    : null;
  const userId =
    checkout.metadata?.userId ||
    checkout.client_reference_id ||
    (existing && !Array.isArray(existing) ? existing.userId : undefined);
  if (!userId) {
    billingLog("error", "checkout_user_missing", {
      checkoutSessionId: checkout.id,
      stripeCustomerId: customerId,
    });
    return;
  }

  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        stripeCheckoutSessionId: checkout.id,
        stripeCheckoutSessionStatus: checkout.status,
        stripeCheckoutUrl: checkout.url ?? null,
        ...(typeof checkout.subscription === "string"
          ? { stripeSubscriptionId: checkout.subscription }
          : {}),
      },
      $setOnInsert: {
        userId,
        plan: "free",
        status: "inactive",
        entitled: false,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  billingLog("info", "checkout_session_synced", {
    userId,
    checkoutSessionId: checkout.id,
    status: checkout.status,
  });
};

export const syncStripeSubscription = async (
  subscription: Stripe.Subscription,
) => {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  await connectToDatabase();
  const existing = customerId
    ? await SubscriptionModel.findOne({ stripeCustomerId: customerId }).lean()
    : null;
  const userId =
    subscription.metadata?.userId ||
    (existing && !Array.isArray(existing) ? existing.userId : undefined);
  if (!userId) {
    billingLog("error", "subscription_user_missing", {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
    });
    return;
  }
  const item = subscription.items?.data?.[0];
  const periodEnd = (subscription as any).current_period_end || item?.current_period_end;
  const entitled = hasProEntitlement({
    plan: "pro",
    status: subscription.status,
    stripePriceId: item?.price?.id,
  });
  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: item?.price?.id ?? null,
        plan: entitled ? "pro" : "free",
        entitled,
        status: subscription.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  billingLog("info", "subscription_synced", {
    userId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    plan: entitled ? "pro" : "free",
    entitled,
  });
};