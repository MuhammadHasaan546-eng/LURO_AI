import "server-only";

import Stripe from "stripe";
import { hasProEntitlementForPrice } from "@/app/constant/pricing";
import { getStripe } from "@/lib/ai/providers";
import { env } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel, UserModel } from "@/models";

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
  const entry = JSON.stringify({ scope: "billing", event, ...context });
  if (level === "error") console.error(entry);
  else console.info(entry);
};

type StripeErrorLike = {
  type?: unknown;
  code?: unknown;
  requestId?: unknown;
  statusCode?: unknown;
};

const isStripeErrorLike = (value: unknown): value is StripeErrorLike =>
  typeof value === "object" && value !== null;

/**
 * Produces a deliberately message-free logging context. Provider and database
 * errors can embed request bodies, credentials, collection names, or query
 * details in their messages, so billing logs retain only bounded metadata.
 */
export const stripeErrorContext = (error: unknown) => {
  if (!error) return { errorType: "UnknownError" };

  if (isStripeErrorLike(error) && ("type" in error || "code" in error)) {
    return {
      errorType:
        typeof error.type === "string" ? error.type : "StripeError",
      stripeCode: typeof error.code === "string" ? error.code : undefined,
      stripeRequestId:
        typeof error.requestId === "string" ? error.requestId : undefined,
      stripeStatus:
        typeof error.statusCode === "number" ? error.statusCode : undefined,
    };
  }

  return {
    errorType: error instanceof Error ? error.name : "UnknownError",
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

const stripeId = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : value?.id;

const stripeDate = (value: number | null | undefined) =>
  typeof value === "number" ? new Date(value * 1000) : null;

const requireMappedUser = async (userId: string | undefined, source: string) => {
  if (!userId) throw new Error(`No application user mapping for ${source}.`);
  const userExists = await UserModel.exists({ id: userId });
  if (!userExists) throw new Error(`Application user ${userId} for ${source} was not found.`);
  return userId;
};

export const getOrCreateCustomer = async (userId: string, email?: string) => {
  if (!userId) throw new Error("User ID is required to get or create customer.");

  await connectToDatabase();
  let subscription = await SubscriptionModel.findOne({ userId });

  if (subscription?.stripeCustomerId) {
    try {
      const customer = await getStripe().customers.retrieve(
        subscription.stripeCustomerId,
      );
      if (!customer.deleted) return subscription;
    } catch (error: unknown) {
      const code =
        isStripeErrorLike(error) && typeof error.code === "string"
          ? error.code
          : undefined;
      if (code !== "resource_missing") throw error;
      billingLog("info", "stale_customer_replaced", {
        userId,
        stripeCustomerId: subscription.stripeCustomerId,
      });
    }
  }

  const customerPayload: Stripe.CustomerCreateParams = {
    metadata: { userId },
  };
  if (email?.trim()) customerPayload.email = email.trim();

  const customer = await getStripe().customers.create(customerPayload, {
    idempotencyKey: `luro-customer-${userId}`,
  });

  if (subscription) {
    subscription.stripeCustomerId = customer.id;
    await subscription.save();
  } else {
    subscription = await SubscriptionModel.create({
      userId,
      stripeCustomerId: customer.id,
      plan: "free",
      status: "inactive",
      entitled: false,
    });
  }

  return subscription;
};

export const syncStripeCheckoutSession = async (
  checkout: Stripe.Checkout.Session,
  event?: Pick<Stripe.Event, "id" | "created">,
) => {
  const customerId = stripeId(checkout.customer);
  const subscriptionId = stripeId(checkout.subscription);
  if (!customerId) {
    throw new Error(`Checkout session ${checkout.id} has no customer.`);
  }

  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({
    stripeCustomerId: customerId,
  }).lean();
  const existingUserId =
    existing && !Array.isArray(existing) ? existing.userId : undefined;
  const userId = await requireMappedUser(
    checkout.metadata?.userId ||
      checkout.client_reference_id ||
      existingUserId,
    `checkout ${checkout.id}`,
  );

  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        stripeCustomerId: customerId,
        stripeCheckoutSessionId: checkout.id,
        stripeCheckoutSessionStatus: checkout.status,
        stripeCheckoutUrl: checkout.url ?? null,
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        ...(event
          ? {
              lastStripeEventId: event.id,
              lastStripeEventCreated: event.created,
            }
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
  event?: Pick<Stripe.Event, "id" | "created">,
) => {
  const customerId = stripeId(subscription.customer);
  if (!customerId) {
    throw new Error(`Subscription ${subscription.id} has no customer.`);
  }

  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({
    stripeCustomerId: customerId,
  }).lean();
  const existingUserId =
    existing && !Array.isArray(existing) ? existing.userId : undefined;
  const userId = await requireMappedUser(
    subscription.metadata?.userId || existingUserId,
    `subscription ${subscription.id}`,
  );

  const item = subscription.items.data[0];
  const priceId = item ? stripeId(item.price) : undefined;
  const entitled = hasProEntitlement({
    plan: "pro",
    status: subscription.status,
    stripePriceId: priceId,
  });

  const eventFilter = event
    ? {
        $or: [
          { lastStripeEventCreated: { $lte: event.created } },
          { lastStripeEventCreated: { $exists: false } },
        ],
      }
    : {};
  const updated = await SubscriptionModel.findOneAndUpdate(
    { userId, ...eventFilter },
    {
      $set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId ?? null,
        plan: entitled ? "pro" : "free",
        entitled,
        status: subscription.status,
        currentPeriodStart: stripeDate(item?.current_period_start),
        currentPeriodEnd: stripeDate(item?.current_period_end),
        cancelAt: stripeDate(subscription.cancel_at),
        canceledAt: stripeDate(subscription.canceled_at),
        endedAt: stripeDate(subscription.ended_at),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        ...(event
          ? {
              lastStripeEventId: event.id,
              lastStripeEventCreated: event.created,
            }
          : {}),
      },
      $setOnInsert: { userId },
    },
    { upsert: !event, new: true, runValidators: true },
  );
  if (!updated && event) {
    billingLog("info", "stale_subscription_event_ignored", {
      userId,
      stripeSubscriptionId: subscription.id,
      eventId: event.id,
      eventCreated: event.created,
    });
    return;
  }
  billingLog("info", "subscription_synced", {
    userId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    plan: entitled ? "pro" : "free",
    entitled,
  });
};

export const syncStripeInvoice = async (
  invoice: Stripe.Invoice,
  paymentStatus: "paid" | "failed",
) => {
  const customerId = stripeId(invoice.customer);
  if (!customerId) throw new Error(`Invoice ${invoice.id} has no customer.`);

  await connectToDatabase();
  const updated = await SubscriptionModel.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      $set: {
        latestInvoiceId: invoice.id,
        latestPaymentStatus: paymentStatus,
      },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new Error(`No billing profile for invoice ${invoice.id}.`);
};

export const syncStripeRefund = async (charge: Stripe.Charge) => {
  const customerId = stripeId(charge.customer);
  if (!customerId) {
    billingLog("info", "refund_without_customer", { chargeId: charge.id });
    return;
  }

  await connectToDatabase();
  await SubscriptionModel.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      $set: {
        latestPaymentStatus: charge.refunded
          ? "refunded"
          : "partially_refunded",
      },
    },
    { runValidators: true },
  );
};
