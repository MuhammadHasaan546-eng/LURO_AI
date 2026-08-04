import { env } from "@/lib/env";
import { getStripe } from "@/lib/ai/providers";
import { handleRouteError, HttpError, requireAiSession } from "@/lib/ai/http";
import { getOrCreateCustomer } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireAiSession(request);
    if (!env.STRIPE_PRO_PRICE_ID)
      throw new HttpError(
        503,
        "BILLING_NOT_CONFIGURED",
        "Billing is not configured.",
      );
    const customer = await getOrCreateCustomer(
      session.userId,
      session.user.email,
    );
    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [{ price: env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${env.APP_URL}/app?checkout=success`,
      cancel_url: `${env.APP_URL}/pricing?checkout=canceled`,
      client_reference_id: session.userId,
      subscription_data: { metadata: { userId: session.userId } },
      allow_promotion_codes: true,
    });
    return Response.json({ success: true, data: { url: checkout.url } });
  } catch (error) {
    return handleRouteError(error);
  }
}
