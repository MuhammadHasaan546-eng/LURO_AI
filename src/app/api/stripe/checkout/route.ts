import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { requireAiSession } from "@/lib/ai/http";
import {
  getConfiguredProPrice,
  getOrCreateCustomer,
  stripeErrorContext,
} from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    if (!session.userId) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const price = await getConfiguredProPrice();

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
    const appUrl = env.APP_URL;
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${appUrl}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/billing`,
      client_reference_id: session.userId,
      metadata: { userId: session.userId, plan: "pro" },
      subscription_data: { metadata: { userId: session.userId, plan: "pro" } },
      integration_identifier: `luro_pro_${randomBytes(6)
        .toString("base64url")
        .replace(/[^a-z]/gi, "")
        .slice(0, 8)
        .padEnd(8, "x")}`,
    });

    return NextResponse.json({
      success: true,
      data: { url: checkout.url },
    });
  } catch (error: unknown) {
    console.error(
      JSON.stringify({
        scope: "billing",
        event: "checkout_failed",
        ...stripeErrorContext(error),
      }),
    );
    return NextResponse.json(
      {
        success: false,
        code: "CHECKOUT_FAILED",
        message: "Unable to start checkout. Please try again later.",
      },
      { status: 502 },
    );
  }
}
