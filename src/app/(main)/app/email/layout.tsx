import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Email Assistant",
  description: "Draft, improve, and personalize emails with Luro AI.",
  path: "/app/email",
  noIndex: true,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
