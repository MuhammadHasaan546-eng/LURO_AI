"use client";

import React from "react";
import { SpotLightItem, Spotlight } from "@/components/ui/spotlight";

export default function Perks() {
  const perks = [
    {
      id: "1",
      title: "24/7 Priority Support",
      des: "Get dedicated assistance from our social media strategists anytime.",
      badge: "Instant",
      renderGraphic: () => (
        <div className="w-full h-36 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              Average response time: &lt; 2 mins
            </span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 text-xs text-slate-300">
            <p className="text-[10px] text-slate-500 mb-1">Live Agent</p>
            {"\"We've optimized your publishing queue for peak engagement tonight!\""}
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
    },
    {
      id: "2",
      title: "Unlimited Team Seats",
      des: "Invite creators, managers, and clients without paying per seat.",
      badge: "Unlimited",
      renderGraphic: () => (
        <div className="w-full h-36 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Active Team Members</span>
            <span className="text-violet-400 font-semibold">12 Connected</span>
          </div>

          {/* Avatar Stacks Graphic */}
          <div className="flex items-center -space-x-2 my-2">
            {["A", "B", "C", "D", "E"].map((initial, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-md"
              >
                {initial}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300">
              +7
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-violet-500 h-full w-full rounded-full" />
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
    },
    {
      id: "3",
      title: "Custom Brand Templates",
      des: "Save custom brand guidelines, fonts, and tones of voice for one-click generation.",
      badge: "Automation",
      renderGraphic: () => (
        <div className="w-full h-36 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Brand Preset</span>
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-[10px]">
              Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="bg-slate-950 p-2 rounded border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 block">Tone</span>
              <span className="text-xs text-slate-200 font-medium">Bold</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 block">Color</span>
              <span className="text-xs text-pink-400 font-medium">#EC4899</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 block">Format</span>
              <span className="text-xs text-slate-200 font-medium">Thread</span>
            </div>
          </div>

          <span className="text-[10px] text-slate-500 text-center">
            Automatically applied to all generated posts
          </span>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
    },
    {
      id: "4",
      title: "Enterprise Security",
      des: "SOC-2 Type II compliant encryption with 99.99% uptime guarantee.",
      badge: "Guaranteed",
      renderGraphic: () => (
        <div className="w-full h-36 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between items-center text-center shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">
              Systems Operational
            </span>
          </div>

          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">
            99.99%
          </div>

          <span className="text-[10px] text-slate-400">
            Encrypted with AES-256 standard
          </span>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full uppercase tracking-wider">
          Exclusive Benefits
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Perks Designed for Scale
        </h2>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          Everything included with your subscription to give your team an unfair
          advantage.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="relative bg-slate-950/80 border border-white/10 p-3 sm:p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl shadow-violet-950/20">
        <Spotlight className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {perks.map((perk) => {
            const GraphicComponent = perk.renderGraphic;
            return (
              <SpotLightItem className={perk.className} key={perk.id}>
                <div className="relative z-10 rounded-xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 w-full h-full p-5 sm:p-6 flex flex-col justify-between overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                  {/* Top Glow */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-all pointer-events-none" />

                  {/* Header Content */}
                  <div className="relative z-20 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded">
                        {perk.badge}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {perk.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {perk.des}
                    </p>
                  </div>

                  {/* Graphic UI */}
                  <div className="relative w-full mt-auto">
                    <GraphicComponent />
                  </div>
                </div>
              </SpotLightItem>
            );
          })}
        </Spotlight>
      </div>
    </section>
  );
}
