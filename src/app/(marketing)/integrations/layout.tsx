import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Integrations",
  description: "Connect Luro AI with the tools and services you already use.",
  path: "/integrations",
  noIndex: false,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
