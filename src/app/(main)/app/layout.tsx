import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentSession } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata: Metadata = createPageMetadata({
  title: "AI Workspace",
  description:
    "Your private Luro AI workspace for creating and managing AI-powered work.",
  path: "/app",
  noIndex: true,
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/signin");

  return (
    <TooltipProvider>
      <DashboardShell>{children}</DashboardShell>
    </TooltipProvider>
  );
}
