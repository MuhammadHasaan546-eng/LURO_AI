"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Bot,
  BarChart3,
  CalendarDays,
  BookOpen,
  Newspaper,
  Users,
  ChevronDown,
  Sparkles,
} from "lucide-react";

type MenuProps = {
  activeHash: string;
  onSelect: (href: string) => void;
  mobile?: boolean;
  inverted?: boolean;
};

const featureList = [
  {
    title: "Social Automation",
    description: "Automate posts across your social platforms seamlessly.",
    href: "/automation",
    icon: Bot,
    badge: "Popular",
  },
  {
    title: "AI Analytics",
    description: "Real-time engagement metrics powered by AI.",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Content Scheduler",
    description: "Plan and calendar marketing content in advance.",
    href: "/scheduler",
    icon: CalendarDays,
  },
];

const resourceList = [
  {
    title: "Documentation",
    description: "Guides and API reference for integrating Luro AI.",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "Blog",
    description: "Latest updates, marketing tips, and product news.",
    href: "/blog",
    icon: Newspaper,
  },
  {
    title: "Community",
    description: "Connect with creators and share growth strategies.",
    href: "/community",
    icon: Users,
  },
];

export function Menu({
  activeHash,
  onSelect,
  mobile = false,
  inverted = false,
}: MenuProps) {
  const [openMobileFeatures, setOpenMobileFeatures] = useState(false);
  const [openMobileResources, setOpenMobileResources] = useState(false);

  const linkStyle = inverted
    ? "text-slate-300 hover:bg-white/10 hover:text-white"
    : "text-slate-200 hover:bg-violet-500/10 hover:text-white";

  const activeLinkStyle =
    "bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30";

  // --- MOBILE LAYOUT ---
  if (mobile) {
    return (
      <div className="flex w-full flex-col gap-1.5 pt-1">
        <Link
          href="/"
          onClick={() => onSelect("#how-it-works")}
          className={cn(
            "flex h-10 w-full items-center rounded-xl px-4 text-xs font-medium transition-all",
            activeHash === "#how-it-works"
              ? activeLinkStyle
              : "text-slate-300 hover:bg-white/5 hover:text-white",
          )}
        >
          How to start
        </Link>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
          <button
            type="button"
            onClick={() => setOpenMobileFeatures((prev) => !prev)}
            className="flex h-10 w-full items-center justify-between px-4 text-xs font-medium text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-violet-400" />
              Features
            </span>
            <ChevronDown
              className={cn(
                "size-3.5 text-slate-400 transition-transform duration-200",
                openMobileFeatures && "rotate-180",
              )}
            />
          </button>

          {openMobileFeatures && (
            <div className="flex flex-col gap-1 p-2 pt-0">
              {featureList.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => onSelect(item.href)}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-all hover:bg-violet-500/10"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-violet-400 group-hover:border-violet-500/30 group-hover:bg-violet-600 group-hover:text-white transition-all">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-300 border border-violet-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/pricing"
          onClick={() => onSelect("/pricing")}
          className={cn(
            "flex h-10 w-full items-center rounded-xl px-4 text-xs font-medium transition-all",
            activeHash === "/pricing"
              ? activeLinkStyle
              : "text-slate-300 hover:bg-white/5 hover:text-white",
          )}
        >
          Pricing
        </Link>

        <Link
          href="/integrations"
          onClick={() => onSelect("/integrations")}
          className={cn(
            "flex h-10 w-full items-center rounded-xl px-4 text-xs font-medium transition-all",
            activeHash === "/integrations"
              ? activeLinkStyle
              : "text-slate-300 hover:bg-white/5 hover:text-white",
          )}
        >
          Integrations
        </Link>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
          <button
            type="button"
            onClick={() => setOpenMobileResources((prev) => !prev)}
            className="flex h-10 w-full items-center justify-between px-4 text-xs font-medium text-slate-300 hover:text-white"
          >
            <span>Resources</span>
            <ChevronDown
              className={cn(
                "size-3.5 text-slate-400 transition-transform duration-200",
                openMobileResources && "rotate-180",
              )}
            />
          </button>

          {openMobileResources && (
            <div className="flex flex-col gap-1 p-2 pt-0">
              {resourceList.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => onSelect(item.href)}
                    className="group flex items-start gap-3 rounded-lg p-2 transition-all hover:bg-violet-500/10"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-violet-400 group-hover:border-violet-500/30 group-hover:bg-violet-600 group-hover:text-white transition-all">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                        {item.title}
                      </span>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <NavigationMenu className="relative z-50 mx-auto">
      <NavigationMenuList className="flex items-center justify-center gap-1">
        {/* How to start */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/"
              onClick={() => onSelect("/")}
              className={cn(
                "flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold transition-all",
                activeHash === "/" ? activeLinkStyle : linkStyle,
              )}
            >
              How to start
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Features Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "h-9 rounded-xl bg-transparent px-3.5 text-xs font-semibold transition-all focus:bg-transparent active:bg-transparent data-[state=open]:bg-violet-500/10 data-[state=open]:text-white",
              activeHash === "#features" ? activeLinkStyle : linkStyle,
            )}
          >
            Features
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[360px] sm:w-[400px] rounded-2xl border border-violet-500/20 bg-slate-950/95 p-2 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
            <ul className="grid gap-1">
              {featureList.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={feature.href}
                        onClick={() => onSelect(feature.href)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-violet-500/10"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-violet-400 group-hover:border-violet-500/40 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                              {feature.title}
                            </span>
                            {feature.badge && (
                              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold text-violet-300 border border-violet-500/30">
                                {feature.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                            {feature.description}
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Pricing */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/pricing"
              onClick={() => onSelect("/pricing")}
              className={cn(
                "flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold transition-all",
                activeHash === "/pricing" ? activeLinkStyle : linkStyle,
              )}
            >
              Pricing
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Integrations */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/integrations"
              onClick={() => onSelect("/integrations")}
              className={cn(
                "flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold transition-all",
                activeHash === "/integrations" ? activeLinkStyle : linkStyle,
              )}
            >
              Integrations
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Resources Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "h-9 rounded-xl bg-transparent px-3.5 text-xs font-semibold transition-all focus:bg-transparent active:bg-transparent data-[state=open]:bg-violet-500/10 data-[state=open]:text-white",
              activeHash === "/resources" ? activeLinkStyle : linkStyle,
            )}
          >
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[360px] sm:w-[400px] rounded-2xl border border-violet-500/20 bg-slate-950/95 p-2 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
            <ul className="grid gap-1">
              {resourceList.map((resource) => {
                const Icon = resource.icon;
                return (
                  <li key={resource.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={resource.href}
                        onClick={() => onSelect(resource.href)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-violet-500/10"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-violet-400 group-hover:border-violet-500/40 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                            {resource.title}
                          </span>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                            {resource.description}
                          </p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                );
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>

      {/* FIXED VIEWPORT POSITIONING */}
      <div className="absolute left-0 top-full flex w-full justify-center">
        <NavigationMenuViewport className="origin-top-center relative mt-2.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-950/95 shadow-2xl transition-[width,height] duration-300 data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in" />
      </div>
    </NavigationMenu>
  );
}
