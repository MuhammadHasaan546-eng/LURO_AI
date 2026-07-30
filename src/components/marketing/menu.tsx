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
};

const featureList = [
  {
    title: "Social Automation",
    description: "Automate posts across your social platforms seamlessly.",
    href: "#automation",
    icon: Bot,
    badge: "Popular",
  },
  {
    title: "AI Analytics",
    description: "Real-time engagement metrics powered by AI.",
    href: "#analytics",
    icon: BarChart3,
  },
  {
    title: "Content Scheduler",
    description: "Plan and calendar marketing content in advance.",
    href: "#scheduler",
    icon: CalendarDays,
  },
];

const resourceList = [
  {
    title: "Documentation",
    description: "Guides and API reference for integrating Luro AI.",
    href: "#docs",
    icon: BookOpen,
  },
  {
    title: "Blog",
    description: "Latest updates, marketing tips, and product news.",
    href: "#blog",
    icon: Newspaper,
  },
  {
    title: "Community",
    description: "Connect with creators and share growth strategies.",
    href: "#community",
    icon: Users,
  },
];

export function Menu({ activeHash, onSelect, mobile = false }: MenuProps) {
  const [openMobileFeatures, setOpenMobileFeatures] = useState(false);
  const [openMobileResources, setOpenMobileResources] = useState(false);

  // --- MOBILE LAYOUT ---
  if (mobile) {
    return (
      <div className="flex w-full flex-col gap-1.5 pt-1">
        {/* 1. How to start */}
        <Link
          href="#how-it-works"
          onClick={() => onSelect("#how-it-works")}
          className={cn(
            "flex h-11 w-full items-center rounded-xl px-4 text-sm font-medium transition-colors",
            activeHash === "#how-it-works"
              ? "bg-black/10 font-semibold text-black"
              : "text-black/80 hover:bg-black/5 hover:text-black",
          )}
        >
          How to start
        </Link>

        {/* 2. Features Accordion */}
        <div className="overflow-hidden rounded-xl border border-black/5 bg-black/[0.02]">
          <button
            type="button"
            onClick={() => setOpenMobileFeatures((prev) => !prev)}
            className="flex h-11 w-full items-center justify-between px-4 text-sm font-medium text-black/80 hover:text-black"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Features
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-black/50 transition-transform duration-200",
                openMobileFeatures && "rotate-180",
              )}
            />
          </button>

          {openMobileFeatures && (
            <div className="flex flex-col gap-1.5 p-2 pt-0">
              {featureList.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => onSelect(item.href)}
                    className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-black transition-colors group-hover:bg-black group-hover:text-white">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Pricing */}
        <Link
          href="#pricing"
          onClick={() => onSelect("#pricing")}
          className={cn(
            "flex h-11 w-full items-center rounded-xl px-4 text-sm font-medium transition-colors",
            activeHash === "#pricing"
              ? "bg-black/10 font-semibold text-black"
              : "text-black/80 hover:bg-black/5 hover:text-black",
          )}
        >
          Pricing
        </Link>

        {/* 4. Integrations */}
        <Link
          href="#integrations"
          onClick={() => onSelect("#integrations")}
          className={cn(
            "flex h-11 w-full items-center rounded-xl px-4 text-sm font-medium transition-colors",
            activeHash === "#integrations"
              ? "bg-black/10 font-semibold text-black"
              : "text-black/80 hover:bg-black/5 hover:text-black",
          )}
        >
          Integrations
        </Link>

        {/* 5. Resources Accordion */}
        <div className="overflow-hidden rounded-xl border border-black/5 bg-black/[0.02]">
          <button
            type="button"
            onClick={() => setOpenMobileResources((prev) => !prev)}
            className="flex h-11 w-full items-center justify-between px-4 text-sm font-medium text-black/80 hover:text-black"
          >
            <span>Resources</span>
            <ChevronDown
              className={cn(
                "size-4 text-black/50 transition-transform duration-200",
                openMobileResources && "rotate-180",
              )}
            />
          </button>

          {openMobileResources && (
            <div className="flex flex-col gap-1.5 p-2 pt-0">
              {resourceList.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => onSelect(item.href)}
                    className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-black transition-colors group-hover:bg-black group-hover:text-white">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.title}
                      </span>
                      <p className="mt-0.5 text-xs leading-snug text-gray-500">
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
      <NavigationMenuList className="flex items-center justify-center gap-1 sm:gap-2">
        {/* How to start */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="#how-it-works"
              onClick={() => onSelect("#how-it-works")}
              className={cn(
                "flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors",
                activeHash === "#how-it-works"
                  ? "bg-black/10 font-semibold text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black",
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
              "h-10 rounded-full bg-transparent px-4 text-sm font-medium transition-colors",
              activeHash === "#features"
                ? "bg-black/10 font-semibold text-black"
                : "text-black/70 hover:bg-black/5 hover:text-black",
            )}
          >
            Features
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[380px] sm:w-[420px] rounded-2xl border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-lg">
            <ul className="grid gap-1.5">
              {featureList.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={feature.href}
                        onClick={() => onSelect(feature.href)}
                        className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-black/[0.04]"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black transition-colors group-hover:bg-black group-hover:text-white">
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
                              {feature.title}
                            </span>
                            {feature.badge && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                {feature.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
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
              href="#pricing"
              onClick={() => onSelect("#pricing")}
              className={cn(
                "flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors",
                activeHash === "#pricing"
                  ? "bg-black/10 font-semibold text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black",
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
              href="#integrations"
              onClick={() => onSelect("#integrations")}
              className={cn(
                "flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors",
                activeHash === "#integrations"
                  ? "bg-black/10 font-semibold text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black",
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
              "h-10 rounded-full bg-transparent px-4 text-sm font-medium transition-colors",
              activeHash === "#resources"
                ? "bg-black/10 font-semibold text-black"
                : "text-black/70 hover:bg-black/5 hover:text-black",
            )}
          >
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-[380px] sm:w-[420px] rounded-2xl border border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur-lg">
            <ul className="grid gap-1.5">
              {resourceList.map((resource) => {
                const Icon = resource.icon;
                return (
                  <li key={resource.title}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={resource.href}
                        onClick={() => onSelect(resource.href)}
                        className="group flex items-start gap-3.5 rounded-xl p-3 transition-colors hover:bg-black/[0.04]"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/5 text-black transition-colors group-hover:bg-black group-hover:text-white">
                          <Icon className="size-5" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
                            {resource.title}
                          </span>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
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

      <div className="absolute left-0 top-full flex justify-center">
        <NavigationMenuViewport />
      </div>
    </NavigationMenu>
  );
}
