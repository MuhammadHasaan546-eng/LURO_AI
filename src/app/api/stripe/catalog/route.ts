import { env } from "@/lib/env";
import {
  BillingConfigurationError,
  billingLog,
  getConfiguredProPrice,
  stripeErrorContext,
} from "@/lib/billing";
import { errorResponse, successResponse } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const price = await getConfiguredProPrice();
    return successResponse(
      {
        configured: true,
        proPrice: price,
        limits: {
          free: {
            tokens: env.APP_FREE_MONTHLY_TOKENS,
            images: env.APP_FREE_MONTHLY_IMAGES,
            pages: env.APP_FREE_MONTHLY_PDF_PAGES,
          },
          pro: {
            tokens: env.APP_PRO_MONTHLY_TOKENS,
            images: env.APP_PRO_MONTHLY_IMAGES,
            pages: env.APP_PRO_MONTHLY_PDF_PAGES,
          },
        },
      },
      "Billing catalog loaded.",
    );
  } catch (error) {
    billingLog("error", "catalog_load_failed", stripeErrorContext(error));
    if (error instanceof BillingConfigurationError) {
      return successResponse(
        {
          configured: false,
          proPrice: null,
          limits: {
            free: {
              tokens: env.APP_FREE_MONTHLY_TOKENS,
              images: env.APP_FREE_MONTHLY_IMAGES,
              pages: env.APP_FREE_MONTHLY_PDF_PAGES,
            },
            pro: {
              tokens: env.APP_PRO_MONTHLY_TOKENS,
              images: env.APP_PRO_MONTHLY_IMAGES,
              pages: env.APP_PRO_MONTHLY_PDF_PAGES,
            },
          },
        },
        "Free plan details loaded; Pro billing is unavailable.",
      );
    }
    return errorResponse(
      "BILLING_CATALOG_UNAVAILABLE",
      "Billing details are temporarily unavailable.",
      502,
    );
  }
}
