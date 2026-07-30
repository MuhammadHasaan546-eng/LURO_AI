"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Social Automation",
    href: "/docs/social-automation",
    description:
      "Automate your posts across Facebook, Instagram, and LinkedIn seamlessly.",
  },
  {
    title: "AI Analytics",
    href: "/docs/ai-analytics",
    description:
      "Deep dive into your social engagement with real-time AI metrics.",
  },
  {
    title: "Content Scheduler",
    href: "/docs/scheduler",
    description: "Plan and calendar your marketing content weeks in advance.",
  },
  {
    title: "Campaign Builder",
    href: "/docs/campaigns",
    description:
      "Create target marketing campaigns with integrated AI prompts.",
  },
];

export function Navbar() {
  return (
    <div className="fixed top-3 inset-x-4 mx-auto max-w-6xl z-[100] rounded-2xl bg-black/60 border border-white/20 backdrop-blur-md px-6 py-2.5 flex items-center justify-between">
      {/* Brand / Logo */}
      <Link href="/" className="text-lg font-bold text-white tracking-tight">
        Market<span className="text-blue-500">AI</span>
      </Link>

      {/* Navigation Menu */}
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          {/* Dropdown Menu Item 1 */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-gray-200 hover:text-white hover:bg-white/10 focus:bg-white/10 text-sm">
              Getting Started
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-zinc-950 border border-zinc-800 text-white rounded-xl">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-600/20 to-zinc-900 p-6 no-underline outline-none focus:shadow-md border border-white/10"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-semibold text-white">
                        MarketAI Suite
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        All-in-one AI platform to manage social media campaigns
                        effortlessly.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/docs" title="Introduction">
                  Overview of how MarketAI powers up your workflow.
                </ListItem>
                <ListItem href="/docs/installation" title="Quick Setup">
                  Connect your accounts in under 2 minutes.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Dropdown Menu Item 2 */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-gray-200 hover:text-white hover:bg-white/10 focus:bg-white/10 text-sm">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-zinc-950 border border-zinc-800 text-white rounded-xl">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Direct Link */}
          <NavigationMenuItem>
            <Link href="#pricing" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "bg-transparent text-gray-200 hover:text-white hover:bg-white/10 text-sm",
                )}
              >
                Pricing
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Action Button */}
      <button className="text-xs font-medium bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
        Get Started
      </button>
    </div>
  );
}

// Reusable List Item Component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-800/80 hover:text-white focus:bg-zinc-800",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-white">
            {title}
          </div>
          <p className="line-clamp-2 text-xs leading-normal text-zinc-400 mt-1">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
