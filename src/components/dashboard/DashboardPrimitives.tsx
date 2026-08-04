"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  LoaderCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function DashboardPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolLayout({
  title,
  description,
  form,
  result,
  aside,
}: {
  title: string;
  description: string;
  form: React.ReactNode;
  result: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <DashboardPage>
      <PageHeader title={title} description={description} />
      <div
        className={cn(
          "grid gap-6",
          aside ? "xl:grid-cols-[380px_1fr_280px]" : "lg:grid-cols-[380px_1fr]",
        )}
      >
        <Card className="h-fit border-white/10 bg-card/60 shadow-xl shadow-black/10 lg:sticky lg:top-24">
          <CardContent className="p-5">{form}</CardContent>
        </Card>
        <div className="min-w-0">{result}</div>
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
    </DashboardPage>
  );
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <div className="mb-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-300">
        <Icon className="size-6" />
      </div>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <LoaderCircle className="size-4 animate-spin" />
      {label}…
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/5 p-8 text-center"
    >
      <AlertCircle className="mb-3 size-6 text-red-300" />
      <p className="text-sm text-red-100">{message}</p>
      {retry && (
        <Button className="mt-4" variant="outline" size="sm" onClick={retry}>
          <RotateCcw />
          Try again
        </Button>
      )}
    </div>
  );
}

export function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <Card className="h-full border-white/10 bg-white/[0.025] transition duration-200 group-hover:-translate-y-1 group-hover:border-violet-400/30 group-hover:bg-white/[0.045]">
        <CardHeader>
          <div className={cn("mb-4 w-fit rounded-xl p-2.5", accent)}>
            <Icon className="size-5" />
          </div>
          <CardTitle className="flex items-center justify-between text-base">
            {title}
            <ArrowRight className="size-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>
        {label}
        {hint && (
          <span className="ml-2 font-normal text-muted-foreground">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

export const formControlClass =
  "min-h-11 w-full rounded-xl border border-input bg-black/20 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50";
