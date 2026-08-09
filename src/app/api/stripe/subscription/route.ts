import { NextResponse } from "next/server";
import { handleRouteError, requireAiSession } from "@/lib/ai/http";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel, type Subscription } from "@/models";

type LeanSubscription = Pick<
  Subscription,
  | "plan"
  | "status"
  | "entitled"
  | "currentPeriodEnd"
  | "cancelAtPeriodEnd"
  | "stripeSubscriptionId"
  | "stripeCustomerId"
>;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await requireAiSession();
    await connectToDatabase();

    const subscription = await SubscriptionModel.findOne<LeanSubscription>({
      userId: session.userId,
    })
      .select(
        "plan status entitled currentPeriodEnd cancelAtPeriodEnd stripeSubscriptionId stripeCustomerId",
      )
      .lean();

    const data = {
      plan: subscription?.plan ?? "free",
      status: subscription?.status ?? "inactive",
      entitled: Boolean(subscription?.entitled),
      currentPeriodEnd: subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toISOString()
        : null,
      cancelAtPeriodEnd: Boolean(subscription?.cancelAtPeriodEnd),
      stripeSubscriptionId: subscription?.stripeSubscriptionId ?? null,
      stripeCustomerId: subscription?.stripeCustomerId ?? null,
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