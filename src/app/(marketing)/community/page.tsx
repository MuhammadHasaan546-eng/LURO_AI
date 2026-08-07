"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  Users,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Plus,
  Star,
  Award,
  Calendar,
} from "lucide-react";

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
      staggerChildren: 0.08,
    },
  },
};

interface ShowcaseItem {
  id: string;
  title: string;
  creator: string;
  avatar: string;
  likes: number;
  category: "templates" | "workflows" | "prompts";
  description: string;
  tags: string[];
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  type: "Livestream" | "Workshop" | "Q&A";
  attendees: number;
}

export default function CommunityPage(): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"showcase" | "discussions" | "events">("showcase");

  const showcases: ShowcaseItem[] = [
    {
      id: "1",
      title: "Viral SaaS Launch Thread Prompt Matrix",
      creator: "Alex R.",
      avatar: "AR",
      likes: 342,
      category: "prompts",
      description: "A multi-stage prompt structure designed to break down feature announcements into 7 engaging X threads.",
      tags: ["Twitter", "SaaS", "Prompts"],
    },
    {
      id: "2",
      title: "LinkedIn Carousel Generator & Auto-Scheduler",
      creator: "Sarah M.",
      avatar: "SM",
      likes: 512,
      category: "workflows",
      description: "Automated workflow that takes blog post URLs and formats them into sleek PDF slide carousels.",
      tags: ["LinkedIn", "Carousels", "Workflow"],
    },
    {
      id: "3",
      title: "Weekly AI Video Shorts Pipeline",
      creator: "Hasaan M.",
      avatar: "HM",
      likes: 890,
      category: "templates",
      description: "End-to-end template for batch-generating short-form video captions and posting across TikTok & Reels.",
      tags: ["YouTube Shorts", "Reels", "Automation"],
    },
    {
      id: "4",
      title: "Audience Engagement Auto-Responder",
      creator: "David K.",
      avatar: "DK",
      likes: 215,
      category: "workflows",
      description: "Real-time trigger that analyzes incoming post comments and suggests contextual AI replies.",
      tags: ["Engagement", "AI Bot"],
    },
  ];

  const upcomingEvents: EventItem[] = [
    {
      id: "e1",
      title: "Mastering Virality Scores with Lume Machine Learning",
      date: "Aug 14, 2026 • 05:00 PM UTC",
      type: "Workshop",
      attendees: 420,
    },
    {
      id: "e2",
      title: "Building Custom API Connectors & Webhooks",
      date: "Aug 22, 2026 • 06:00 PM UTC",
      type: "Livestream",
      attendees: 310,
    },
  ];

  const filteredShowcases =
    selectedCategory === "all"
      ? showcases
      : showcases.filter((s) => s.category === selectedCategory);

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-purple-600/20 via-pink-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-medium backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Creators & Developers Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Built by Creators, Powered by{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200">
              Lume AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg leading-relaxed"
          >
            Explore user-submitted automation workflows, prompt templates, and connect with 12,000+ founders and digital creators.
          </motion.p>
        </div>

        {/* COMMUNITY STATS ROW */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Community Members", value: "12,400+", icon: Users },
            { label: "Templates Shared", value: "1,850+", icon: Star },
            { label: "Posts Auto-Scheduled", value: "2.4M+", icon: TrendingUp },
            { label: "Active Contributors", value: "480+", icon: Award },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* NAVIGATION TABS & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0e0c1a]/80 border border-purple-500/20 p-3 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5 bg-[#080712] p-1 rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("showcase")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "showcase"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Showcase & Templates
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "events"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Upcoming Events
            </button>
          </div>

          {activeTab === "showcase" && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {["all", "templates", "workflows", "prompts"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-white/10 text-white border border-purple-500/40"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN TAB CONTENT */}
        {activeTab === "showcase" ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredShowcases.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {item.avatar}
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.creator}
                      </span>
                    </div>

                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-pink-300 transition-colors">
                      <Heart className="w-3.5 h-3.5 fill-pink-500/20 text-pink-400" />
                      <span>{item.likes}</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-[10px] font-semibold text-purple-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <button className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-colors flex items-center gap-1 shrink-0">
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
            className="space-y-4"
          >
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] font-bold text-pink-400 uppercase">
                      {event.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {event.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <p className="text-xs text-slate-400">
                    {event.attendees} creators already registered.
                  </p>
                </div>

                <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-md shrink-0 self-start md:self-auto">
                  RSVP For Free
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* JOIN DISCORD & COMMUNITY BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#0e0c1a]/90 via-[#110a24]/90 to-[#070612]/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden text-center md:text-left"
        >
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">
              Join the Lume Creators Community
            </h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Connect with fellow developers, share prompt recipes, get early access to beta AI features, and participate in weekly growth workshops.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-semibold text-xs shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Join Discord Server</span>
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}