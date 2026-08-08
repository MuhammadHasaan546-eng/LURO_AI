import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import {
  billingLog,
  stripeErrorContext,
  syncStripeCheckoutSession,
  syncStripeSubscription,
} from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
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
  } catch (error) {
    billingLog("error", "webhook_signature_invalid", {
      requestId,
      ...stripeErrorContext(error),
    });
    return Response.json(
      { success: false, code: "SIGNATURE_INVALID" },
      { status: 400 },
    );
  }
  billingLog("info", "webhook_received", {
    requestId,
    eventId: event.id,
    eventType: event.type,
  });
  try {
    if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
      ].includes(event.type)
    ) {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    } else if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "checkout.session.async_payment_failed",
        "checkout.session.expired",
      ].includes(event.type)
    ) {
      const checkout = event.data.object as Stripe.Checkout.Session;
      await syncStripeCheckoutSession(checkout);
      if (typeof checkout.subscription === "string") {
        const subscription = await getStripe().subscriptions.retrieve(
          checkout.subscription,
        );
        await syncStripeSubscription(subscription);
      }
    } else if (
      ["invoice.paid", "invoice.payment_failed"].includes(event.type)
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceRecord = invoice as unknown as {
        subscription?: string | Stripe.Subscription | null;
        parent?: {
          subscription_details?: {
            subscription?: string | Stripe.Subscription | null;
          };
        } | null;
      };
      const invoiceSubscription =
        invoiceRecord.subscription ??
        invoiceRecord.parent?.subscription_details?.subscription;
      if (invoiceSubscription) {
        const subscriptionId =
          typeof invoiceSubscription === "string"
            ? invoiceSubscription
            : invoiceSubscription.id;
        const subscription = await getStripe().subscriptions.retrieve(
          subscriptionId,
        );
        await syncStripeSubscription(subscription);
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    billingLog("error", "webhook_processing_failed", {
      requestId,
      eventId: event.id,
      eventType: event.type,
      ...stripeErrorContext(error),
    });
    return Response.json(
      { success: false, code: "WEBHOOK_PROCESSING_FAILED" },
      { status: 500 },
    );
  }
}
