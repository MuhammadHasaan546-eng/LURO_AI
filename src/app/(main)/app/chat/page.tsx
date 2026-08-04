"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Copy,
  LoaderCircle,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Square,
  User,
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
import { apiRequest, getApiError } from "@/store/api";
import { copyText, streamChat, useApiData } from "@/lib/dashboard-client";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  status?: string;
  createdAt?: string;
};
type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
};
export default function ChatPage() {
  const history = useApiData<Chat[]>("/api/ai/chat?limit=30", []);
  const [chatId, setChatId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(
    () => bottom.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );
  const selectChat = (chat: Chat) => {
    setChatId(chat.id);
    setMessages(chat.messages);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || streaming) return;
    setInput("");
    setStreaming(true);
    const tempId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: message },
      { id: tempId, role: "assistant", content: "" },
    ]);
    abort.current = new AbortController();
    try {
      await streamChat(
        { chatId, message },
        {
          signal: abort.current.signal,
          onMetadata: (metadata) => setChatId(metadata.chatId),
          onDelta: (content) =>
            setMessages((current) =>
              current.map((item) =>
                item.id === tempId
                  ? { ...item, content: item.content + content }
                  : item,
              ),
            ),
        },
      );
      void history.retry();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error(getApiError(error, "Unable to send message."));
        setMessages((current) => current.filter((item) => item.id !== tempId));
      }
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  };
  const regenerate = async (message: Message) => {
    if (!chatId || streaming) return;
    setStreaming(true);
    try {
      const result = await apiRequest<{ content?: string; message?: Message }>(
        "/api/ai/chat/regenerate",
        { method: "POST", data: { chatId, messageId: message.id } },
      );
      const replacement =
        result.message ??
        (result.content ? { ...message, content: result.content } : null);
      if (replacement)
        setMessages((current) =>
          current.map((item) => (item.id === message.id ? replacement : item)),
        );
    } catch (error) {
      toast.error(getApiError(error, "Unable to regenerate response."));
    } finally {
      setStreaming(false);
    }
  };
  return (
    <DashboardPage className="h-[calc(100vh-4rem)] max-w-none overflow-hidden p-0 sm:p-0 lg:p-0">
      <div className="grid h-full md:grid-cols-[260px_1fr]">
        <aside className="hidden overflow-y-auto border-r border-white/10 bg-black/10 p-3 md:block">
          <Button
            className="mb-3 w-full justify-start"
            variant="outline"
            onClick={() => {
              setChatId(undefined);
              setMessages([]);
            }}
          >
            <MessageSquarePlus />
            New conversation
          </Button>
          {history.loading ? (
            <LoadingState label="Loading chats" />
          ) : history.error ? (
            <ErrorState message={history.error} retry={history.retry} />
          ) : (
            <div className="space-y-1">
              {history.data.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full truncate rounded-lg px-3 py-2.5 text-left text-sm ${chat.id === chatId ? "bg-violet-500/15 text-violet-200" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                >
                  {chat.title}
                </button>
              ))}
            </div>
          )}
        </aside>
        <section className="flex min-w-0 flex-col">
          <div className="border-b border-white/10 px-4 py-4 sm:px-6">
            <PageHeader
              title="AI Chat"
              description="Ask questions, explore ideas and create with Luro."
              action={
                <Button
                  className="md:hidden"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setChatId(undefined);
                    setMessages([]);
                  }}
                >
                  <MessageSquarePlus />
                  New
                </Button>
              }
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <EmptyState
                icon={Bot}
                title="How can I help today?"
                description="Ask for a plan, draft, analysis, code explanation or anything you want to explore."
              />
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message) => (
                  <article key={message.id} className="flex gap-3">
                    <div
                      className={`mt-1 rounded-lg p-2 ${message.role === "user" ? "bg-white/10" : "bg-violet-500/15 text-violet-300"}`}
                    >
                      {message.role === "user" ? (
                        <User className="size-4" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-xs font-medium text-muted-foreground">
                        {message.role === "user" ? "You" : "Luro"}
                      </div>
                      {!message.content && streaming ? (
                        <LoaderCircle className="size-4 animate-spin text-violet-300" />
                      ) : (
                        <div className="prose prose-invert max-w-none text-sm leading-7">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      {message.role === "assistant" && message.content && (
                        <div className="mt-2 flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Copy response"
                            onClick={() =>
                              void copyText(message.content).then(() =>
                                toast.success("Copied"),
                              )
                            }
                          >
                            <Copy />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Regenerate response"
                            disabled={streaming}
                            onClick={() => void regenerate(message)}
                          >
                            <RefreshCw />
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                <div ref={bottom} />
              </div>
            )}
          </div>
          <form
            onSubmit={submit}
            className="border-t border-white/10 bg-background/80 p-3 backdrop-blur sm:p-4"
          >
            <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.035] p-2 focus-within:border-violet-400/50">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={2}
                placeholder="Message Luro…"
                aria-label="Message"
                className={`${formControlClass} resize-none border-0 bg-transparent focus:ring-0`}
              />
              {streaming ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => abort.current?.abort()}
                  aria-label="Stop response"
                >
                  <Square />
                </Button>
              ) : (
                <Button
                  size="icon"
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <Send />
                </Button>
              )}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Luro can make mistakes. Verify important information.
            </p>
          </form>
        </section>
      </div>
    </DashboardPage>
  );
}
