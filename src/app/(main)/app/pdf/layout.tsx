import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI PDF Assistant",
  description: "Upload documents and use AI to understand, summarize, and chat with PDFs.",
  path: "/app/pdf",
  noIndex: true,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
