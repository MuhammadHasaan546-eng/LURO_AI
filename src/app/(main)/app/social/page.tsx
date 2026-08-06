"use client";

import { useState } from "react";
import { Copy, Download, LoaderCircle, Share2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  EmptyState,
  Field,
  ToolLayout,
  formControlClass,
} from "@/components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { copyText, downloadText } from "@/lib/dashboard-client";

type SocialResult = {
  id: string;
  topic: string;
  platform: string;
  format: string;
  tone: string;
  content: string;
};

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X / Twitter" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "general", label: "General" },
];

const FORMATS = ["Post", "Thread", "Caption", "Announcement"];


export default function SocialPage() {
  const [result, setResult] = useState<SocialResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("linkedin");
  const [selectedFormat, setSelectedFormat] = useState("Post");
  const [selectedTone, setSelectedTone] = useState("Professional");

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    form.set("platform", selectedPlatform);
    form.set("format", selectedFormat);
    form.set("tone", selectedTone);

    try {
      setResult(
        await apiRequest<SocialResult>("/api/ai/social", {
          method: "POST",
          data: Object.fromEntries(form),
        }),
      );
      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error(getApiError(error, "Unable to generate content."));
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={generate} className="space-y-6">
      <Field label="What are you posting about?">
        <textarea
          name="topic"
          required
          rows={5}
          maxLength={10000}
          className={`${formControlClass} resize-none bg-white/[0.03] border-white/10 focus:border-violet-500/50`}
          placeholder="Launch of our new productivity app for remote teams…"
        />
      </Field>

      {/* Platform Selector Buttons */}
      <Field label="Platform">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATFORMS.map((item) => {
            const isSelected = selectedPlatform === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedPlatform(item.id)}
                className={`rounded-lg px-3 py-2.5 text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-violet-500/20 border-violet-500 text-violet-200 shadow-sm"
                    : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* Format & Tone Section with Equal Layout Grid */}
     <div className="space-y-4 pt-1">
  {/* Format Selector */}
  <Field label="Format">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {FORMATS.map((fmt) => {
        const isSelected = selectedFormat === fmt;
        return (
          <button
            type="button"
            key={fmt}
            onClick={() => setSelectedFormat(fmt)}
            className={`rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all border text-center truncate ${
              isSelected
                ? "bg-violet-500/20 border-violet-500 text-violet-200 shadow-sm ring-1 ring-violet-500/30"
                : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {fmt}
          </button>
        );
      })}
    </div>
  </Field>
</div>

      <Button
        className="w-full bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 py-5 transition-all mt-2"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin size-4" /> : <Sparkles className="size-4" />}
        {loading ? "Writing content…" : "Generate content"}
      </Button>
    </form>
  );

  const output = result ? (
    <Card className="border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur">
      <CardHeader className="flex-row items-center justify-between border-b border-white/10 pb-4">
        <div>
          <CardTitle className="text-sm font-semibold capitalize text-foreground/90">
            {result.platform} · {result.format}
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wider">
            {result.tone} tone
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Copy"
            className="hover:bg-white/5"
            onClick={() =>
              void copyText(result.content).then(() => toast.success("Copied to clipboard"))
            }
          >
            <Copy className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Download"
            className="hover:bg-white/5"
            onClick={() => downloadText("social-post.txt", result.content)}
          >
            <Download className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-foreground/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  ) : (
    <EmptyState
      icon={Share2}
      title="Create content built for the platform"
      description="Give Luro a topic and it will shape the message, structure and tone for your audience."
    />
  );

  return (
    <ToolLayout
      title="Social Content"
      description="Create high-quality posts adapted to each social platform."
      form={form}
      result={output}
    />
  );
}