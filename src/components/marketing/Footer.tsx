"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Perks", href: "#perks" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Changelog", href: "#changelog" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Guides & Blog", href: "#" },
    { label: "Community", href: "#" },
    { label: "Status Page", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

const socialLinks = [
  {
    name: "Twitter / X",
    href: "#",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "#",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const footerRef = useRef<HTMLElement>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInView = useInView(footerRef, { margin: "150px 0px" });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = isInView && !reduceMotion;

  useEffect(
    () => () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    },
    [],
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        setSubscribed(false);
        resetTimeoutRef.current = null;
      }, 3000);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full border-t border-white/10 bg-slate-950 pt-16 pb-12 overflow-hidden"
    >
      {/* Dynamic Background Glow Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <motion.div
          animate={
            shouldAnimate
              ? {
                  opacity: [0.2, 0.4, 0.2],
                  scale: [0.9, 1.1, 0.9],
                }
              : { opacity: 0.2, scale: 1 }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0 }
          }
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-violet-600/30 via-pink-500/20 to-indigo-600/20 blur-[100px] rounded-full"
        />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10"
        >
          {/* Brand & Newsletter Glass Card */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex flex-col justify-between relative group hover:border-violet-500/30 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-950/50">
                  S
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">
                  SocialPulse<span className="text-violet-400">.ai</span>
                </span>
              </div>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
                Supercharge your content workflow with intelligent AI tools
                designed for modern creators, agencies, and high-growth teams.
              </p>
            </div>

            {/* Newsletter Input Form */}
            <form onSubmit={handleSubscribe} className="pt-6 space-y-2">
              <label
                htmlFor="footer-newsletter"
                className="text-xs font-semibold text-slate-300 block"
              >
                Join our newsletter
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-violet-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-violet-950/50 shrink-0 active:scale-95"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Links Grid Section */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-3"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-all duration-200"
                    >
                      <span className="w-1 h-1 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-3"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-all duration-200"
                    >
                      <span className="w-1 h-1 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-3 col-span-2 sm:col-span-1"
            >
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-all duration-200"
                    >
                      <span className="w-1 h-1 rounded-full bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Utility Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full "></div>

          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} SocialPulse Inc. All rights reserved.
          </p>

          {/* Social Badges */}
          <div className="flex items-center gap-2">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                aria-label={s.name}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-violet-500/40 hover:bg-slate-800 transition-all hover:scale-105 shadow-sm"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
