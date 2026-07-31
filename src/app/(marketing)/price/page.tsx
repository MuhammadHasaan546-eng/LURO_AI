"use client";

import { PLANS } from "@/app/constant/pricing";
import React, { useState } from "react";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative w-full py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full uppercase tracking-wider">
          Flexible Pricing
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Simple, Transparent Plans
        </h2>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          Choose the plan that fits your growth strategy. Scale up or down at
          any time.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span
            className={`text-xs sm:text-sm font-medium ${
              !isYearly ? "text-white" : "text-slate-400"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-12 h-6 rounded-full bg-slate-800 border border-violet-500/30 p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            aria-label="Toggle billing interval"
          >
            <div
              className={`w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 shadow-md transform transition-transform duration-200 ease-in-out ${
                isYearly ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs sm:text-sm font-medium ${
                isYearly ? "text-white" : "text-slate-400"
              }`}
            >
              Yearly
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {PLANS.map((plan) => {
          const isPopular = plan.id === "pro";
          const price = isYearly
            ? Math.round(plan.yearlyPrice / 12)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isPopular
                  ? "border-violet-500/60 shadow-xl shadow-violet-950/40 md:-translate-y-2"
                  : "border-white/10 hover:border-violet-500/30"
              }`}
            >
              {/* Popular / Custom Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full border shadow-sm ${
                      isPopular
                        ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-violet-400/30"
                        : "bg-slate-800 text-violet-300 border-violet-500/20"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Top Section */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {plan.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 min-h-[40px]">
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/10">
                  <span className="text-3xl sm:text-5xl font-extrabold text-white">
                    ${price}
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm font-medium">
                    /month
                  </span>
                  {isYearly && plan.yearlyPrice > 0 && (
                    <span className="text-[10px] text-slate-500 ml-auto block text-right">
                      Billed ${plan.yearlyPrice}/yr
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-center transition-all duration-200 block shadow-md ${
                  isPopular
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-violet-900/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
                }`}
              >
                {plan.buttonText}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
