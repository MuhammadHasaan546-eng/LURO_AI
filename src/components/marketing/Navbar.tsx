"use client";

import { cn } from "@/functions/cs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "./menu";

const ArrowIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4 transition-transform duration-200 group-hover:translate-x-1"
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

interface NavbarProps {
  isAuthenticated: boolean;
}

export const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("#product");

  useEffect(() => {
    const syncPageState = () => {
      setIsScrolled(window.scrollY > 20);
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

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary navigation"
        className={cn(
          "pointer-events-auto relative mx-auto w-full max-w-7xl rounded-2xl border transition-all duration-300",
          isScrolled || isOpen
            ? "border-violet-500/20 bg-slate-950/85 text-white shadow-xl shadow-slate-950/50 backdrop-blur-xl"
            : "border-white/10 bg-slate-900/40 text-slate-200 shadow-sm backdrop-blur-md hover:border-white/20",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 lg:px-5">
          {/* Logo Brand */}
          <Link
            href="#top"
            aria-label="Luro home"
            onClick={() => selectItem("#top")}
            className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl border transition-all duration-300 group-hover:scale-105",
                isScrolled || isOpen
                  ? "border-violet-500/30 bg-violet-950/50 shadow-inner"
                  : "border-white/15 bg-white/10 group-hover:border-violet-400/40",
              )}
            >
              <Image
                src="/icons/icon.png"
                alt="Luro Logo"
                width={32}
                height={32}
                className="size-6 object-contain"
                priority
              />
            </span>
            <span className="text-[15px] font-extrabold tracking-tight text-white sm:text-base">
              Luro<span className="text-violet-400">.ai</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <Menu
              activeHash={activeHash}
              onSelect={selectItem}
              inverted={!isScrolled && !isOpen}
            />
          </div>

          {/* Action Buttons */}
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-950/50 transition-all duration-200 hover:scale-[1.02] hover:from-violet-500 hover:to-pink-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                Dashboard
                <ArrowIcon />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-950/50 transition-all duration-200 hover:scale-[1.02] hover:from-violet-500 hover:to-pink-500 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  Start free
                  <ArrowIcon />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((open) => !open)}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden"
          >
            <span className="relative block h-4 w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 top-1 block h-0.5 w-5 bg-current transition-transform duration-200 rounded-full",
                  isOpen && "translate-y-1 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-1 left-0 block h-0.5 w-5 bg-current transition-transform duration-200 rounded-full",
                  isOpen && "-translate-y-1 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,visibility] duration-300 ease-out md:hidden",
            isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden rounded-b-2xl">
            <div className="flex flex-col gap-4 border-t border-white/10 px-4 pb-5 pt-4">
              <Menu activeHash={activeHash} onSelect={selectItem} mobile />
              <div
                className={cn(
                  "grid gap-2.5 border-t border-white/10 pt-4",
                  isAuthenticated ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                {isAuthenticated ? (
                  <Link
                    href="/app"
                    onClick={() => setIsOpen(false)}
                    className="group flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-xs font-semibold text-white shadow-md transition-all hover:from-violet-500 hover:to-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    Dashboard
                    <ArrowIcon />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsOpen(false)}
                      className="flex h-10 items-center justify-center rounded-xl border border-white/10 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="group flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-xs font-semibold text-white shadow-md transition-all hover:from-violet-500 hover:to-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    >
                      Start free
                      <ArrowIcon />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
