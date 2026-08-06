"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  FileText,
  ImageIcon,
  Languages,
  Mail,
  Search,
  Share2,
} from "lucide-react";
import {
  DashboardPage,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/dashboard/DashboardPrimitives";
import { Card, CardContent } from "@/components/ui/card";
import { useApiData, copyText, downloadText } from "@/lib/dashboard-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type HistoryItem = {
  id: string;
  createdAt: string;
  content?: string;
  body?: string;
  translatedText?: string;
  subject?: string;
  topic?: string;
  prompt?: string;
  sourceText?: string;
  platform?: string;
  name?: string;
  status?: string;
  pageCount?: number;
};

type Tab = {
  key: string;
  label: string;
  endpoint: string;
  icon: typeof FileText;
};

const tabs: Tab[] = [
  {
    key: "social",
    label: "Social",
    endpoint: "/api/ai/social?limit=50",
    icon: Share2,
  },
  {
    key: "email",
    label: "Email",
    endpoint: "/api/ai/email?limit=50",
    icon: Mail,
  },
  {
    key: "translation",
    label: "Translation",
    endpoint: "/api/ai/translation?limit=50",
    icon: Languages,
  },
  {
    key: "image",
    label: "Images",
    endpoint: "/api/ai/image?limit=50",
    icon: ImageIcon,
  },
  {
    key: "pdf",
    label: "PDFs",
    endpoint: "/api/ai/documents?limit=50",
    icon: FileText,
  },
];

export default function HistoryPage() {
  const [tab, setTab] = useState(tabs[0]);
  const [query, setQuery] = useState("");
  const data = useApiData<HistoryItem[]>(tab.endpoint, []);

  // Ensure data.data is always treated as an array to prevent crashes
  const items = useMemo(() => {
    const list = Array.isArray(data.data) ? data.data : [];
    return list.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
    );
  }, [data.data, query]);

  const getText = (item: HistoryItem) =>
    item.content ??
    item.body ??
    item.translatedText ??
    item.prompt ??
    item.name ??
    "";

  return (
    <DashboardPage>
      <PageHeader
        title="History"
        description="Find and reuse everything you have created in Luro."
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.025] p-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                tab.key === item.key
                  ? "bg-violet-500/20 text-violet-200"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-white/[0.025] pl-9 pr-3 text-sm outline-none focus:border-violet-400/50"
            placeholder="Search history…"
          />
        </div>
      </div>

      {data.loading ? (
        <LoadingState label="Loading history" />
      ) : data.error ? (
        <ErrorState message={data.error} retry={data.retry} />
      ) : !items.length ? (
        <EmptyState
          icon={tab.icon}
          title="Nothing here yet"
          description={`Your ${tab.label.toLowerCase()} creations will appear here.`}
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="border-white/10 bg-white/[0.025]">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <tab.icon className="size-4 shrink-0 text-violet-300" />
                    <h2 className="truncate text-sm font-medium">
                      {item.subject ??
                        item.topic ??
                        item.name ??
                        item.prompt ??
                        "Creation"}
                    </h2>
                  </div>
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {getText(item)}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {getText(item) && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Copy"
                      onClick={() =>
                        void copyText(getText(item)).then(() =>
                          toast.success("Copied"),
                        )
                      }
                    >
                      <Copy />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Download"
                      onClick={() =>
                        downloadText("luro-creation.txt", getText(item))
                      }
                    >
                      <Download />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}