"use client";

import { useState } from "react";
import {
  FileText,
  LoaderCircle,
  MessageSquare,
  Send,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import {
  DashboardPage,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  formControlClass,
} from "@/components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, getApiError } from "@/store/api";
import { useApiData } from "@/lib/dashboard-client";

type DocumentItem = {
  id: string;
  name: string;
  status: "processing" | "ready" | "failed";
  pageCount: number;
  byteSize: number;
  createdAt: string;
};
type Answer = {
  id: string;
  question: string;
  answer: string;
  citations: { page: number; excerpt: string; score: number }[];
};
export default function PdfPage() {
  const documents = useApiData<DocumentItem[]>(
    "/api/ai/documents?limit=30",
    [],
  );
  const [selected, setSelected] = useState<DocumentItem | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 12_000_000) {
      toast.error("Choose a PDF smaller than 12 MB.");
      return;
    }
    const data = new FormData();
    data.set("file", file);
    setUploading(true);
    try {
      const document = await apiRequest<DocumentItem>("/api/ai/documents", {
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelected(document);
      setAnswers([]);
      void documents.retry();
      toast.success("PDF processed");
    } catch (error) {
      toast.error(getApiError(error, "Unable to process PDF."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const choose = async (document: DocumentItem) => {
    setSelected(document);
    const items = await apiRequest<Answer[]>(
      `/api/ai/documents/${document.id}/chat?limit=50`,
    ).catch(() => []);
    setAnswers(items.reverse());
  };
  const ask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const question = String(new FormData(form).get("question") ?? "").trim();
    if (!question) return;
    setAsking(true);
    try {
      const answer = await apiRequest<Answer>(
        `/api/ai/documents/${selected.id}/chat`,
        { method: "POST", data: { question } },
      );
      setAnswers((current) => [...current, answer]);
      form.reset();
    } catch (error) {
      toast.error(getApiError(error, "Unable to answer question."));
    } finally {
      setAsking(false);
    }
  };
  return (
    <DashboardPage>
      <PageHeader
        title="Chat with PDF"
        description="Upload a document and ask questions grounded in its contents."
        action={
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-violet-500 px-4 text-sm font-medium text-white hover:bg-violet-400">
            <input
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(event) => void upload(event)}
              disabled={uploading}
            />
            {uploading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploading ? "Processing…" : "Upload PDF"}
          </label>
        }
      />
      <div className="grid min-h-[600px] gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit border-white/10 bg-white/[0.025]">
          <CardContent className="p-3">
            <h2 className="px-2 pb-3 text-sm font-medium">Your documents</h2>
            {documents.loading ? (
              <LoadingState />
            ) : documents.error ? (
              <ErrorState message={documents.error} retry={documents.retry} />
            ) : documents.data.length ? (
              <div className="space-y-1">
                {documents.data.map((document) => (
                  <button
                    key={document.id}
                    onClick={() => void choose(document)}
                    className={`w-full rounded-xl p-3 text-left ${selected?.id === document.id ? "bg-violet-500/15" : "hover:bg-white/5"}`}
                  >
                    <div className="flex gap-2">
                      <FileText className="mt-0.5 size-4 shrink-0 text-violet-300" />
                      <div className="min-w-0">
                        <p className="truncate text-sm">{document.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {document.pageCount} pages · {document.status}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No documents uploaded.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="flex min-w-0 flex-col border-white/10 bg-white/[0.025]">
          <CardContent className="flex flex-1 flex-col p-0">
            {!selected ? (
              <EmptyState
                icon={FileText}
                title="Select or upload a PDF"
                description="Your document conversation will appear here with page citations."
              />
            ) : (
              <>
                <div className="border-b border-white/10 p-4">
                  <h2 className="truncate font-medium">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.pageCount} pages · Ready to answer questions
                  </p>
                </div>
                <div className="flex-1 space-y-6 p-5">
                  {answers.length === 0 ? (
                    <EmptyState
                      icon={MessageSquare}
                      title="Ask about this document"
                      description="Try asking for a summary, key findings or a specific detail."
                    />
                  ) : (
                    answers.map((answer) => (
                      <article key={answer.id} className="space-y-3">
                        <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-violet-500 px-4 py-3 text-sm text-white">
                          {answer.question}
                        </div>
                        <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 p-4">
                          <div className="prose prose-invert max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {answer.answer}
                            </ReactMarkdown>
                          </div>
                          {answer.citations?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {answer.citations.map((citation, index) => (
                                <span
                                  key={`${citation.page}-${index}`}
                                  title={citation.excerpt}
                                  className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-xs text-violet-200"
                                >
                                  Page {citation.page}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
                <form
                  onSubmit={ask}
                  className="flex gap-2 border-t border-white/10 p-4"
                >
                  <input
                    name="question"
                    required
                    className={formControlClass}
                    placeholder="Ask a question about this PDF…"
                  />
                  <Button
                    size="icon"
                    disabled={asking}
                    aria-label="Ask question"
                  >
                    {asking ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Send />
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
