import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Luro AI Community",
  description: "Join the Luro AI community to share ideas, workflows, and AI productivity tips.",
  path: "/community",
  noIndex: false,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
