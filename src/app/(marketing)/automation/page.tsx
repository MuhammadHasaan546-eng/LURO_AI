"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  TrendingUp,
  BarChart2,
} from "lucide-react";

// Typed Framer Motion Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function AutomationPage(): React.ReactElement {
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

      {/* Glowing Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-purple-600/20 via-pink-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-32">
        {/* SECTION 1: HERO */}
        <section className="text-center pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs md:text-sm font-medium mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Next-Gen AI Social Media Platform</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight"
          >
            Supercharge Your Social Media with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-200">
              AI Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lume is a social media automation tool that helps you create, schedule,
            generate, and publish content seamlessly across platforms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center gap-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm backdrop-blur-md transition-colors"
            >
              See Live Demo
            </motion.button>
          </motion.div>
        </section>

        {/* SECTION 2: BENTO FEATURE GRID */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to grow faster
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Smart automation features designed to maximize reach and keep your brand ahead.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/60 to-[#070612]/80 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Automation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Auto-generate engaging posts and schedule publishing across multiple platforms in seconds.
              </p>
              <div className="p-4 rounded-xl bg-[#080712] border border-white/5 text-xs text-slate-300 font-mono">
                <div className="text-purple-400 mb-1">&gt; Generate 5 viral posts for SaaS launch...</div>
                <div className="flex items-center justify-between text-slate-500 mt-3 pt-2 border-t border-white/5">
                  <span>Generating response...</span>
                  <span className="text-emerald-400">98% Match</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/60 to-[#070612]/80 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Post at peak engagement times automatically tailored to your specific audience timezone.
              </p>
              <div className="p-4 rounded-xl bg-[#080712] border border-white/5 text-xs text-slate-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Best Time Today</span>
                  <span className="text-purple-400 font-medium">Peak 09:40 PM</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[75%]" />
                </div>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/60 to-[#070612]/80 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Audience Growth</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time demographics, follower insights, and performance tracking to drive organic growth.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              variants={fadeInUp}
              className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/60 to-[#070612]/80 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Virality Score</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Predict post performance before publishing using machine learning trained on viral content trends.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* SECTION 3: CALL TO ACTION BANNER */}
        <section className="relative">
          {/* Animated Glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-purple-600/30 via-pink-500/20 to-transparent blur-[120px] rounded-full pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#0e0c1a]/90 to-[#070612]/95 backdrop-blur-xl p-8 md:p-16 text-center shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden max-w-4xl mx-auto"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent blur-2xl pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
              Ready to try{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-purple-400">
                Lume?
              </span>
            </h2>

            <p className="text-slate-400 text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Start your free trial today and see how Lume can help you
              streamline your workflow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 group transition-all"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm backdrop-blur-md transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}