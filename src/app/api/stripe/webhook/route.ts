import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/ai/providers";
import {
  billingLog,
  stripeErrorContext,
  syncStripeCheckoutSession,
  syncStripeInvoice,
  syncStripeRefund,
  syncStripeSubscription,
} from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import { StripeWebhookEventModel } from "@/models";

export const runtime = "nodejs";

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown webhook error";

const stripeId = (value: string | { id: string } | null | undefined) =>
  typeof value === "string" ? value : value?.id;

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
  let processingToken: string | undefined;
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
    await connectToDatabase();
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + 5 * 60_000);
    processingToken = randomUUID();
    const claimed = await StripeWebhookEventModel.findOneAndUpdate(
      {
        id: event.id,
        $or: [
          { status: "failed" },
          { status: "processing", processingLeaseUntil: { $lte: now } },
        ],
      },
      { $set: { status: "processing", processingLeaseUntil: leaseUntil, processingToken, error: null } },
      { new: true, runValidators: true },
    );
    const inserted = claimed ?? (await StripeWebhookEventModel.create({
      id: event.id,
      type: event.type,
      status: "processing",
      processingLeaseUntil: leaseUntil,
      processingToken,
    }));
    const wasClaimed = inserted.processingToken === processingToken;
    if (!wasClaimed) {
      billingLog("info", "webhook_duplicate_ignored", {
        requestId,
        eventId: event.id,
        eventType: event.type,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await syncStripeCheckoutSession(event.data.object, event);
        const subscriptionId = stripeId(event.data.object.subscription);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(subscription, event);
        }
        break;
      }

      case "checkout.session.expired":
        await syncStripeCheckoutSession(event.data.object, event);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object, event);
        break;

      case "invoice.paid":
      case "invoice.payment_succeeded": {
        await syncStripeInvoice(event.data.object, "paid");
        const subscriptionId = invoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(subscription, event);
        }
        break;
      }

      case "invoice_payment.paid": {
        const invoicePayment = event.data.object;
        const invoiceId = stripeId(invoicePayment.invoice);
        if (!invoiceId) {
          billingLog("info", "invoice_payment_without_invoice", {
            requestId,
            eventId: event.id,
            invoicePaymentId: invoicePayment.id,
          });
          break;
        }
        const invoice = await stripe.invoices.retrieve(invoiceId);
        await syncStripeInvoice(invoice, "paid");
        const subscriptionId = invoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(subscription, event);
        }
        break;
      }

      case "invoice.payment_failed":
      case "invoice.payment_action_required": {
        await syncStripeInvoice(event.data.object, "failed");
        const subscriptionId = invoiceSubscriptionId(event.data.object);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(subscription, event);
        }
        break;
      }

      case "charge.refunded":
        await syncStripeRefund(event.data.object);
        break;

      default:
        billingLog("info", "webhook_ignored", {
          requestId,
          eventId: event.id,
          eventType: event.type,
        });
    }

    await StripeWebhookEventModel.updateOne(
      { id: event.id, status: "processing", processingToken },
      { $set: { status: "processed", processedAt: new Date(), processingLeaseUntil: null, processingToken: null } },
    );

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    await StripeWebhookEventModel.updateOne(
      { id: event.id, status: "processing", processingToken },
      {
        $set: {
          status: "failed",
          error: messageFromError(error).slice(0, 1_000),
          processingLeaseUntil: null,
          processingToken: null,
        },
      },
    ).catch((recordError: unknown) =>
      billingLog("error", "webhook_failure_record_failed", {
        eventId: event.id,
        ...stripeErrorContext(recordError),
      }),
    );
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
