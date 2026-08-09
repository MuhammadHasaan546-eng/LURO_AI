import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verify Email",
  description: "Verify your email address to finish setting up your Luro AI account.",
  path: "/auth/verify-email",
  noIndex: true,
});

export default function RouteMetadataLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
