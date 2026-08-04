import "server-only";

import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";

export const getOrCreateCustomer = async (userId: string, email: string) => {
  await connectToDatabase();
  const existing = await SubscriptionModel.findOne({ userId });
  if (existing) return existing;
  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  });
  return SubscriptionModel.create({
    userId,
    stripeCustomerId: customer.id,
    plan: "free",
    status: "inactive",
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
  if (!userId) return;
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;
  const active = ["active", "trialing"].includes(subscription.status);
  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: item?.price.id ?? null,
        plan:
          active && item?.price.id === env.STRIPE_PRO_PRICE_ID ? "pro" : "free",
        status: subscription.status,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
};
