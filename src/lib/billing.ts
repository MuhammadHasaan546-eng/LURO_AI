import "server-only";

import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";

export type BillingPrice = {
  id: string;
  currency: string;
  unitAmount: number;
  interval: "day" | "week" | "month" | "year";
  intervalCount: number;
};

export const PRO_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

export const hasProEntitlement = (input: {
  plan?: string | null;
  status?: string | null;
  stripePriceId?: string | null;
}) =>
  input.plan === "pro" &&
  PRO_SUBSCRIPTION_STATUSES.includes(
    input.status as (typeof PRO_SUBSCRIPTION_STATUSES)[number],
  ) &&
  input.stripePriceId === env.STRIPE_PRO_PRICE_ID;

export class BillingConfigurationError extends Error {
  readonly code = "BILLING_CONFIGURATION_INVALID";
  readonly status = 503;

  constructor(message = "Billing is temporarily unavailable.") {
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

export const stripeErrorContext = (error: unknown) => {
  if (!(error instanceof Stripe.errors.StripeError)) {
    return { errorType: error instanceof Error ? error.name : "UnknownError" };
  }
  return {
    errorType: error.type,
    stripeCode: error.code,
    stripeRequestId: error.requestId,
    stripeStatus: error.statusCode,
  };
};

export const getConfiguredProPrice = async (): Promise<BillingPrice> => {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRO_PRICE_ID) {
    throw new BillingConfigurationError();
  }

  let price: Stripe.Price;
  try {
    price = await getStripe().prices.retrieve(env.STRIPE_PRO_PRICE_ID);
  } catch (error) {
    billingLog("error", "price_validation_failed", {
      priceId: env.STRIPE_PRO_PRICE_ID,
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

export const getOrCreateCustomer = async (userId: string, email: string) => {
  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({ userId });

  if (existing) {
    try {
      const customer = await getStripe().customers.retrieve(
        existing.stripeCustomerId,
      );
      if (!customer.deleted) return existing;
    } catch (error) {
      if (
        !(error instanceof Stripe.errors.StripeError) ||
        error.code !== "resource_missing"
      ) {
        throw error;
      }
      billingLog("info", "stale_customer_replaced", {
        userId,
        stripeCustomerId: existing.stripeCustomerId,
      });
    }
  }

  const customer = await getStripe().customers.create(
    { email, metadata: { userId } },
    { idempotencyKey: `luro-customer-${userId}` },
  );

  return SubscriptionModel.findOneAndUpdate(
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
      : subscription.customer.id;
  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({
    stripeCustomerId: customerId,
  }).lean();
  const userId =
    subscription.metadata.userId ||
    (existing && !Array.isArray(existing) ? existing.userId : undefined);
  if (!userId) {
    billingLog("error", "subscription_user_missing", {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
    });
    return;
  }
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;
  const entitled = hasProEntitlement({
    plan: "pro",
    status: subscription.status,
    stripePriceId: item?.price.id,
  });
  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: item?.price.id ?? null,
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
