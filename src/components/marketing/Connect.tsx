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
      <section className="relative w-full py-20 overflow-hidden border-b border-white/10">
        <div
          ref={containerRef}
          className={cn(
            "relative flex w-full max-w-[650px] mx-auto items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-10 backdrop-blur-md shadow-2xl shadow-violet-950/30",
            className,
          )}
        >
          <div className="flex h-full w-full flex-col items-stretch justify-between gap-12">
            {/* Top Row */}
            <div className="flex flex-row items-center justify-between z-10">
              {/* Top Left: Image Icon */}
              <Circle
                ref={div1Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <Image className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Top Right: Book Icon */}
              <Circle
                ref={div5Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>

            {/* Middle Row */}
            <div className="flex flex-row items-center justify-between z-10">
              {/* Mid Left: Zap Icon */}
              <Circle
                ref={div2Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Center Hub: AI Sunburst / Sparkles Logo */}
              <Circle
                ref={div4Ref}
                className="h-16 w-16 sm:h-20 sm:w-20 p-4 bg-gradient-to-tr from-violet-700 via-violet-600 to-indigo-500 border-2 border-violet-300/50 text-white shadow-2xl shadow-violet-600/60"
              >
                <Sparkles className="w-full h-full animate-pulse" />
              </Circle>

              {/* Mid Right: Music Icon */}
              <Circle
                ref={div6Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <Music className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-row items-center justify-between z-10">
              {/* Bottom Left: Aperture / Orbit Icon */}
              <Circle
                ref={div3Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <Aperture className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>

              {/* Bottom Right: Magic Wand Icon */}
              <Circle
                ref={div7Ref}
                className="bg-violet-950/70 border-violet-500/30 text-violet-300 p-3 sm:p-3.5 shadow-lg shadow-violet-500/20"
              >
                <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </Circle>
            </div>
          </div>

          {/* Purple Glow Beams matching screenshot theme */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            dotted
            gradientStartColor="#8b5cf6"
            gradientStopColor="#c084fc"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div4Ref}
            dotted
            gradientStartColor="#8b5cf6"
            gradientStopColor="#c084fc"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
            dotted
            gradientStartColor="#8b5cf6"
            gradientStopColor="#c084fc"
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            reverse
            gradientStartColor="#a855f7"
            gradientStopColor="#c084fc"
            dotted
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div4Ref}
            reverse
            dotted
            gradientStartColor="#a855f7"
            gradientStopColor="#c084fc"
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
            gradientStopColor="#c084fc"
          />
        </div>
      </section>
    </LiquidBackground>
  );
}
