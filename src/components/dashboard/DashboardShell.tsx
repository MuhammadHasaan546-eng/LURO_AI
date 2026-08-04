"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { COMMAND_LINKS } from "@/app/constant/links";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Icons from "@/components/global/icons";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function CommandPalette({ open, close }: { open: boolean; close: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const results = useMemo(
    () =>
      COMMAND_LINKS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#161619] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="size-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools and pages…"
            className="h-14 flex-1 bg-transparent px-3 text-sm outline-none"
          />
          <Button variant="ghost" size="icon" onClick={close}>
            <X />
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.map((item) => (
            <button
              key={`${item.href}-${item.label}`}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-white/5"
              onClick={() => {
                router.push(item.href);
                close();
              }}
            >
              <item.icon className="size-4 text-violet-300" />
              {item.label}
            </button>
          ))}
          {!results.length && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No matching pages.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openSearch = useCallback(() => setPaletteOpen(true), []);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return (
    <SidebarProvider defaultOpen>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-white/10 bg-background/80 px-4 backdrop-blur-xl">
        <Link
          href="/app"
          className="flex w-56 items-center gap-2 font-semibold"
        >
          <Icons.icon className="w-6" />
          <span>Luro</span>
          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300">
            AI
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="hidden text-muted-foreground sm:flex"
            onClick={openSearch}
          >
            <Search />
            Search{" "}
            <kbd className="ml-3 rounded border border-white/10 px-1.5 text-[10px]">
              ⌘K
            </kbd>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-violet-500 text-white hover:bg-violet-400"
          >
            <Link href="/app/billing">
              <Sparkles />
              Upgrade
            </Link>
          </Button>
          <SidebarTrigger className="md:hidden" />
        </div>
      </header>
      <DashboardSidebar onSearch={openSearch} />
      <SidebarInset className="min-w-0 bg-[radial-gradient(circle_at_65%_-20%,rgba(124,58,237,0.14),transparent_35%)] pt-16">
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
      <CommandPalette open={paletteOpen} close={() => setPaletteOpen(false)} />
    </SidebarProvider>
  );
}
