export type PlanId = "free" | "pro";

export type BillingLimits = {
  tokens: number;
  images: number;
  pages: number;
};

export type BillingCatalog = {
  configured: boolean;
  proPrice: {
    id: string;
    currency: string;
    unitAmount: number;
    interval: "day" | "week" | "month" | "year";
    intervalCount: number;
  } | null;
  limits: Record<PlanId, BillingLimits>;
};

export type Plan = {
  id: PlanId;
  title: string;
  desc: string;
  badge?: string;
};

export const PRO_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

export const getEffectivePlan = (input: {
  plan?: string | null;
  status?: string | null;
  stripePriceId?: string | null;
  configuredPriceId?: string | null;
}): PlanId =>
  Boolean(input.configuredPriceId) &&
  input.plan === "pro" &&
  PRO_SUBSCRIPTION_STATUSES.includes(
    input.status as (typeof PRO_SUBSCRIPTION_STATUSES)[number],
  ) &&
  input.stripePriceId === input.configuredPriceId
    ? "pro"
    : "free";

export const hasProEntitlementForPrice = (input: {
  plan?: string | null;
  status?: string | null;
  stripePriceId?: string | null;
  configuredPriceId?: string | null;
}) => getEffectivePlan(input) === "pro";

export const PLANS: Plan[] = [
  {
    id: "free",
    title: "Free",
    desc: "Get started with the core Luro AI creation tools.",
  },
  {
    id: "pro",
    title: "Pro",
    desc: "Higher monthly allowances for serious creative work.",
    badge: "Recommended",
  },
];

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const getPlanFeatures = (
  plan: PlanId,
  limits?: BillingLimits,
): string[] => {
  const qualitativeFeatures =
    plan === "free"
      ? ["Core AI creation tools", "Standard processing"]
      : ["All AI creation tools", "Higher usage capacity"];

  if (!limits) return qualitativeFeatures;

  const prefix = plan === "free" ? "Up to" : "Includes";
  return [
    `${prefix} ${compactNumber.format(limits.tokens)} AI tokens per month`,
    `${prefix} ${compactNumber.format(limits.images)} generated images per month`,
    `${prefix} ${compactNumber.format(limits.pages)} PDF pages per month`,
    ...qualitativeFeatures,
  ];
};

export const formatPrice = (
  unitAmount: number,
  currency: string,
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  }).format(unitAmount / 100);

export const formatInterval = (
  interval: NonNullable<BillingCatalog["proPrice"]>["interval"],
) =>
  interval === "day"
    ? "day"
    : interval === "week"
      ? "week"
      : interval === "year"
        ? "year"
        : "month";
