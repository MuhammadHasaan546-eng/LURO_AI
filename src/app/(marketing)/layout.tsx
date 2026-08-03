import type { ReactNode } from "react";

import Footer from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { getCurrentSession } from "@/lib/auth";

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
