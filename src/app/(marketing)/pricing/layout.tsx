import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Plans & Pricing",
  description: "Compare Luro AI plans and choose the right AI productivity tools for your workflow.",
  path: "/pricing",
  noIndex: false,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
