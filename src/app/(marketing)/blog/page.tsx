"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Sparkles,
  Search,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  BookOpen,
  Send,
  User,
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

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: "ai" | "growth" | "product" | "tutorials";
  author: {
    name: string;
    role: string;
  };
  date: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
}

export default function BlogPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [emailInput, setEmailInput] = useState<string>("");
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const articles: Article[] = [
    {
      id: "1",
      title: "How Machine Learning Models Predict Social Post Virality Before Publishing",
      excerpt:
        "An inside look into how Lume analyzes engagement metrics, optimal post times, and content structures to assign real-time virality probability scores.",
      category: "ai",
      author: {
        name: "Hasaan Muhammad",
        role: "Lead Full-Stack Developer",
      },
      date: "Aug 05, 2026",
      readTime: "6 min read",
      featured: true,
      tags: ["AI", "Machine Learning", "Virality"],
    },
    {
      id: "2",
      title: "10 Automation Workflows Every SaaS Founder Should Run in 2026",
      excerpt:
        "Save 15+ hours weekly by connecting automated thread scheduling, multi-platform publishing, and smart audience analytics into a unified pipeline.",
      category: "growth",
      author: {
        name: "Lume Team",
        role: "Growth Engineering",
      },
      date: "Jul 28, 2026",
      readTime: "4 min read",
      tags: ["SaaS", "Automation", "Workflows"],
    },
    {
      id: "3",
      title: "Building Dark Mode UI Animations with Framer Motion and Next.js",
      excerpt:
        "A deep dive into creating glassmorphic dark themes, ambient lighting glows, and smooth scroll transitions for high-conversion web products.",
      category: "product",
      author: {
        name: "Hasaan Muhammad",
        role: "Full-Stack Developer",
      },
      date: "Jul 18, 2026",
      readTime: "8 min read",
      tags: ["UI/UX", "Next.js", "Framer Motion"],
    },
    {
      id: "4",
      title: "Step-by-Step Guide: Setting Up Auto-Scheduling Across Twitter and LinkedIn",
      excerpt:
        "Learn how to configure your account integrations and let Lume automatically trigger posts during peak audience timezone hours.",
      category: "tutorials",
      author: {
        name: "Lume Team",
        role: "Product Support",
      },
      date: "Jul 10, 2026",
      readTime: "5 min read",
      tags: ["Tutorial", "Scheduling", "Social Media"],
    },
    {
      id: "5",
      title: "The Evolution of AI Social Media Managers vs Traditional Tools",
      excerpt:
        "Why standard social schedulers are being replaced by generative AI platforms capable of maintaining organic brand voice consistency.",
      category: "ai",
      author: {
        name: "Lume Team",
        role: "AI Research",
      },
      date: "Jun 30, 2026",
      readTime: "7 min read",
      tags: ["Generative AI", "Content Creation"],
    },
  ];

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "ai", label: "AI Insights" },
    { id: "growth", label: "SaaS Growth" },
    { id: "product", label: "Product & Engineering" },
    { id: "tutorials", label: "Tutorials" },
  ];

  const featuredArticle = articles.find((art) => art.featured);

  const filteredArticles = articles.filter((art) => {
    const matchesCat =
      selectedCategory === "all" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

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
            <span>Articles & Insights</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            The Lume{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200">
              Blog
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg leading-relaxed"
          >
            Guides, engineering updates, and strategies on social media automation, generative AI, and digital growth.
          </motion.p>
        </div>

        {/* FEATURED POST HERO (If available and no active search filter) */}
        {featuredArticle && !searchQuery && selectedCategory === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="p-8 md:p-12 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#0e0c1a]/90 via-[#0a0816]/90 to-[#070612]/95 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-[0_0_40px_rgba(168,85,247,0.1)]"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm">
                Featured Article
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                {featuredArticle.readTime}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4 group-hover:text-purple-200 transition-colors leading-snug">
              {featuredArticle.title}
            </h2>

            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed mb-8">
              {featuredArticle.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {featuredArticle.author.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {featuredArticle.author.role} • {featuredArticle.date}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </motion.button>
            </div>
          </motion.div>
        )}

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
              placeholder="Search articles or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080712] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
        </div>

        {/* ARTICLES GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredArticles.map((art) => (
            <motion.div
              key={art.id}
              variants={fadeInUp}
              className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/80 to-[#070612]/90 backdrop-blur-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {art.tags.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-purple-950/50 border border-purple-500/30 text-[10px] font-semibold text-purple-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors leading-snug">
                  {art.title}
                </h3>

                <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {art.author.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{art.date}</p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-purple-600/30 border border-white/10 group-hover:border-purple-500/40 flex items-center justify-center text-slate-400 group-hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* NEWSLETTER SUBSCRIPTION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#0e0c1a]/90 via-[#110a24]/90 to-[#070612]/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="space-y-2 text-center md:text-left max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Weekly Newsletter</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Stay ahead in AI automation
            </h3>
            <p className="text-slate-400 text-xs md:text-sm">
              Get our weekly breakdown on social media algorithms, growth playbooks, and new feature updates delivered to your inbox.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {subscribed ? (
              <div className="px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
                {"✓ You're subscribed! Check your inbox soon."}
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-[#05040a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Subscribe</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}