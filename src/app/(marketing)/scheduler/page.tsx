"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

// Inline SVG Brand Icons
const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Typed Framer Motion Variants
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

interface ScheduledPost {
  id: string;
  content: string;
  platform: "twitter" | "linkedin" | "instagram";
  scheduledTime: string;
  status: "scheduled" | "published" | "draft";
  bestTimeMatch: boolean;
}

export default function SchedulerPage(): React.ReactElement {
  const [selectedTab, setSelectedTab] = useState<"queue" | "calendar">("queue");
  const [activePlatform, setActivePlatform] = useState<string>("all");

  const posts: ScheduledPost[] = [
    {
      id: "1",
      content:
        "Excited to launch our new AI automation workflow builder inside Lume! Generate, schedule, and publish seamlessly. 🚀 #SaaS #AI",
      platform: "twitter",
      scheduledTime: "Today at 09:40 PM",
      status: "scheduled",
      bestTimeMatch: true,
    },
    {
      id: "2",
      content:
        "5 ways social media automation can save your marketing team 15+ hours every week. Read our latest breakdown 👇",
      platform: "linkedin",
      scheduledTime: "Tomorrow at 10:15 AM",
      status: "scheduled",
      bestTimeMatch: true,
    },
    {
      id: "3",
      content:
        "A sneak peek behind the scenes of our dark mode UI design system. Purple accents and glassmorphism in action ✨",
      platform: "instagram",
      scheduledTime: "Aug 10 at 04:00 PM",
      status: "draft",
      bestTimeMatch: false,
    },
    {
      id: "4",
      content:
        "Boost your viral reach score before hitting publish with our real-time machine learning analytics.",
      platform: "twitter",
      scheduledTime: "Aug 06 at 02:30 PM",
      status: "published",
      bestTimeMatch: true,
    },
  ];

  const renderPlatformIcon = (platform: ScheduledPost["platform"]) => {
    switch (platform) {
      case "twitter":
        return <TwitterIcon className="w-4 h-4 text-sky-400" />;
      case "linkedin":
        return <LinkedinIcon className="w-4 h-4 text-blue-500" />;
      case "instagram":
        return <InstagramIcon className="w-4 h-4 text-pink-400" />;
    }
  };

  const filteredPosts =
    activePlatform === "all"
      ? posts
      : posts.filter((p) => p.platform === activePlatform);

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

      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-gradient-to-b from-purple-600/20 via-pink-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 space-y-8">
        {/* HEADER SECTION (Top Padding adjusted so floating navbar doesn't cover text) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Content Scheduler
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2">
              Plan, organize, and auto-publish content across all your social channels.
            </p>
          </div>

          <div className="shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Post</span>
            </motion.button>
          </div>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0e0c1a]/60 border border-purple-500/20 p-3 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1 bg-[#080712] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTab("queue")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "queue"
                  ? "bg-purple-600/40 border border-purple-500/40 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Queue
            </button>
            <button
              onClick={() => setSelectedTab("calendar")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "calendar"
                  ? "bg-purple-600/40 border border-purple-500/40 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["all", "twitter", "linkedin", "instagram"].map((platform) => (
              <button
                key={platform}
                onClick={() => setActivePlatform(platform)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  activePlatform === platform
                    ? "bg-white/10 text-white border border-purple-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        {selectedTab === "queue" ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
          >
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={fadeInUp}
                className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {renderPlatformIcon(post.platform)}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {post.scheduledTime}
                      </span>

                      {post.bestTimeMatch && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-pink-300 bg-pink-950/40 border border-pink-500/30 px-2 py-0.5 rounded-full font-sans">
                          <Zap className="w-3 h-3 text-pink-400" />
                          Peak Engagement Time
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      post.status === "scheduled"
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        : post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {post.status}
                  </span>

                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">August 2026</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNumber = i + 1;
                const hasPost = dayNumber === 7 || dayNumber === 10 || dayNumber === 14;
                return (
                  <div
                    key={i}
                    className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-xl border ${
                      hasPost
                        ? "border-purple-500/40 bg-purple-950/20"
                        : "border-white/5 bg-[#080712]/50"
                    } flex flex-col justify-between`}
                  >
                    <span className="text-xs font-semibold text-slate-400">
                      {dayNumber}
                    </span>
                    {hasPost && (
                      <div className="p-1 rounded bg-purple-600/30 border border-purple-500/30 text-[10px] text-purple-200 truncate font-mono">
                        2 Posts Scheduled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}