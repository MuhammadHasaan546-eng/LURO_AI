"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  AcmeLogo,
  PulseAILogo,
  NexusLogo,
  VertexLogo,
  HyperGrowthLogo,
  OmniMediaLogo,
} from "@/components/global/AcmeLogo";
import { LiquidBackground } from "./LiquidBackground";

const COMPANIES = [
  { name: "Acme Corp", Logo: AcmeLogo },
  { name: "Pulse AI", Logo: PulseAILogo },
  { name: "Nexus", Logo: NexusLogo },
  { name: "Vertex", Logo: VertexLogo },
  { name: "HyperGrowth", Logo: HyperGrowthLogo },
  { name: "Omni Media", Logo: OmniMediaLogo },
];

export const TrustedCompanies = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "150px 0px" });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = isInView && !reduceMotion;
  const MULTIPLIED_COMPANIES = [...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <LiquidBackground>
      <section
        ref={sectionRef}
        className="relative w-full py-16 overflow-hidden border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Header Label */}
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-violet-400 uppercase mb-10">
            Companies trust us
          </p>

          {/* --- INFINITE MARQUEE WITH SMOOTH PAUSE/RESUME --- */}
          <div className="relative w-full overflow-hidden group [mask-image:_linear-gradient(to_right,_transparent_0,_black_128px,_black_calc(100%-128px),_transparent_100%)]">
            <motion.div
              className="flex w-max gap-16 items-center group-hover:[animation-play-state:paused]"
              animate={shouldAnimate ? { x: ["0%", "-33.333%"] } : { x: "0%" }}
              transition={
                shouldAnimate
                  ? {
                      ease: "linear",
                      duration: 25,
                      repeat: Infinity,
                    }
                  : { duration: 0 }
              }
            >
              {MULTIPLIED_COMPANIES.map((company, index) => {
                const ComponentLogo = company.Logo;
                return (
                  <div
                    key={`${company.name}-${index}`}
                    className="flex items-center justify-center min-w-[140px] text-slate-400 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <ComponentLogo />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </LiquidBackground>
  );
};
