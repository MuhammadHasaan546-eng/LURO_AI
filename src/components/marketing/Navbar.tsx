"use client";

import { cn } from "@/functions/cs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "./menu";

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
    <header className="pointer-events-none sticky inset-x-0 top-3 z-[100] flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto relative mx-auto w-full max-w-6xl rounded-[20px] border border-black/10 bg-white/75 text-black shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl"
      >
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-[60px] sm:px-4 md:gap-4 md:px-5">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Luro AI home"
            onClick={() => selectItem("#top")}
            className="grid size-9 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2"
          >
            <Image
              src="/icons/icon.png"
              alt=""
              width={36}
              height={36}
              className="size-8 object-contain"
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <Menu activeHash={activeHash} onSelect={selectItem} />
          </div>

          {/* Desktop Actions */}
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-black/80 transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <span>Start for free</span>
              <svg
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
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
            className="grid h-10 min-w-14 shrink-0 place-items-center rounded-full px-3 text-black transition-colors hover:bg-black/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 md:hidden"
          >
            <span
              aria-hidden="true"
              className="text-xs font-semibold uppercase tracking-wider"
            >
              {isOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>

        {/* Mobile menu container */}
        <div
          id="mobile-navigation"
          className={cn(
            "grid transition-[grid-template-rows,visibility] duration-300 ease-out md:hidden",
            isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden rounded-b-[20px]">
            <div className="flex flex-col gap-4 border-t border-black/10 px-4 py-4 sm:px-5">
              <Menu activeHash={activeHash} onSelect={selectItem} mobile />

              {/* Mobile Actions */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-black/10">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full border border-black/10 text-sm font-medium text-black transition-colors hover:bg-black/5"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="group flex h-11 items-center justify-center gap-1.5 rounded-full  text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <span>Start for free</span>
                  <svg
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
