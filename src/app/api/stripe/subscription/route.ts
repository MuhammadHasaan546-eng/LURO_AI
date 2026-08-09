import { NextResponse } from "next/server";
import { handleRouteError, requireAiSession } from "@/lib/ai/http";
import { usageSummary } from "@/lib/ai/usage";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel, type Subscription } from "@/models";

type LeanSubscription = Pick<
  Subscription,
  | "plan"
  | "status"
  | "entitled"
  | "currentPeriodStart"
  | "currentPeriodEnd"
  | "cancelAt"
  | "canceledAt"
  | "endedAt"
  | "cancelAtPeriodEnd"
  | "stripeSubscriptionId"
  | "stripeCustomerId"
  | "stripePriceId"
  | "latestInvoiceId"
  | "latestPaymentStatus"
>;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await requireAiSession();
    await connectToDatabase();

    const [subscription, usage] = await Promise.all([
      SubscriptionModel.findOne<LeanSubscription>({ userId: session.userId })
        .select(
          "plan status entitled currentPeriodStart currentPeriodEnd cancelAt canceledAt endedAt cancelAtPeriodEnd stripeSubscriptionId stripeCustomerId stripePriceId latestInvoiceId latestPaymentStatus",
        )
        .lean(),
      usageSummary(session.userId),
    ]);

    const data = {
      plan: subscription?.plan ?? "free",
      status: subscription?.status ?? "inactive",
      entitled: Boolean(subscription?.entitled && usage.entitled),
      currentPeriodStart: subscription?.currentPeriodStart
        ? new Date(subscription.currentPeriodStart).toISOString()
        : usage.periodStart,
      currentPeriodEnd: subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toISOString()
        : usage.periodEnd,
      cancelAt: subscription?.cancelAt
        ? new Date(subscription.cancelAt).toISOString()
        : null,
      canceledAt: subscription?.canceledAt
        ? new Date(subscription.canceledAt).toISOString()
        : null,
      endedAt: subscription?.endedAt
        ? new Date(subscription.endedAt).toISOString()
        : null,
      cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
      stripeSubscriptionId: subscription?.stripeSubscriptionId ?? null,
      stripeCustomerId: subscription?.stripeCustomerId ?? null,
      stripePriceId: subscription?.stripePriceId ?? null,
      latestInvoiceId: subscription?.latestInvoiceId ?? null,
      latestPaymentStatus: subscription?.latestPaymentStatus ?? "none",
      usage,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Subscription loaded.",
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}