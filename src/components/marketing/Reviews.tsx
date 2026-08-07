"use client";

import React, { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const reviews = [
  {
    name: "Alex Rivera",
    username: "@alexrivera",
    body: "The AI automation transformed our social strategy. We grew from 5k to 50k followers in under 3 months.",
    img: "https://avatar.vercel.sh/alex",
  },
  {
    name: "Sarah Chen",
    username: "@sarahchen_dev",
    body: "The virality score feature is shockingly accurate. Every post we queue up reaches peak engagement seamlessly.",
    img: "https://avatar.vercel.sh/sarah",
  },
  {
    name: "Marcus Vance",
    username: "@marcus_vance",
    body: "Scheduling across 4 platforms with customized brand templates saves our marketing team 15+ hours every week.",
    img: "https://avatar.vercel.sh/marcus",
  },
  {
    name: "Elena Rostova",
    username: "@elena_growth",
    body: "Hands down the best growth engine for modern creators. The real-time conversion insights alone are worth every penny.",
    img: "https://avatar.vercel.sh/elena",
  },
  {
    name: "David K.",
    username: "@davidk_design",
    body: "The UX is absurdly clean. Pushing content across multiple platforms feels completely effortless now.",
    img: "https://avatar.vercel.sh/david",
  },
  {
    name: "Priya Patel",
    username: "@priyapatel_ai",
    body: "Being able to invite unlimited team members without paying per seat completely sold us. Unbeatable value.",
    img: "https://avatar.vercel.sh/priya",
  },
];

const firstRow = reviews.slice(0, 3);
const secondRow = reviews.slice(3, 6);
const thirdRow = reviews.slice(0, 3);
const fourthRow = reviews.slice(3, 6);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-300",
        "border-violet-500/20 bg-slate-900/90 hover:border-violet-500/40 hover:bg-slate-900 shadow-lg shadow-violet-950/20",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img
          className="rounded-full border border-violet-500/30"
          width="36"
          height="36"
          alt={name}
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-semibold text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-slate-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-xs leading-relaxed text-slate-300">
        {body}
      </blockquote>
    </figure>
  );
};

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "150px 0px" });
  const reduceMotion = useReducedMotion();
  const shouldAnimate = isInView && !reduceMotion;

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full uppercase tracking-wider">
          Community Loved
        </span>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">
          Trusted by Top Creators & Teams
        </h2>
        <p className="text-slate-400 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
          See how thousands of modern teams leverage our platform to scale their
          social presence.
        </p>
      </div>

      {/* 3D Marquee Container */}
      <div className="relative flex h-[480px] w-full flex-row items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-8 backdrop-blur-md shadow-2xl shadow-violet-950/20 [perspective:300px]">
        <div
          className="flex flex-row items-center gap-4"
          style={{
            transform:
              "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
          }}
        >
          <Marquee
            pauseOnHover
            vertical
            repeat={2}
            active={shouldAnimate}
            className="[--duration:25s] motion-reduce:animate-none"
          >
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee
            reverse
            pauseOnHover
            vertical
            repeat={2}
            active={shouldAnimate}
            className="[--duration:25s] motion-reduce:animate-none"
          >
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee
            reverse
            pauseOnHover
            vertical
            repeat={2}
            active={shouldAnimate}
            className="[--duration:25s] motion-reduce:animate-none"
          >
            {thirdRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee
            pauseOnHover
            vertical
            repeat={2}
            active={shouldAnimate}
            className="[--duration:25s] motion-reduce:animate-none"
          >
            {fourthRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Gradient Edge Overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-slate-950 to-transparent"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent"></div>
      </div>
    </section>
  );
}
