"use client";

import React, { useRef } from "react";
import { useInView } from "motion/react";
import { type Colors, Liquid } from "@/components/ui/liquid-gradient";

// Dark Violet / Electric Blue Palette jo humare Dark Theme ke sath match kare
const DARK_LIQUID_COLORS: Colors = {
  color1: "#0a0a16",
  color2: "#1E10C5",
  color3: "#7D7BF4",
  color4: "#12093b",
  color5: "#050515",
  color6: "#4743EF",
  color7: "#0E2DCB",
  color8: "#0017E9",
  color9: "#290ECB",
  color10: "#000000",
  color11: "#0B06FC",
  color12: "#3F4CC0",
  color13: "#1403DE",
  color14: "#9089E2",
  color15: "#1e1b4b",
  color16: "#290ECB",
  color17: "#3F4CC0",
};

export const LiquidBackground = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "150px 0px" });

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 h-full w-full opacity-40">
        <Liquid colors={DARK_LIQUID_COLORS} active={isInView} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
