import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Chat",
  description: "Chat with AI to brainstorm, write, research, and solve problems.",
  path: "/app/chat",
  noIndex: true,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
