import { describe, expect, it } from "vitest";
import {
  formatInterval,
  formatPrice,
  getPlanFeatures,
  hasProEntitlementForPrice,
} from "@/app/constant/pricing";

describe("billing pricing contract", () => {
  it("formats Stripe minor-unit amounts and intervals", () => {
    expect(formatPrice(2000, "usd")).toBe("$20");
    expect(formatPrice(1999, "usd")).toBe("$19.99");
    expect(formatInterval("month")).toBe("month");
    expect(formatInterval("year")).toBe("year");
  });

  it("derives feature text from the configured usage allowances", () => {
    expect(
      getPlanFeatures("free", { tokens: 50_000, images: 5, pages: 50 }),
    ).toEqual([
      "Up to 50K AI tokens per month",
      "Up to 5 generated images per month",
      "Up to 50 PDF pages per month",
      "Core AI creation tools",
      "Standard processing",
    ]);
    expect(
      getPlanFeatures("pro", { tokens: 1_000_000, images: 100, pages: 2_000 }),
    ).toContain("Includes 1M AI tokens per month");
  });
  it("grants Pro only for the configured price and active Stripe statuses", () => {
    expect(
      hasProEntitlementForPrice({
        plan: "pro",
        status: "active",
        stripePriceId: "price_pro",
        configuredPriceId: "price_pro",
      }),
    ).toBe(true);
    expect(
      hasProEntitlementForPrice({
        plan: "pro",
        status: "canceled",
        stripePriceId: "price_pro",
        configuredPriceId: "price_pro",
      }),
    ).toBe(false);
    expect(
      hasProEntitlementForPrice({
        plan: "pro",
        status: "active",
        stripePriceId: "price_wrong",
        configuredPriceId: "price_pro",
      }),
    ).toBe(false);
  });
});
