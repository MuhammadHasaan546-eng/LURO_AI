import "../style/global.css";

import { cn } from "@/functions/cs";
import { generateMetadata } from "@/functions/metadata";
import { Toaster } from "sonner";
import Providers from "@/components/global/providers";
import { inter, satoshi } from "../constant/font";
import { Navbar } from "@/components/marketing/Navbar";

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-[#09090b] text-white antialiased font-default selection:bg-violet-500/30",
          inter.variable,
          satoshi.variable,
        )}
      >
        <Toaster richColors theme="dark" position="top-right" />
        <Navbar />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
