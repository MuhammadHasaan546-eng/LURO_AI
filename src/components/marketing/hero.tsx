import Container from "@/components/global/container";
import Link from "next/link";
import React from "react";
import { SparklesText } from "../ui/sparkles-text";

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

const Hero = () => {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24"
    >
      {/* Top Announcement Badge */}
      <Container
        delay={0}
        simple
        className="!h-auto !w-auto rounded-full border border-violet-500/30 bg-violet-500/10 p-1 backdrop-blur-xl shadow-lg shadow-violet-500/10"
      >
        <Link
          href="#how-it-works"
          className="group flex min-h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium text-violet-200 transition-all hover:bg-violet-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:text-sm"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-violet-400"></span>
          </span>
          Next-Gen AI Social Media Platform
          <ArrowIcon />
        </Link>
      </Container>

      {/* Main Heading */}
      <Container delay={0.08} className="!h-auto">
        <SparklesText>
          <h1
            id="hero-heading"
            className="mx-auto mt-6 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-white"
          >
            Supercharge Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300">
              Social Media
            </span>{" "}
            with AI Intelligence
          </h1>
        </SparklesText>
      </Container>

      {/* Subtitle Description */}
      <Container delay={0.16} className="!h-auto">
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-slate-300 sm:text-lg sm:leading-8 font-normal">
          Luro is a social media automation tool that helps you create,
          schedule, generate and publish content on social media platforms.
        </p>
      </Container>

      {/* Call to Actions */}
      <Container delay={0.24} className="!h-auto">
        <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3.5 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/auth/signup"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-7 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Start Free Trial
            <ArrowIcon />
          </Link>
          <Link
            href="#dashboard-preview"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-7 text-sm font-medium text-white shadow-inner backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            See Live Demo
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
