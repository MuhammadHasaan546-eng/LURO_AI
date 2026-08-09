import type { Metadata } from "next";
import type { ReactNode } from "react";

import Footer from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { getCurrentSession } from "@/lib/auth";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Luro AI",
  description:
    "The all-in-one AI platform for creating, analyzing, and automating your work.",
  path: "/",
});

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <>
      <Navbar isAuthenticated={Boolean(session)} />
      {children}
      <Footer />
    </>
  );
}
