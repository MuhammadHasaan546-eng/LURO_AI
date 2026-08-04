"use client";

import {
  Bot,
  ImageIcon,
  Languages,
  Mail,
  Share2,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  DashboardPage,
  ErrorState,
  LoadingState,
  PageHeader,
  ToolCard,
} from "@/components/dashboard/DashboardPrimitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiData } from "@/lib/dashboard-client";

type Usage = {
  period: string;
  plan: string;
  used: { tokens: number; images: number; pages: number };
  limits: { tokens: number; images: number; pages: number };
};
const tools = [
  {
    href: "/app/chat",
    icon: Bot,
    title: "AI Chat",
    description:
      "Think, write and solve complex tasks with a streaming assistant.",
    accent: "bg-violet-500/15 text-violet-300",
  },
  {
    href: "/app/image",
    icon: ImageIcon,
    title: "Image Studio",
    description: "Turn detailed ideas into production-ready visuals.",
    accent: "bg-pink-500/15 text-pink-300",
  },
  {
    href: "/app/social",
    icon: Share2,
    title: "Social Content",
    description: "Create platform-aware posts in your brand voice.",
    accent: "bg-blue-500/15 text-blue-300",
  },
  {
    href: "/app/email",
    icon: Mail,
    title: "Email Writer",
    description: "Draft clear, persuasive emails for any purpose.",
    accent: "bg-amber-500/15 text-amber-300",
  },
  {
    href: "/app/translator",
    icon: Languages,
    title: "Translator",
    description: "Translate naturally while preserving meaning and tone.",
    accent: "bg-emerald-500/15 text-emerald-300",
  },
  {
    href: "/app/pdf",
    icon: FileText,
    title: "Chat with PDF",
    description: "Ask questions and get answers grounded in your files.",
    accent: "bg-orange-500/15 text-orange-300",
  },
];
function UsageCard({
  label,
  value,
  limit,
  icon: Icon,
}: {
  label: string;
  value: number;
  limit: number;
  icon: typeof Sparkles;
}) {
  const unlimited = limit <= 0;
  const percent = unlimited
    ? 0
    : Math.min(100, Math.round((value / limit) * 100));
  return (
    <Card className="border-white/10 bg-white/[0.025]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <Icon className="size-4" />
        </div>
        <p className="mt-3 text-2xl font-semibold">{value.toLocaleString()}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {unlimited ? "No limit" : `${percent}% of ${limit.toLocaleString()}`}
        </p>
      </CardContent>
    </Card>
  );
}
export default function DashboardPageView() {
  const usage = useApiData<Usage>("/api/usage", {
    period: "",
    plan: "free",
    used: { tokens: 0, images: 0, pages: 0 },
    limits: { tokens: 0, images: 0, pages: 0 },
  });
  return (
    <DashboardPage>
      <PageHeader
        title="Create something remarkable"
        description="Your focused AI workspace for writing, visuals, translation and document intelligence."
      />
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-violet-300" />
          <h2 className="font-medium">AI tools</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-violet-300" />
            <h2 className="font-medium">Usage this month</h2>
          </div>
          {!usage.loading && !usage.error && (
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-muted-foreground">
              {usage.data.plan} plan
            </span>
          )}
        </div>
        {usage.loading ? (
          <LoadingState label="Loading usage" />
        ) : usage.error ? (
          <ErrorState message={usage.error} retry={usage.retry} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <UsageCard
              label="Tokens"
              value={usage.data.used.tokens}
              limit={usage.data.limits.tokens}
              icon={Sparkles}
            />
            <UsageCard
              label="Images"
              value={usage.data.used.images}
              limit={usage.data.limits.images}
              icon={ImageIcon}
            />
            <UsageCard
              label="PDF pages"
              value={usage.data.used.pages}
              limit={usage.data.limits.pages}
              icon={FileText}
            />
          </div>
        )}
      </section>
      <Card className="overflow-hidden border-violet-400/20 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">
            One workspace. Every creative workflow.
          </CardTitle>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Move from first idea to polished output without switching tools.
            Your recent work is automatically available in History.
          </p>
        </CardHeader>
      </Card>
    </DashboardPage>
  );
}
