"use client";

import { cn } from "@/functions/cs";
import {
  BadgeDollarSign,
  ChevronDown,
  CircleHelp,
  Compass,
  Menu,
  Sparkles,
  SunMedium,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  hasMenu?: boolean;
};

const navItems: NavItem[] = [
  { label: "How it works", href: "#how-it-works", icon: Compass },
  { label: "Features", href: "#features", icon: Sparkles, hasMenu: true },
  { label: "Pricing", href: "#pricing", icon: BadgeDollarSign },
  { label: "About", href: "#about", icon: CircleHelp },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#how-it-works");

  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash || "#how-it-works");
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [isOpen]);

  const selectItem = (href: string) => {
    setActiveHash(href);
    setIsOpen(false);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary navigation"
        className={cn(
          "pointer-events-auto mx-auto w-full max-w-6xl overflow-hidden border border-white/[0.12] bg-[#292929]/90 text-[#d7d7d7] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
          "rounded-[18px] transition-[border-radius,background-color] duration-300",
          isOpen && "bg-[#242424]/95",
        )}
      >
        <div className="flex h-14 items-center px-3 sm:h-[60px] sm:px-4">
          <a
            href="#top"
            aria-label="Luro AI home"
            onClick={() => selectItem("#top")}
            className="mr-2 grid size-9 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:mr-4"
          >
            <SunMedium
              aria-hidden="true"
              className="size-[19px]"
              strokeWidth={1.7}
            />
          </a>

          <div className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
            {navItems.map(({ label, href, icon: Icon, hasMenu }) => {
              const isActive = activeHash === href;

              return (
                <a
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => selectItem(href)}
                  className={cn(
                    "group relative flex h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-medium transition-colors lg:px-4 lg:text-sm",
                    "hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    isActive && "bg-white/[0.08] text-white",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 opacity-75 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.8}
                  />
                  <span className="whitespace-nowrap">{label}</span>
                  {hasMenu && (
                    <ChevronDown
                      aria-hidden="true"
                      className="size-3.5 shrink-0 opacity-70 transition-transform group-hover:translate-y-0.5"
                      strokeWidth={1.8}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-px origin-center scale-x-0 bg-white/80 transition-transform",
                      isActive && "scale-x-100",
                    )}
                  />
                </a>
              );
            })}
          </div>

          <button
            type="button"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="ml-auto grid size-10 place-items-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:hidden"
          >
            {isOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>

        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,visibility] duration-300 ease-out md:hidden",
            isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-white/10 p-2.5">
              {navItems.map(({ label, href, icon: Icon, hasMenu }) => {
                const isActive = activeHash === href;

                return (
                  <a
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => selectItem(href)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                      "hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70",
                      isActive
                        ? "bg-white/[0.09] text-white"
                        : "text-[#c5c5c5]",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-[18px] shrink-0"
                      strokeWidth={1.8}
                    />
                    <span>{label}</span>
                    {hasMenu && (
                      <ChevronDown
                        aria-hidden="true"
                        className="ml-auto size-4 opacity-70"
                        strokeWidth={1.8}
                      />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
