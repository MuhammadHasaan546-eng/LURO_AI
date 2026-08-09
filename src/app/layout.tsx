import "./globals.css";
import "./style/global.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import SmoothScroll from "@/components/SmoothScroll";
import Providers from "@/components/global/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/functions/cs";

import { inter, satoshi } from "./constant/font";

const appUrl = process.env.APP_URL || "http://localhost:3000";
const metadataBase = new URL(appUrl);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Luro AI - AI Platform",
    template: "%s | Luro AI - AI Platform",
  },
  description:
    "Luro AI is an all-in-one AI platform for creating content, analyzing ideas, generating images, translating text, and working with documents.",
  keywords: [
    "Luro AI",
    "AI platform",
    "AI productivity tools",
    "AI content creation",
    "AI image generation",
    "AI document assistant",
  ],
  authors: [{ name: "Luro AI" }],
  creator: "Luro AI",
  publisher: "Luro AI",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Luro AI",
    title: "Luro AI - AI Platform",
    description:
      "Create, analyze, and automate with powerful AI tools in one workspace.",
    url: metadataBase,
    images: [
      {
        url: "/images/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Luro AI AI platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luro AI - AI Platform",
    description:
      "Create, analyze, and automate with powerful AI tools in one workspace.",
    images: ["/images/thumbnail.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/icon.png",
  },
  formatDetection: { address: false, telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-[#09090b] font-default text-white antialiased selection:bg-violet-500/30",
          inter.variable,
          satoshi.variable,
        )}
      >
        <SmoothScroll>
          <Providers>{children}</Providers>
          <Toaster richColors theme="dark" position="top-right" />
        </SmoothScroll>
      </body>
    </html>
  );
}
