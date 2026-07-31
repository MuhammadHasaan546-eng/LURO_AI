"use client";

import { cn } from "@/functions/cs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "./menu";

const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("#product");

  useEffect(() => {
    const syncPageState = () => {
      setIsScrolled(window.scrollY > 24);
      setActiveHash(window.location.hash || "#product");
    };

    syncPageState();
    window.addEventListener("scroll", syncPageState, { passive: true });
    window.addEventListener("hashchange", syncPageState);

    return () => {
      window.removeEventListener("scroll", syncPageState);
      window.removeEventListener("hashchange", syncPageState);
    };
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

  const hasSolidSurface = isScrolled || isOpen;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary navigation"
        className={cn(
          "pointer-events-auto relative mx-auto w-full max-w-7xl rounded-2xl border transition-all duration-300",
          hasSolidSurface
            ? "border-black/[0.08] bg-white/[0.92] text-[#181225] shadow-[0_12px_40px_rgba(20,10,40,0.12)] backdrop-blur-2xl"
            : "border-white/10 bg-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 lg:px-5">
          <Link
            href="#top"
            aria-label="Luro home"
            onClick={() => selectItem("#top")}
            className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl border shadow-sm transition-colors",
                hasSolidSurface
                  ? "border-violet-200 bg-violet-50"
                  : "border-white/15 bg-white/10",
              )}
            >
              <Image
                src="/icons/icon.png"
                alt=""
                width={32}
                height={32}
                className="size-7 object-contain"
                priority
              />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.02em] sm:text-base">
              Luro
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <Menu
              activeHash={activeHash}
              onSelect={selectItem}
              inverted={!hasSolidSurface}
            />
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/login"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                hasSolidSurface
                  ? "text-black/65 hover:bg-black/5 hover:text-black"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                "group inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0",
                hasSolidSurface
                  ? "bg-[#211238] text-white hover:bg-[#321a55]"
                  : "bg-white text-[#211238] hover:bg-violet-50",
              )}
            >
              Start free
              <ArrowIcon />
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:hidden"
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-1 block h-px w-5 bg-current transition-transform duration-200",
                  isOpen && "translate-y-1 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-1 left-0 block h-px w-5 bg-current transition-transform duration-200",
                  isOpen && "-translate-y-1 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>

        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,visibility] duration-300 ease-out md:hidden",
            isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden rounded-b-2xl">
            <div className="flex flex-col gap-4 border-t border-black/[0.07] px-3 pb-4 pt-3 sm:px-4">
              <Menu activeHash={activeHash} onSelect={selectItem} mobile />
              <div className="grid grid-cols-2 gap-2 border-t border-black/[0.07] pt-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full border border-black/10 text-sm font-semibold text-black/70 transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="group flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#211238] text-sm font-semibold text-white transition-colors hover:bg-[#321a55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  Start free
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
