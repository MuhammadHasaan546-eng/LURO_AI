import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Documentation",
  description: "Learn how to use Luro AI tools, APIs, and workflows to get more done with AI.",
  path: "/docs",
  noIndex: false,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
