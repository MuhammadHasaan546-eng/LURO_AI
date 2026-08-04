"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { useApiData } from "@/lib/dashboard-client";

type Subscription = {
  plan: "free" | "pro";
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};
const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Explore the core Luro experience.",
    features: [
      "AI tools to get started",
      "Basic monthly usage",
      "Secure chat history",
    ],
  },
  {
    name: "Pro",
    price: "$20",
    description: "More room for serious creative work.",
    features: [
      "Higher usage limits",
      "Priority image generation",
      "PDF intelligence",
      "Unlimited history",
    ],
  },
];
export default function BillingPage() {
  const subscription = useApiData<Subscription>("/api/stripe/subscription", {
    plan: "free",
    status: "inactive",
  });
  const [busy, setBusy] = useState(false);
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
    <DashboardPage>
      <PageHeader
        title="Billing"
        description="Choose the plan that fits your workflow. Manage payments securely through Stripe."
        action={
          subscription.loading ? undefined : subscription.data.plan ===
            "pro" ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void billingAction("/api/stripe/portal")}
            >
              <ExternalLink />
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
          <Card className="border-violet-400/20 bg-violet-500/10">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-violet-300" />
                  Current plan:{" "}
                  <span className="capitalize text-violet-200">
                    {subscription.data.plan}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subscription.data.status === "active"
                    ? "Your Pro workspace is active."
                    : "Upgrade when you need more capacity."}
                </p>
              </div>
              {subscription.data.plan === "pro" &&
                subscription.data.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews{" "}
                    {new Date(
                      subscription.data.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </p>
                )}
            </CardContent>
          </Card>
          <div className="grid gap-5 pt-2 lg:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-white/10 bg-white/[0.025] ${plan.name === "Pro" ? "border-violet-400/40 shadow-xl shadow-violet-950/20" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.name === "Pro" && (
                      <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-200">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <p className="pt-3 text-3xl font-semibold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.name === "Pro" ? " / month" : ""}
                    </span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="size-4 shrink-0 text-emerald-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    disabled={
                      busy || plan.name.toLowerCase() === subscription.data.plan
                    }
                    onClick={() =>
                      plan.name === "Pro" &&
                      void billingAction("/api/stripe/checkout")
                    }
                  >
                    <CreditCard />
                    {plan.name.toLowerCase() === subscription.data.plan ? (
                      "Current plan"
                    ) : busy ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Upgrade to Pro"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </DashboardPage>
  );
}
