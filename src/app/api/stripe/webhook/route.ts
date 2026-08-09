import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/ai/providers";
import {
  billingLog,
  stripeErrorContext,
  syncStripeCheckoutSession,
  syncStripeSubscription,
} from "@/lib/billing";

export const runtime = "nodejs";

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown webhook error";

const invoiceSubscriptionId = (invoice: Stripe.Invoice) => {
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    parent?: {
      subscription_details?: {
        subscription?: string | Stripe.Subscription | null;
      } | null;
    } | null;
  };
  const subscription =
    invoiceWithSubscription.parent?.subscription_details?.subscription ??
    invoiceWithSubscription.subscription;
  return typeof subscription === "string" ? subscription : subscription?.id;
};

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
  } catch (error: unknown) {
    billingLog("error", "webhook_signature_invalid", {
      requestId,
      ...stripeErrorContext(error),
    });
    return new NextResponse(`Webhook Error: ${messageFromError(error)}`, {
      status: 400,
    });
  }

  billingLog("info", "webhook_received", {
    requestId,
    eventId: event.id,
    eventType: event.type,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await syncStripeCheckoutSession(event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object);
        break;

      case "invoice.paid": {
        const subscriptionId = invoiceSubscriptionId(event.data.object);
        if (!subscriptionId) {
          billingLog("info", "invoice_without_subscription", {
            requestId,
            eventId: event.id,
            invoiceId: event.data.object.id,
          });
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(subscription);
        break;
      }

      default:
        billingLog("info", "webhook_ignored", {
          requestId,
          eventId: event.id,
          eventType: event.type,
        });
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    billingLog("error", "webhook_processing_failed", {
      requestId,
      eventId: event.id,
      eventType: event.type,
      ...stripeErrorContext(error),
    });
    return NextResponse.json(
      { received: false, error: "WEBHOOK_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
}
