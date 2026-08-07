"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  Search,
  Check,
  Plus,
  ArrowRight,
  Zap,
  ExternalLink,
  Lock,
} from "lucide-react";

// Inline SVG Brand Icons
const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
      staggerChildren: 0.08,
    },
  },
};

interface Integration {
  id: string;
  name: string;
  category: "social" | "analytics" | "ai" | "storage";
  description: string;
  icon: React.FC<{ className?: string }>;
  status: "connected" | "available" | "coming_soon";
  badge?: string;
}

export default function IntegrationsPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const integrations: Integration[] = [
    {
      id: "twitter",
      name: "Twitter / X",
      category: "social",
      description: "Auto-publish threads, scheduled posts, and analyze tweet viral score.",
      icon: TwitterIcon,
      status: "connected",
      badge: "Active",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      category: "social",
      description: "Schedule company updates, carousels, and track lead conversion rates.",
      icon: LinkedinIcon,
      status: "connected",
      badge: "Active",
    },
    {
      id: "instagram",
      name: "Instagram",
      category: "social",
      description: "Publish reels, stories, and feed posts with auto-generated captions.",
      icon: InstagramIcon,
      status: "available",
      badge: "Popular",
    },
    {
      id: "youtube",
      name: "YouTube Shorts",
      category: "social",
      description: "Upload short-form videos with automated metadata and tag optimization.",
      icon: YoutubeIcon,
      status: "available",
    },
    {
      id: "openai",
      name: "OpenAI GPT-4",
      category: "ai",
      description: "Power AI content generation with custom brand voice fine-tuning.",
      icon: ({ className }) => <Zap className={className} />,
      status: "connected",
      badge: "Core Engine",
    },
    {
      id: "analytics",
      name: "Google Analytics 4",
      category: "analytics",
      description: "Track direct website traffic originating from published social campaigns.",
      icon: ({ className }) => <ExternalLink className={className} />,
      status: "available",
    },
    {
      id: "cloud_storage",
      name: "Google Drive & Cloud",
      category: "storage",
      description: "Import media assets directly into the Lume AI media studio.",
      icon: ({ className }) => <Lock className={className} />,
      status: "coming_soon",
      badge: "Soon",
    },
  ];

  const categories = [
    { id: "all", label: "All Integrations" },
    { id: "social", label: "Social Networks" },
    { id: "ai", label: "AI Engines" },
    { id: "analytics", label: "Analytics" },
    { id: "storage", label: "Storage & Media" },
  ];

  const filteredIntegrations = integrations.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-12">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-medium backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Seamless Connectivity</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            Connect Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200">
              Favorite Tools
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg leading-relaxed"
          >
            Integrate Lume with social channels, storage platforms, and custom AI engines to streamline your entire automated content ecosystem.
          </motion.p>
        </div>

        {/* SEARCH & CATEGORY FILTERS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0e0c1a]/80 border border-purple-500/20 p-3 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080712] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* INTEGRATION CARDS GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredIntegrations.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === "connected"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-white">
                    {item.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div>
                  {item.status === "connected" ? (
                    <button className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </button>
                  ) : item.status === "coming_soon" ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-500 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Coming Soon</span>
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Connect Integration</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* REQUEST NEW INTEGRATION BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#0e0c1a]/90 via-[#110a24]/90 to-[#070612]/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Don't see the tool you use?
            </h3>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              We frequently add new API connectors. Request an integration and our team will prioritize it for upcoming releases.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-full border border-purple-500/30 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2 shrink-0"
          >
            <span>Request Integration</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
}

