"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { toast } from "sonner";
import { SIDEBAR_GROUPS } from "@/app/constant/links";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/store/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export const DashboardSidebar = ({ onSearch }: { onSearch?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
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
      toast.error(result.payload?.message ?? "Unable to log out.");
    }
  };

  return (
    <Sidebar collapsible="icon" className="top-16 border-r-white/10">
      <SidebarHeader className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start bg-white/[0.03] text-muted-foreground"
          onClick={onSearch}
        >
          <Search className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Search</span>
          <kbd className="ml-auto rounded border border-white/10 px-1.5 text-[10px] group-data-[collapsible=icon]:hidden">
            ⌘K
          </kbd>
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.links.map((link) => {
                  const active =
                    link.href === "/app"
                      ? pathname === link.href
                      : pathname.startsWith(link.href);
                  return (
                    <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={link.label}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpenMobile(false)}
                        >
                          <link.icon className="size-4" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-muted-foreground hover:text-red-300"
            >
              <LogOut />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
