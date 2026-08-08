import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { getStripe } from "@/lib/ai/providers";
import { requireAiSession } from "@/lib/ai/http";
import { getOrCreateCustomer } from "@/lib/billing";
import { connectToDatabase } from "@/lib/mongoose";
import { SubscriptionModel } from "@/models";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Session check
    const session = await requireAiSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 2. Price ID check from env
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      console.error("[Checkout API Error]: STRIPE_PRO_PRICE_ID missing in env");
      return NextResponse.json(
        { success: false, error: "PRICE_ID_MISSING" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 3. Get or Create Customer safely
    const userEmail = session.user?.email;
    const customer = await getOrCreateCustomer(session.userId, userEmail);

    if (!customer || !customer.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "CUSTOMER_NOT_FOUND" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 4. Create Stripe Checkout Session
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

  } catch (error: any) {
    console.error("[Checkout Error Details]:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "CHECKOUT_FAILED" },
      { status: 400 }
    );
  }
}