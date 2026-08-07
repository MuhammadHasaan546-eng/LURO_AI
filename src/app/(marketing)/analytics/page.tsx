"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  Users,
  Eye,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  BarChart2,
  Zap,
} from "lucide-react";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AnalyticsPage(): React.ReactElement {
  const [timeRange, setTimeRange] = useState<string>("7d");

  // Stat Card Data
  const stats = [
    {
      title: "Total Impressions",
      value: "142.8K",
      change: "+12.4%",
      isPositive: true,
      icon: Eye,
    },
    {
      title: "Audience Reach",
      value: "28.4K",
      change: "+18.2%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Avg. Engagement Rate",
      value: "6.8%",
      change: "-0.4%",
      isPositive: false,
      icon: TrendingUp,
    },
    {
      title: "Content Shared",
      value: "1,248",
      change: "+24.5%",
      isPositive: true,
      icon: Share2,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#05050D] text-white overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background SVG Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-15 z-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          fill="none"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Glowing Ambient Light */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-b from-purple-600/20 via-pink-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-medium mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Real-Time Performance</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Analytics Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track engagement, virality score, and growth across all integrated channels.
            </p>
          </div>

          {/* Time Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0e0c1a] border border-white/10 rounded-xl backdrop-blur-md self-start md:self-auto">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* METRICS STATS CARDS GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-xs font-medium">
                    {stat.title}
                  </span>
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </h3>
                  <span
                    className={`inline-flex items-center text-xs font-semibold ${
                      stat.isPositive ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN AREA CHART (2 COLUMNS WIDE) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Growth & Impressions Over Time
                </h3>
                <p className="text-slate-400 text-xs">
                  Daily total post impressions vs user engagements.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Impressions
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  Engagement
                </span>
              </div>
            </div>

            {/* SVG Interactive Area Chart */}
            <div className="h-64 w-full relative">
              <svg
                viewBox="0 0 500 180"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  {/* Purple Gradient Fill */}
                  <linearGradient
                    id="purpleGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </linearGradient>

                  {/* Pink Gradient Fill */}
                  <linearGradient
                    id="pinkGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {/* Main Area Path (Impressions) */}
                <path
                  d="M 0 140 Q 80 40 160 90 T 320 30 T 500 70 L 500 180 L 0 180 Z"
                  fill="url(#purpleGradient)"
                />
                <path
                  d="M 0 140 Q 80 40 160 90 T 320 30 T 500 70"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3"
                />

                {/* Secondary Area Path (Engagement) */}
                <path
                  d="M 0 160 Q 80 90 160 120 T 320 80 T 500 110 L 500 180 L 0 180 Z"
                  fill="url(#pinkGradient)"
                />
                <path
                  d="M 0 160 Q 80 90 160 120 T 320 80 T 500 110"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                />

                {/* Glowing Data Indicator Dots */}
                <circle cx="320" cy="30" r="5" fill="#a855f7" className="animate-ping opacity-75" />
                <circle cx="320" cy="30" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            {/* Chart X-Axis Labels */}
            <div className="flex justify-between text-slate-500 text-xs mt-4 pt-2 border-t border-white/5 font-mono">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </motion.div>

          {/* GAUGE / VIRALITY SCORE CHART (1 COLUMN) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-pink-400" />
                Virality Potential
              </h3>
              <p className="text-slate-400 text-xs">
                AI metric predicting likelihood of engagement spike.
              </p>
            </div>

            {/* Circular Ring Gauge Chart */}
            <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Animated Gradient Gauge Fill */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#ringGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * 0.92) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Inner Circle Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                  92%
                </span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-1">
                  Very High
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300 text-center">
              Your recent posts perform <strong className="text-purple-300">+24% better</strong> than average SaaS tools.
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: BAR CHART & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BAR CHART: CONTENT BY CHANNEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  Platform Breakdown
                </h3>
                <p className="text-slate-400 text-xs">
                  Engagement distribution per active social channel.
                </p>
              </div>
            </div>

            {/* Bar Chart Bars */}
            <div className="space-y-4">
              {[
                { name: "Twitter / X", value: 82, color: "from-purple-600 to-purple-400" },
                { name: "LinkedIn", value: 64, color: "from-pink-600 to-pink-400" },
                { name: "Instagram", value: 48, color: "from-purple-500 to-pink-500" },
                { name: "YouTube Shorts", value: 35, color: "from-purple-700 to-indigo-500" },
              ].map((platform, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{platform.name}</span>
                    <span className="text-slate-400 font-mono">{platform.value}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${platform.value}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${platform.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RECENT HIGHLIGHTS PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl flex flex-col justify-between"
          >
            <h3 className="text-lg font-bold mb-4">Top Performing Post</h3>
            
            <div className="p-4 rounded-xl bg-[#080712] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-purple-400 font-medium">
                <span>Published 2h ago</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                  Viral Status
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                &ldquo;Automate your SaaS visual workflow in under 5 minutes using our new AI Engine...&rdquo;
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400 font-mono">
                <span>Likes: 1.4K</span>
                <span>Shares: 382</span>
              </div>
            </div>

            <button className="w-full mt-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-xs font-semibold transition-all backdrop-blur-md">
              View Detailed Analytics
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}