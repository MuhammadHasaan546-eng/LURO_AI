"use client";

import { HelpCircleIcon, LogOutIcon, Loader2Icon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import Icons from "../global/icons";
import { logout } from "@/store/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { toast } from "sonner";
import { Button } from "../ui/button";
import Container from "../global/container";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";

const DashboardNavbar = () => {
  const { openMobile } = useSidebar();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggingOut = useAppSelector(
    (state) =>
      state.auth.status === "loading" && state.auth.operation === "logout",
  );

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (logout.fulfilled.match(result)) {
      toast.success("You have been logged out securely.");
      router.replace("/auth/signin");
      router.refresh();
    } else if (logout.rejected.match(result) && !result.meta.condition) {
      toast.error(
        result.payload?.message ?? "Unable to log out. Please try again.",
      );
    }
  };

  return (
    <header
      id="dashboard-navbar"
      className="fixed top-0 inset-x-0 w-full h-16 bg-background/40 backdrop-blur-md border-b border-border/500 px-4 z-50"
    >
      <Container className="flex  items-center justify-between size-full ">
        <div className="flex item-center">
          <Link
            href="/app"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Icons.icon className="w-6" />
            <span className="text-lg font-semibold">Luro</span>
          </Link>
        </div>
        <div className="flex item-center gap-x-2">
          <Button size="sm" variant="ghost">
            <ZapIcon className="size-4 mr-1.5 text-orange-500 fill-orange-500 " />
            Upgrade
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out of your account"
            className="text-muted-foreground hover:text-destructive"
          >
            {isLoggingOut ? (
              <Loader2Icon className="size-4 mr-1.5 animate-spin" />
            ) : (
              <LogOutIcon className="size-4 mr-1.5" />
            )}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>

          <Button
            asChild
            size="icon"
            variant="ghost"
            className="hidden lg:flex"
          >
            <Link href="/help" target="_blank">
              <HelpCircleIcon className="size-5" />
            </Link>
          </Button>
          <SidebarTrigger
            className="md:hidden"
            aria-label={
              openMobile
                ? "Close dashboard navigation"
                : "Open dashboard navigation"
            }
            aria-expanded={openMobile}
          />
        </div>
      </Container>
    </header>
  );
};

export default DashboardNavbar;
