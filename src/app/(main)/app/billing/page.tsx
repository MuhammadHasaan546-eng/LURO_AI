"use client";

import { useState } from "react";
import {
  Check,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  Sparkles,
  Building2,
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

type Subscription = {
  plan: "free" | "pro" | "enterprise";
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Explore the core Luro experience.",
    features: [
      "AI tools to get started",
      "Basic monthly usage",
      "Secure chat history",
    ],
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 20,
    yearlyPrice: 192, // $16/mo billed yearly
    description: "More room for serious creative work.",
    features: [
      "Higher usage limits",
      "Priority image generation",
      "PDF intelligence",
      "Unlimited history",
    ],
    badge: "Recommended",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 99,
    yearlyPrice: 950, // Custom tailored yearly rate
    description: "Tailored solutions for large organizations and agencies.",
    features: [
      "Dedicated account manager",
      "Custom AI model fine-tuning",
      "Enterprise-grade security & SSO",
      "Unlimited team seats",
    ],
    badge: "Custom",
  },
];

export default function BillingPage() {
  const subscription = useApiData<Subscription>("/api/stripe/subscription", {
    plan: "free",
    status: "inactive",
  });
  const [busy, setBusy] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const billingAction = async (endpoint: string) => {
    setBusy(true);
    try {
      const result = await apiRequest<{ url: string }>(endpoint, {
        method: "POST",
        data: {},
      });
      if (result.url) window.location.href = result.url;
    } catch (error) {
      toast.error(getApiError(error, "Unable to open billing."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardPage className="space-y-6">
      <PageHeader
        title="Billing"
        description="Choose the plan that fits your workflow. Manage payments securely through Stripe."
        action={
          subscription.loading ? undefined : subscription.data.plan !==
            "free" ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void billingAction("/api/stripe/portal")}
              className="border-white/10 hover:bg-white/5"
            >
              <ExternalLink className="size-4 mr-1.5" />
              Manage subscription
            </Button>
          ) : undefined
        }
      />

      {subscription.error ? (
        <ErrorState message={subscription.error} retry={subscription.retry} />
      ) : subscription.loading ? (
        <LoadingState label="Loading subscription" />
      ) : (
        <>
          {/* Current Subscription Banner */}
          <Card className="border-violet-500/20 bg-violet-500/10 backdrop-blur">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="size-4 text-violet-400" />
                  Current plan:{" "}
                  <span className="capitalize text-violet-200 font-semibold">
                    {subscription.data.plan}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription.data.status === "active"
                    ? `Your ${subscription.data.plan} workspace is active and fully unlocked.`
                    : "Upgrade your plan when you need more capacity and advanced features."}
                </p>
              </div>
              {subscription.data.plan !== "free" &&
                subscription.data.currentPeriodEnd && (
                  <p className="text-xs font-mono text-muted-foreground bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10">
                    Renews on{" "}
                    {new Date(
                      subscription.data.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex items-center justify-center gap-3 py-2">
            <span
              className={`text-xs sm:text-sm font-medium transition-colors ${
                !isYearly ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 rounded-full bg-slate-800 border border-violet-500/30 p-0.5 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer"
              aria-label="Toggle billing interval"
            >
              <div
                className={`w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 shadow-md transform transition-transform duration-200 ease-in-out ${
                  isYearly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                Save 20%
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
            {plans.map((plan) => {
              const isPro = plan.id === "pro";
              const isEnterprise = plan.id === "enterprise";
              const price = isYearly && plan.yearlyPrice > 0
                ? Math.round(plan.yearlyPrice / 12)
                : plan.monthlyPrice;
              const isCurrentPlan = plan.id === subscription.data.plan;

              return (
                <Card
                  key={plan.name}
                  className={`relative border bg-white/[0.02] shadow-2xl backdrop-blur p-2 transition-all flex flex-col justify-between ${
                    isPro || isEnterprise
                      ? "border-violet-500/40 ring-1 ring-violet-500/20 shadow-violet-950/20"
                      : "border-white/10"
                  }`}
                >
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                        {plan.badge && (
                          <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-200">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground min-h-[40px]">
                        {plan.description}
                      </p>

                      {/* Pricing Display */}
                      <div className="flex items-baseline gap-1.5 my-6 pb-6 border-b border-white/10">
                        <span className="text-4xl font-extrabold text-foreground">
                          ${price}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">
                          / month
                        </span>
                        {isYearly && plan.yearlyPrice > 0 && (
                          <span className="text-xs text-muted-foreground ml-auto font-mono">
                            Billed ${plan.yearlyPrice}/yr
                          </span>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          What's included
                        </p>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5">
                              <Check className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                              <span className="text-foreground/90">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full py-5 font-semibold transition-all ${
                        (isPro || isEnterprise) && !isCurrentPlan
                          ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-500/20"
                          : "bg-white/[0.05] hover:bg-white/10 text-foreground border border-white/10"
                      }`}
                      variant={isPro || isEnterprise ? "default" : "outline"}
                      disabled={busy || isCurrentPlan}
                      onClick={() =>
                        (isPro || isEnterprise) && void billingAction("/api/stripe/checkout")
                      }
                    >
                      {isEnterprise ? (
                        <Building2 className="size-4 mr-2" />
                      ) : (
                        <CreditCard className="size-4 mr-2" />
                      )}
                      {isCurrentPlan
                        ? "Current plan"
                        : busy
                        ? "Processing..."
                        : isEnterprise
                        ? "Upgrade to Enterprise"
                        : "Upgrade to Pro"}
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