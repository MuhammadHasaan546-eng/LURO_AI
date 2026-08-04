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
export default function SocialPage() {
  const [result, setResult] = useState<SocialResult | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      setResult(
        await apiRequest<SocialResult>("/api/ai/social", {
          method: "POST",
          data: Object.fromEntries(new FormData(event.currentTarget)),
        }),
      );
    } catch (error) {
      toast.error(getApiError(error, "Unable to generate content."));
    } finally {
      setLoading(false);
    }
  };
  const form = (
    <form onSubmit={generate} className="space-y-5">
      <Field label="What are you posting about?">
        <textarea
          name="topic"
          required
          rows={7}
          maxLength={10000}
          className={`${formControlClass} resize-none`}
          placeholder="Launch of our new productivity app for remote teams…"
        />
      </Field>
      <Field label="Platform">
        <select
          name="platform"
          className={formControlClass}
          defaultValue="linkedin"
        >
          <option value="x">X / Twitter</option>
          <option value="linkedin">LinkedIn</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="general">General</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Format">
          <select name="format" className={formControlClass}>
            <option>Post</option>
            <option>Thread</option>
            <option>Caption</option>
            <option>Announcement</option>
          </select>
        </Field>
        <Field label="Tone">
          <select name="tone" className={formControlClass}>
            <option>Professional</option>
            <option>Friendly</option>
            <option>Bold</option>
            <option>Educational</option>
            <option>Witty</option>
          </select>
        </Field>
      </div>
      <Button
        className="w-full bg-violet-500 text-white hover:bg-violet-400"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
        {loading ? "Writing…" : "Generate content"}
      </Button>
    </form>
  );
  const output = result ? (
    <Card className="border-white/10 bg-white/[0.025]">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base capitalize">
            {result.platform} {result.format}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.tone} tone
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Copy"
            onClick={() =>
              void copyText(result.content).then(() => toast.success("Copied"))
            }
          >
            <Copy />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Download"
            onClick={() => downloadText("social-post.txt", result.content)}
          >
            <Download />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7">
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
