"use client";
import { cn } from "@/lib/utils";
import React, { useContext, createContext } from "react";
interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  ProximitySpotlight?: boolean;
  HoverFocusSpotlight?: boolean;
  CursorFlowGradient?: boolean;
}
interface SpotlightItemProps {
  children: React.ReactNode;
  className?: string;
}

interface SpotLightContextType {
  ProximitySpotlight: boolean;
  HoverFocusSpotlight: boolean;
  CursorFlowGradient: boolean;
}

const SpotLightContext = createContext<SpotLightContextType | undefined>(
  undefined,
);
export const useSpotlight = () => {
  const context = useContext(SpotLightContext);
  if (!context) {
    throw new Error("useSpotlight must be used within a SpotlightProvider");
  }
  return context;
};
export const Spotlight = ({
  children,
  className,
  ProximitySpotlight = true,
  HoverFocusSpotlight = false,
  CursorFlowGradient = true,
}: SpotlightProps) => {
  return (
    <SpotLightContext.Provider
      value={{
        ProximitySpotlight,
        HoverFocusSpotlight,
        CursorFlowGradient,
      }}
    >
      <div className={cn("group relative z-10 rounded-md    ", className)}>
        {children}
      </div>
    </SpotLightContext.Provider>
  );
};
export function SpotLightItem({ children, className }: SpotlightItemProps) {
  const { HoverFocusSpotlight, ProximitySpotlight, CursorFlowGradient } =
    useSpotlight();

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const { left, top } = element.getBoundingClientRect();

    element.style.setProperty("--spotlight-local-x", `${event.clientX - left}px`);
    element.style.setProperty("--spotlight-local-y", `${event.clientY - top}px`);
    element.style.setProperty("--spotlight-screen-x", `${event.clientX}px`);
    element.style.setProperty("--spotlight-screen-y", `${event.clientY}px`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn(
        className,
        "group/spotlight relative rounded-lg p-[2px] bg-[#ffffff15] overflow-hidden",
      )}
    >
      {CursorFlowGradient && (
        <div
          className="pointer-events-none absolute inset-0 z-50 rounded-xl opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
          style={{
            background:
              "radial-gradient(250px circle at var(--spotlight-local-x, 50%) var(--spotlight-local-y, 50%), rgba(255, 255, 255, 0.137), transparent 80%)",
          }}
        />
      )}
      {HoverFocusSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-fixed opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--spotlight-screen-x, 50%) var(--spotlight-screen-y, 50%), #ffffff76 0%, transparent 20%) fixed",
          }}
        />
      )}
      {ProximitySpotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-fixed"
          style={{
            background:
              "radial-gradient(circle at var(--spotlight-screen-x, 50%) var(--spotlight-screen-y, 50%), #ffffff6e 0%, transparent 20%) fixed",
          }}
        />
      )}
      {children}
    </div>
  );
}

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SpotlightCard({
  children,
  className = "",
}: SpotlightCardProps) {
  return (
    <div
      className={`relative h-full bg-slate-800 rounded-3xl p-px before:absolute before:w-80 before:h-80 before:-left-40 before:-top-40 before:bg-slate-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-(--mouse-x) before:translate-y-(--mouse-y) group-hover:before:opacity-100 before:z-10 before:blur-[100px] after:absolute after:w-96 after:h-96 after:-left-48 after:-top-48 after:bg-indigo-500 after:rounded-full after:opacity-0 after:pointer-events-none after:transition-opacity after:duration-500 after:translate-x-(--mouse-x) after:translate-y-(--mouse-y) hover:after:opacity-10 after:z-30 after:blur-[100px] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
