"use client";

import { AnimatedBeam, Circle } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import {
  Image,
  Zap,
  Aperture,
  BookOpen,
  Music,
  Wand2,
  Sparkles,
} from "lucide-react";
import { LiquidBackground } from "./LiquidBackground";

interface ConnectProps {
  className?: string;
}

export default function Connect({ className }: ConnectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <LiquidBackground>
      <section className="relative w-full py-20 overflow-hidden border-b border-white/10 flex flex-col items-center justify-center">
        {/* Section Header */}
        <div className="text-center mb-10 z-10 px-4">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-violet-400 uppercase">
            Connect
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Integrated AI Creative Engine
          </h3>
        </div>

        {/* --- MAIN CONNECT CONTAINER --- */}
        <div
          ref={containerRef}
          className={cn(
            "relative flex w-full max-w-[650px] mx-auto items-center justify-center overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-950/60 p-6 sm:p-12 backdrop-blur-xl shadow-2xl shadow-violet-950/50",
            className,
          )}
        >
          {/* Subtle Background Radial/Dotted Glow effect like the image */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0,transparent_70%)] pointer-events-none" />

          <div className="flex h-full w-full flex-col items-stretch justify-between gap-10 sm:gap-14 relative z-10">
            {/* Top Row */}
            <div className="flex flex-row items-center justify-between">
              {/* Image Icon */}
              <Circle
                ref={div1Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Image className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Book Icon */}
              <Circle
                ref={div5Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>

            {/* Middle Row */}
            <div className="flex flex-row items-center justify-between">
              {/* Zap Icon */}
              <Circle
                ref={div2Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Center Hub: Custom Purple Glow Hub */}
              <Circle
                ref={div4Ref}
                className="h-16 w-16 sm:h-20 sm:w-20 p-4 bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 border-2 border-violet-300 text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-105 transition-transform"
              >
                <Sparkles className="w-full h-full animate-pulse" />
              </Circle>

              {/* Music Icon */}
              <Circle
                ref={div6Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Music className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-row items-center justify-between">
              {/* Aperture Icon */}
              <Circle
                ref={div3Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Aperture className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Wand Icon */}
              <Circle
                ref={div7Ref}
                className="bg-violet-900/40 border-violet-500/40 text-violet-200 p-3 sm:p-4 shadow-lg shadow-violet-500/20 backdrop-blur-md hover:scale-110 transition-transform"
              >
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>
          </div>

          {/* Glowing Connecting Lines (Beams) */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div4Ref}
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            reverse
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
            dotted
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div4Ref}
            reverse
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div7Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
            reverse
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#8b5cf6"
          />
        </div>
      </section>
    </LiquidBackground>
  );
}
