"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  DashboardPage,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { useApiData } from "@/lib/dashboard-client";
import {
  formatInterval,
  formatPrice,
  getPlanFeatures,
  type BillingCatalog,
  type PlanId,
} from "@/app/constant/pricing";

type Subscription = {
  plan: PlanId;
  status:
    | "inactive"
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused";
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
};

const statusText: Record<Subscription["status"], string> = {
  inactive: "You are using the free plan.",
  incomplete: "Your payment is still being confirmed.",
  incomplete_expired: "The initial payment expired. Start checkout again to activate Pro.",
  trialing: "Your Pro trial is active.",
  active: "Your Pro workspace is active.",
  past_due: "Payment is past due. Update your payment method to keep Pro active.",
  canceled: "Your subscription is canceled. You can start Pro again at any time.",
  unpaid: "Payment is unpaid. Update your payment method to restore Pro access.",
  paused: "Your subscription is paused. Update billing to restore Pro access.",
};

export default function BillingPage() {
  const subscription = useApiData<Subscription>("/api/stripe/subscription", {
    plan: "free",
    status: "inactive",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void apiRequest<BillingCatalog>("/api/stripe/catalog")
      .then(setCatalog)
      .catch((error) =>
        setCatalogError(getApiError(error, "Billing details are unavailable.")),
      );
  }, []);

  const billingAction = async (endpoint: string) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ url: string }>(endpoint, {
        method: "POST",
        data: {},
      });
      if (!result.url) throw new Error("Billing redirect was not returned.");
      window.location.assign(result.url);
    } catch (error) {
      toast.error(getApiError(error, "Unable to open billing."));
      setBusy(false);
    }
  };

  const currentPlan = subscription.data.plan;
  const canManage = currentPlan === "pro";
  const isScheduledToCancel = Boolean(
    canManage && subscription.data.cancelAtPeriodEnd,
  );

  return (
    <DashboardPage className="space-y-6">
      <PageHeader
        title="Billing"
        description="Choose the plan that fits your workflow. Manage payments securely through Stripe."
        action={
          subscription.loading || !canManage ? undefined : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void billingAction("/api/stripe/portal")}
              className="border-white/10 hover:bg-white/5"
            >
              <ExternalLink className="mr-1.5 size-4" />
              Manage subscription
            </Button>
          )
        }
      />

      {subscription.error ? (
        <ErrorState message={subscription.error} retry={subscription.retry} />
      ) : subscription.loading || !catalog ? (
        catalogError ? (
          <ErrorState message={catalogError} retry={() => window.location.reload()} />
        ) : (
          <LoadingState label="Loading billing details" />
        )
      ) : (
        <>
          <Card className="border-violet-500/20 bg-violet-500/10 backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="size-4 text-violet-400" />
                  Current plan:
                  <span className="font-semibold capitalize text-violet-200">
                    {currentPlan}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {statusText[subscription.data.status]}
                </p>
              </div>
              {canManage && subscription.data.currentPeriodEnd && (
                <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
                  {isScheduledToCancel ? "Ends on" : "Renews on"}{" "}
                  {new Date(subscription.data.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 pt-2 md:grid-cols-2">
            {(["free", "pro"] as PlanId[]).map((planId) => {
              const isPro = planId === "pro";
              const isCurrentPlan = planId === currentPlan;
              const price = catalog.proPrice;
              const planFeatures = getPlanFeatures(planId, catalog.limits[planId]);

              return (
                <Card
                  key={planId}
                  className={`relative flex flex-col border bg-white/[0.02] p-2 shadow-2xl backdrop-blur ${
                    isPro
                      ? "border-violet-500/40 ring-1 ring-violet-500/20 shadow-violet-950/20"
                      : "border-white/10"
                  }`}
                >
                  <CardContent className="flex h-full flex-col justify-between space-y-6 p-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-foreground">
                          {isPro ? "Pro" : "Free"}
                        </h3>
                        {isPro && (
                          <span className="rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="min-h-10 text-sm text-muted-foreground">
                        {isPro
                          ? "Higher monthly allowances for serious creative work."
                          : "Get started with the core Luro AI creation tools."}
                      </p>
                      <div className="my-6 flex min-h-20 items-baseline gap-1.5 border-b border-white/10 pb-6">
                        {isPro ? (
                          <>
                            <span className="text-4xl font-extrabold text-foreground">
                              {formatPrice(price.unitAmount, price.currency)}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">
                              / {price.intervalCount > 1 ? `${price.intervalCount} ` : ""}
                              {formatInterval(price.interval)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-4xl font-extrabold text-foreground">Free</span>
                            <span className="text-sm font-medium text-muted-foreground">forever</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          What's included
                        </p>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                          {planFeatures.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5">
                              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                              <span className="text-foreground/90">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button
                      className={`w-full py-5 font-semibold transition-all ${
                        isPro && !isCurrentPlan
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-pink-500"
                          : "border border-white/10 bg-white/[0.05] text-foreground hover:bg-white/10"
                      }`}
                      variant={isPro && !isCurrentPlan ? "default" : "outline"}
                      disabled={busy || isCurrentPlan || !isPro}
                      onClick={() => {
                        if (isPro) void billingAction("/api/stripe/checkout");
                      }}
                    >
                      {busy && isPro ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 size-4" />
                      )}
                      {isCurrentPlan
                        ? "Current plan"
                        : busy && isPro
                        ? "Processing..."
                        : isPro
                        ? "Upgrade to Pro"
                        : "Included"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </DashboardPage>
  );
}

