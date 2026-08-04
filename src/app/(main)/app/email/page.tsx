"use client";

import { useState } from "react";
import { Copy, Download, LoaderCircle, Mail, Sparkles } from "lucide-react";
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

type EmailResult = {
  id: string;
  purpose: string;
  tone: string;
  recipient?: string;
  subject: string;
  body: string;
};
export default function EmailPage() {
  const [result, setResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      setResult(
        await apiRequest<EmailResult>("/api/ai/email", {
          method: "POST",
          data,
        }),
      );
    } catch (error) {
      toast.error(getApiError(error, "Unable to draft email."));
    } finally {
      setLoading(false);
    }
  };
  const form = (
    <form onSubmit={generate} className="space-y-5">
      <Field label="Purpose">
        <input
          name="purpose"
          required
          maxLength={100}
          className={formControlClass}
          placeholder="Follow up after a product demo"
        />
      </Field>
      <Field label="Recipient" hint="optional">
        <input
          name="recipient"
          type="email"
          className={formControlClass}
          placeholder="alex@example.com"
        />
      </Field>
      <Field label="Context">
        <textarea
          name="context"
          required
          maxLength={20000}
          rows={7}
          className={`${formControlClass} resize-none`}
          placeholder="Key details, desired outcome and anything the email should mention…"
        />
      </Field>
      <Field label="Tone">
        <select name="tone" className={formControlClass}>
          <option>Professional</option>
          <option>Warm</option>
          <option>Concise</option>
          <option>Persuasive</option>
          <option>Casual</option>
        </select>
      </Field>
      <Button
        className="w-full bg-violet-500 text-white hover:bg-violet-400"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
        {loading ? "Drafting…" : "Draft email"}
      </Button>
    </form>
  );
  const content = result ? `Subject: ${result.subject}\n\n${result.body}` : "";
  const output = result ? (
    <Card className="border-white/10 bg-white/[0.025]">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <CardTitle className="mt-1 text-lg">{result.subject}</CardTitle>
            {result.recipient && (
              <p className="mt-2 text-xs text-muted-foreground">
                To: {result.recipient}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy email"
              onClick={() =>
                void copyText(content).then(() => toast.success("Copied"))
              }
            >
              <Copy />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Download email"
              onClick={() => downloadText("email-draft.txt", content)}
            >
              <Download />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {result.body}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  ) : (
    <EmptyState
      icon={Mail}
      title="Start with a clear purpose"
      description="Add the context Luro needs and receive a polished email ready to personalize and send."
    />
  );
  return (
    <ToolLayout
      title="Email Writer"
      description="Draft thoughtful, effective emails in seconds."
      form={form}
      result={output}
    />
  );
}
