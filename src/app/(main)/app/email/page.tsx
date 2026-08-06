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

const TONES = ["Professional", "Warm", "Concise", "Persuasive", "Casual"];

export default function EmailPage() {
  const [result, setResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState("Professional");

  const generate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set("tone", selectedTone);
    
    const data = Object.fromEntries(formData);
    try {
      setResult(
        await apiRequest<EmailResult>("/api/ai/email", {
          method: "POST",
          data,
        }),
      );
      toast.success("Email drafted successfully!");
    } catch (error) {
      toast.error(getApiError(error, "Unable to draft email."));
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={generate} className="space-y-6">
      <Field label="Purpose">
        <input
          name="purpose"
          required
          maxLength={100}
          className={`${formControlClass} bg-white/[0.03] border-white/10 focus:border-violet-500/50`}
          placeholder="Follow up after a product demo"
        />
      </Field>

      <Field label="Recipient" hint="optional">
        <input
          name="recipient"
          type="email"
          className={`${formControlClass} bg-white/[0.03] border-white/10 focus:border-violet-500/50`}
          placeholder="alex@example.com"
        />
      </Field>

      <Field label="Context">
        <textarea
          name="context"
          required
          maxLength={20000}
          rows={5}
          className={`${formControlClass} resize-none bg-white/[0.03] border-white/10 focus:border-violet-500/50`}
          placeholder="Key details, desired outcome and anything the email should mention…"
        />
      </Field>

      {/* Tone Selector Buttons */}
      <Field label="Tone">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TONES.map((tone) => {
            const isSelected = selectedTone === tone;
            return (
              <button
                type="button"
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all border text-center truncate ${
                  isSelected
                    ? "bg-violet-500/20 border-violet-500 text-violet-200 shadow-sm ring-1 ring-violet-500/30"
                    : "bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </Field>

      <Button
        className="w-full bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20 py-5 transition-all mt-2"
        disabled={loading}
      >
        {loading ? <LoaderCircle className="animate-spin size-4" /> : <Sparkles className="size-4" />}
        {loading ? "Drafting email…" : "Draft email"}
      </Button>
    </form>
  );

  const content = result ? `Subject: ${result.subject}\n\n${result.body}` : "";
  
  const output = result ? (
    <Card className="border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur">
      <CardHeader className="border-b border-white/10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Subject</p>
            <CardTitle className="text-base font-semibold text-foreground/90">{result.subject}</CardTitle>
            {result.recipient && (
              <p className="text-xs text-muted-foreground pt-1">
                To: <span className="text-foreground/80">{result.recipient}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy email"
              className="hover:bg-white/5"
              onClick={() =>
                void copyText(content).then(() => toast.success("Copied to clipboard"))
              }
            >
              <Copy className="size-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Download email"
              className="hover:bg-white/5"
              onClick={() => downloadText("email-draft.txt", content)}
            >
              <Download className="size-4 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-foreground/90">
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