import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/ai/providers";
import { billingLog } from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Webhook secret missing", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook Signature Error]:`, err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  billingLog("info", "webhook_received", {
    requestId,
    eventId: event.id,
    eventType: event.type,
  });

  try {
    await connectToDatabase();

    // 1. Checkout Session Completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;

      if (userId) {
        await SubscriptionModel.findOneAndUpdate(
          { userId },
          {
            plan: "pro",
            entitled: true,
            status: "active",
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null,
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? null,
          },
          { upsert: true, new: true }
        );
      }
    }

    // 2. Subscription Events / Invoice Paid
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "invoice.paid"
    ) {
      const item = event.data.object as any;
      const userId = item.metadata?.userId;

      if (userId) {
        const subStatus = item.status ?? "active";
        const isPro = ["active", "trialing"].includes(subStatus);

        await SubscriptionModel.findOneAndUpdate(
          { userId },
          {
            plan: isPro ? "pro" : "free",
            entitled: isPro,
            status: subStatus,
            stripeSubscriptionId: item.subscription || item.id || null,
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Subscription Canceled
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await SubscriptionModel.findOneAndUpdate(
          { userId },
          { plan: "free", entitled: false, status: "canceled" },
          { new: true }
        );
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error(`[Webhook Handler Processing Error]:`, error?.message || error);
    return NextResponse.json({ received: true, error: error?.message });
  }
}