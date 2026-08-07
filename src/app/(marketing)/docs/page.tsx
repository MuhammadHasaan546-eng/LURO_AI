"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  Search,
  BookOpen,
  Code,
  Terminal,
  Zap,
  ArrowRight,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
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

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  articlesCount: number;
  popularArticle: string;
}

export default function DocsPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const sampleSnippet = `curl -X POST https://api.lume.ai/v1/posts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Automating social reach with Lume AI 🚀",
    "platforms": ["twitter", "linkedin"],
    "scheduleAt": "2026-08-10T09:40:00Z"
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const docSections: DocSection[] = [
    {
      id: "quickstart",
      title: "Getting Started",
      description: "Learn how to connect your accounts and issue your first automated AI post.",
      icon: ({ className }) => <BookOpen className={className} />,
      articlesCount: 6,
      popularArticle: "Quickstart Guide in 5 Minutes",
    },
    {
      id: "api",
      title: "API Reference",
      description: "RESTful endpoints for scheduling, media uploads, and AI generation hooks.",
      icon: ({ className }) => <Terminal className={className} />,
      articlesCount: 14,
      popularArticle: "Authentication & Bearer Tokens",
    },
    {
      id: "automation",
      title: "Automation Rules",
      description: "Set up trigger conditions, cron schedules, and peak-time auto publishing.",
      icon: ({ className }) => <Zap className={className} />,
      articlesCount: 8,
      popularArticle: "Configuring Peak Engagement Triggers",
    },
    {
      id: "sdks",
      title: "SDKs & Integrations",
      description: "Client libraries for Node.js, Python, and webhook event payloads.",
      icon: ({ className }) => <Code className={className} />,
      articlesCount: 5,
      popularArticle: "Node.js SDK Installation",
    },
    {
      id: "analytics-docs",
      title: "Analytics Data API",
      description: "Export impression metrics, virality scores, and audience breakdown stats.",
      icon: ({ className }) => <Layers className={className} />,
      articlesCount: 9,
      popularArticle: "Retrieving Real-Time Virality Metrics",
    },
    {
      id: "account",
      title: "Billing & Team Workspace",
      description: "Manage team member roles, seat permissions, and usage limits.",
      icon: ({ className }) => <FileText className={className} />,
      articlesCount: 4,
      popularArticle: "Managing Team Member Permissions",
    },
  ];

  const filteredSections = docSections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.popularArticle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* HEADER & SEARCH SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-medium backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Developer Center & Knowledge Base</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            How can we help you build with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200">
              Lume?
            </span>
          </motion.h1>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto pt-2"
          >
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, API endpoints, SDKs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e0c1a]/90 border border-purple-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all backdrop-blur-xl"
            />
          </motion.div>
        </div>

        {/* QUICK API CODE EXAMPLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/90 to-[#070612]/95 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
              <Terminal className="w-4 h-4 text-pink-400" />
              <span>POST /v1/posts</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors border border-white/10"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#05040a] border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
            <code>{sampleSnippet}</code>
          </pre>
        </motion.div>

        {/* DOCUMENTATION CATEGORIES GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <motion.div
                key={sec.id}
                variants={fadeInUp}
                className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      {sec.articlesCount} Articles
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-white flex items-center justify-between">
                    <span>{sec.title}</span>
                    <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {sec.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-1">
                    Popular
                  </span>
                  <p className="text-xs text-slate-300 group-hover:text-purple-200 transition-colors font-medium">
                    {sec.popularArticle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* NEED EXTRA SUPPORT BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#0e0c1a]/90 via-[#110a24]/90 to-[#070612]/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Need technical assistance?
            </h3>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Join our developer community on Discord or reach out directly to our engineering support team for API troubleshooting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
            >
              <span>Contact Developer Support</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}