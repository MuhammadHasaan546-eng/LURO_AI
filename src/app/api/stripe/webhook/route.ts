import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { syncStripeSubscription } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET)
    return Response.json(
      { success: false, code: "BILLING_NOT_CONFIGURED" },
      { status: 503 },
    );
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return Response.json(
      { success: false, code: "SIGNATURE_MISSING" },
      { status: 400 },
    );
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json(
      { success: false, code: "SIGNATURE_INVALID" },
      { status: 400 },
    );
  }
  try {
    if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
      ].includes(event.type)
    )
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    return Response.json({ received: true });
  } catch (error) {
    console.error(
      "Stripe webhook processing failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      { success: false, code: "WEBHOOK_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
}
