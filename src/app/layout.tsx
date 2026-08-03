import "./style/global.css";

import type { ReactNode } from "react";

import Providers from "@/components/global/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/functions/cs";
import { generateMetadata } from "@/functions/metadata";

import { inter, satoshi } from "./constant/font";

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-[#09090b] font-default text-white antialiased selection:bg-violet-500/30",
          inter.variable,
          satoshi.variable,
        )}
      >
        <Providers>{children}</Providers>
        <Toaster richColors theme="dark" position="top-right" />
      </body>
    </html>
  );
}
