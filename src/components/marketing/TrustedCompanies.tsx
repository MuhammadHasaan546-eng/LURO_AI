"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AcmeLogo,
  PulseAILogo,
  NexusLogo,
  VertexLogo,
  HyperGrowthLogo,
  OmniMediaLogo,
} from "@/components/global/AcmeLogo";

const COMPANIES = [
  { name: "Acme Corp", Logo: AcmeLogo },
  { name: "Pulse AI", Logo: PulseAILogo },
  { name: "Nexus", Logo: NexusLogo },
  { name: "Vertex", Logo: VertexLogo },
  { name: "HyperGrowth", Logo: HyperGrowthLogo },
  { name: "Omni Media", Logo: OmniMediaLogo },
];

export const TrustedCompanies = () => {
  return (
    <section className="relative w-full py-16 bg-background overflow-hidden border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header Label */}
        <p className="text-xs sm:text-sm font-semibold tracking-wider text-violet-400 uppercase mb-10">
          Companies trust us
        </p>

        {/* --- INFINITE MARQUEE WITH SMOOTH PAUSE/RESUME --- */}
        <div className="relative w-full overflow-hidden group [mask-image:_linear-gradient(to_right,_transparent_0,_black_128px,_black_calc(100%-128px),_transparent_100%)]">
          <motion.div
            className="flex w-max gap-16 items-center group-hover:[animation-play-state:paused]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 20,
              repeat: Infinity,
            }}
          >
            {/* Duplicate list for continuous infinite marquee loop */}
            {[...COMPANIES, ...COMPANIES].map((company, index) => {
              const ComponentLogo = company.Logo;
              return (
                <div
                  key={index}
                  className="flex items-center justify-center min-w-[140px] text-slate-500 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <ComponentLogo />
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
