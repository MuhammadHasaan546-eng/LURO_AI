import "@/styles/globals.css";
import { cn } from "./functions/cs";
import { generateMetadata } from "./functions/metadata";
import { inter, satoshi } from "./app/constants/font";
import { Toaster } from "sonner";
import Providers from "./components/global/providers";
// import { inter, satoshi } from "@/constants";
// import { Toaster } from "@/components/ui/sonner";
// import { Providers } from "@/components";

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased font-default",
          inter.variable,
          satoshi.variable,
        )}
      >
        <Toaster richColors theme="dark" position="top-right" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
