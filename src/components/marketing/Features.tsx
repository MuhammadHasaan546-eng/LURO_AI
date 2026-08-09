"use client";

import { SpotLightItem, Spotlight } from "@/components/ui/spotlight";
import React from "react";

export default function Features() {
  const boxes = [
    {
      id: "1",
      title: "AI Automation",
      des: "Auto-generate engaging posts and scheduling in seconds.",
      renderGraphic: () => (
        <div className="w-full h-44 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between shadow-inner relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-indigo-500" />

          <div className="text-xs font-mono text-violet-300 bg-violet-950/60 p-2 rounded-lg border border-violet-500/30">
            <span className="truncate block">
              {"\"Generate 5 viral tweets for SaaS launch...\""}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Generating response...</span>
              <span className="text-emerald-400 font-semibold">98% Match</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-1.5 rounded-full w-[85%] animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-white/5">
            <span className="text-xs text-slate-300">Ready to publish</span>
            <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] rounded-md font-medium">
              Send
            </span>
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
    },
    {
      id: "2",
      title: "Smart Scheduling",
      des: "Post at peak engagement times automatically.",
      renderGraphic: () => (
        <div className="w-full h-44 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
            <span className="font-medium text-slate-200">Best Time Today</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
              Peak 9:40 PM
            </span>
          </div>

          {/* Timeline Graphic */}
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 w-12 shrink-0">
                06:00 PM
              </span>
              <div className="h-1.5 flex-1 bg-slate-800 rounded-full relative">
                <div className="absolute left-[20%] w-3 h-3 bg-violet-500 rounded-full -top-0.75 border-2 border-slate-900 shadow-md shadow-violet-500/50" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold w-12 shrink-0">
                09:40 PM
              </span>
              <div className="h-2 flex-1 bg-slate-800 rounded-full relative">
                <div className="absolute left-[70%] w-3.5 h-3.5 bg-pink-500 rounded-full -top-0.75 border-2 border-slate-900 shadow-md shadow-pink-500/80 animate-ping" />
                <div className="absolute left-[70%] w-3.5 h-3.5 bg-pink-500 rounded-full -top-0.75 border-2 border-slate-900 shadow-md shadow-pink-500/80" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">Scheduled across 4 platforms</span>
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
    },
    {
      id: "3",
      title: "Audience Growth",
      des: "Real-time demographics and follower insights.",
      renderGraphic: () => (
        <div className="w-full h-44 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col justify-between shadow-inner">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-extrabold text-white">24.8K</span>
            <span className="text-xs font-semibold text-emerald-400">
              +18.4%
            </span>
          </div>

          {/* Bar Chart SVG */}
          <div className="flex items-end justify-between gap-2 h-20 pt-2">
            {[40, 65, 45, 80, 55, 95, 75].map((height, i) => (
              <div
                key={i}
                className="w-full bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden"
              >
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-md transition-all duration-300"
                />
              </div>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 text-center">
            New subscribers this week
          </span>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
    },
    {
      id: "4",
      title: "Virality Score",
      des: "Predict post performance before publishing.",
      renderGraphic: () => (
        <div className="w-full h-44 rounded-xl bg-slate-900/90 border border-violet-500/20 p-4 flex flex-col items-center justify-center relative shadow-inner">
          {/* Gauge SVG */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="44"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="44"
              stroke="url(#violetGradient)"
              strokeWidth="8"
              strokeDasharray="276"
              strokeDashoffset="50"
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient
                id="violetGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">92</span>
            <span className="text-[10px] text-violet-300 font-semibold tracking-wider uppercase">
              Viral Potential
            </span>
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
    },
    {
      id: "5",
      title: "Track Goals & Analytics",
      des: "Keeping track of your growth helps you stay organized, motivated, and focused. Monitor conversions across all connected platforms in real time.",
      renderGraphic: () => (
        <div className="w-full h-48 sm:h-56 rounded-xl bg-slate-900/90 border border-violet-500/20 p-5 flex flex-col justify-between shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div>
              <p className="text-xs text-slate-400">
                Total Campaign Conversions
              </p>
              <h4 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                $14,290.00
              </h4>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/10 border border-violet-500/20 text-violet-300">
                Monthly Target
              </span>
            </div>
          </div>

          {/* Area Chart Vector Curve */}
          <div className="relative w-full h-24 my-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 400 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,80 Q 80,20 160,60 T 320,10 T 400,30 L 400,100 L 0,100 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M 0,80 Q 80,20 160,60 T 320,10 T 400,30"
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
              />
              <circle
                cx="320"
                cy="10"
                r="5"
                fill="#ec4899"
                className="animate-ping"
              />
              <circle cx="320" cy="10" r="5" fill="#ec4899" />
            </svg>
          </div>

          {/* Bottom Progress Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5 z-10">
            <div>
              <p className="text-[10px] text-slate-400">Target</p>
              <p className="text-xs font-semibold text-slate-200">$15,000</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Pace</p>
              <p className="text-xs font-semibold text-emerald-400">
                +12% ahead
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Completion</p>
              <p className="text-xs font-semibold text-violet-400">95.2%</p>
            </div>
          </div>
        </div>
      ),
      className: "col-span-1 md:col-span-2 lg:col-span-3",
    },
  ];

  return (
    <section className="relative w-full py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full uppercase tracking-wider">
          Powerful Capabilities
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Everything You Need to Scale Socials
        </h2>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          Supercharge your content workflow with intelligent AI tools designed
          for modern creators and growth teams.
        </p>
      </div>

      {/* Spotlight Bento Grid */}
      <div className="relative bg-slate-950/80 border border-white/10 p-3 sm:p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl shadow-violet-950/20">
        <Spotlight className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boxes?.map((box) => {
            const GraphicComponent = box.renderGraphic;
            return (
              <SpotLightItem className={box.className} key={box.id}>
                <div className="relative z-10 rounded-xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-white/10 w-full h-full p-5 sm:p-6 flex flex-col justify-between overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                  {/* Subtle Top Glow */}
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-all pointer-events-none" />

                  {/* Header Content */}
                  <div className="relative z-20 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {box?.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {box?.des}
                    </p>
                  </div>

                  {/* Dynamic Graphic UI */}
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
