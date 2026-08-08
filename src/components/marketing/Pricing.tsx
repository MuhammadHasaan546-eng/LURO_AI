"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { PLANS, formatInterval, formatPrice, getPlanFeatures, type BillingCatalog } from "@/app/constant/pricing";
import { apiRequest, getApiError } from "@/store/api";

export default function Pricing() {
  const [catalog, setCatalog] = useState<BillingCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void apiRequest<BillingCatalog>("/api/stripe/catalog")
      .then((result) => {
        if (!cancelled) setCatalog(result);
      })
      .catch((error) => {
        if (!cancelled)
          setCatalogError(
            getApiError(error, "Pricing is temporarily unavailable."),
          );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startCheckout = async () => {
    setBusy(true);
    try {
      const result = await apiRequest<{ url: string }>("/api/stripe/checkout", {
        method: "POST",
        data: {},
      });
      window.location.assign(result.url);
    } catch (error) {
      setCatalogError(
        getApiError(error, "Unable to start checkout. Please sign in and try again."),
      );
      setBusy(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-20">
      <div className="mb-8 text-center sm:mb-12">
        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
          Flexible Pricing
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          Simple, Transparent Plans
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
          Start with the core tools and upgrade when you need more monthly capacity.
        </p>
        {catalogError && (
          <p role="alert" className="mx-auto mt-4 max-w-xl text-sm text-amber-300">
            {catalogError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const isPro = plan.id === "pro";
          const price = catalog?.proPrice;
          const features = catalog
            ? getPlanFeatures(plan.id, catalog.limits[plan.id])
            : [];

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 transition-all duration-300 sm:p-8 ${
                isPro
                  ? "border-violet-500/60 shadow-xl shadow-violet-950/40 md:-translate-y-2"
                  : "border-white/10"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span className="rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-600 to-pink-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div>
                <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">{plan.title}</h3>
                <p className="mb-6 min-h-10 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {plan.desc}
                </p>
                <div className="mb-6 flex min-h-20 items-baseline gap-1 border-b border-white/10 pb-6">
                  {isPro && price ? (
                    <>
                      <span className="text-3xl font-extrabold text-white sm:text-5xl">
                        {formatPrice(price.unitAmount, price.currency)}
                      </span>
                      <span className="text-xs font-medium text-slate-400 sm:text-sm">
                        / {price.intervalCount > 1 ? `${price.intervalCount} ` : ""}
                        {formatInterval(price.interval)}
                      </span>
                    </>
                  ) : isPro ? (
                    <span className="text-sm text-slate-400">Price unavailable</span>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-white sm:text-5xl">Free</span>
                      <span className="text-xs font-medium text-slate-400 sm:text-sm">forever</span>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Included features
                  </p>
                  {catalog ? (
                    <ul className="space-y-2.5">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300 sm:text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Loading plan details...</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={busy || !catalog}
                onClick={() => {
                  if (!isPro) {
                    window.location.assign("/auth/signup");
                    return;
                  }
                  if (!catalog?.proPrice) {
                    setCatalogError(
                      "Pro checkout is unavailable until a valid Stripe Price ID is configured.",
                    );
                    return;
                  }
                  void startCheckout();
                }}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-md transition-all sm:text-sm ${
                  isPro
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-violet-900/50 hover:from-violet-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
                    : "border border-white/5 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                {busy && isPro && <LoaderCircle className="size-4 animate-spin" />}
                {isPro
                  ? busy
                    ? "Opening checkout..."
                    : catalog?.proPrice
                      ? "Upgrade to Pro"
                      : "Pro unavailable"
                  : "Get Started"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

