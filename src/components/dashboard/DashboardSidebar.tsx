"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { LogOut, SearchIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SIDEBAR_LINKS } from "@/app/constant/links";
import Container from "../global/container";

export const DashboardSidebar = () => {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <Sidebar collapsible="icon" className="top-16 border-r border-border/50">
      <SidebarHeader className="p-3">
        <Container delay={0.2} className="h-max w-full">
          <Button
            variant="outline"
            className="w-full justify-between px-3 text-muted-foreground hover:text-foreground bg-muted/30"
          >
            <span className="flex items-center gap-x-2 text-xs">
              <SearchIcon className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Search...
              </span>
            </span>
            <kbd className="pointer-events-none group-data-[collapsible=icon]:hidden inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
        </Container>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_LINKS?.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                    >
                      <Container delay={0.3} className="h-max w-full">
                        <Link
                          href={link.href}
                          className="flex items-center gap-x-3"
                        >
                          {Icon && <Icon className="size-4" />}
                          <span>{link.label}</span>
                        </Link>
                      </Container>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto mb-2 p-2 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarFooter className="mt-auto p-2 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Hover par resize ya collapse ke liye rail */}
      <SidebarRail />
    </Sidebar>
  );
};
