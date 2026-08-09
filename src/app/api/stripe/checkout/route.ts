import { NextResponse } from "next/server";
import { getStripe } from "@/lib/ai/providers";
import { requireAiSession } from "@/lib/ai/http";
import { getOrCreateCustomer, stripeErrorContext } from "@/lib/billing";

export const runtime = "nodejs";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "CHECKOUT_FAILED";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    if (!session.userId) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      console.error("[Checkout API Error]: STRIPE_PRO_PRICE_ID missing in env");
      return NextResponse.json(
        { success: false, error: "PRICE_ID_MISSING" },
        { status: 400 },
      );
    }

    const customer = await getOrCreateCustomer(
      session.userId,
      session.user?.email,
    );
    if (!customer.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/billing`,
      client_reference_id: session.userId,
      metadata: { userId: session.userId },
      subscription_data: { metadata: { userId: session.userId } },
    });

    return NextResponse.json({
      success: true,
      data: { url: checkout.url },
    });
  } catch (error: unknown) {
    console.error("[Checkout Error Details]", {
      message: errorMessage(error),
      ...stripeErrorContext(error),
    });
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 400 },
    );
  }
}
