"use client";
import { cn } from "@/functions/cs";
// import { useClerk } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

export const Navbar = () => {
  // const { user } = useClerk();
  const [isOpen, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="relative w-full">
      {/* Background Mask Overlay */}
      <div className="z-[99] fixed pointer-events-none inset-x-0 top-0 h-[88px] bg-[rgba(10,10,10,0.8)] backdrop-blur-sm [mask-image:linear-gradient(to_bottom,#000_20%,transparent_100%)]" />

      {/* Main Floating Header */}
      <header
        className={cn(
          "fixed inset-x-0 top-3 mx-auto max-w-6xl px-4 md:px-12 z-[100] transition-all duration-300 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between overflow-hidden",
          isOpen ? "h-[calc(100vh-24px)]" : "h-12",
        )}
      >
        {/* Top Bar: Brand & Toggle */}
        <div className="flex items-center justify-between h-12 w-full">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">Market</span>
          </div>

          {/* Nav items for desktop */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
          </div>

          {/* Toggle Button for Mobile */}
          <button
            onClick={() => setOpen(!isOpen)}
            className="md:hidden text-white focus:outline-none p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Expanded Drawer Content for Mobile */}
        {isOpen && (
          <div className="flex-1 flex flex-col justify-center space-y-6 text-center text-lg text-gray-200 py-8">
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              About
            </a>
          </div>
        )}
      </header>
    </div>
  );
};
