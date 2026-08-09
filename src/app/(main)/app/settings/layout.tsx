import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Workspace Settings",
  description: "Manage your private Luro AI workspace preferences and account settings.",
  path: "/app/settings",
  noIndex: true,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
