import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Insights & Product Updates",
  description: "Read the latest AI insights, product updates, and practical guides from Luro AI.",
  path: "/blog",
  noIndex: false,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
