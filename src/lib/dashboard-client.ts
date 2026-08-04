"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, getApiError } from "@/store/api";

export type ApiCollection<T> = T[];

export const readCsrfToken = () =>
  typeof document === "undefined"
    ? ""
    : decodeURIComponent(
        document.cookie
          .split("; ")
          .find((cookie) => cookie.startsWith("luro_csrf="))
          ?.split("=")[1] ?? "",
      );

export async function streamChat(
  payload: { chatId?: string; message: string },
  options: {
    signal?: AbortSignal;
    onMetadata: (metadata: { chatId: string; messageId: string }) => void;
    onDelta: (content: string) => void;
  },
) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    credentials: "include",
    signal: options.signal,
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      "x-csrf-token": readCsrfToken(),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? "The assistant could not respond.");
  }
  if (!response.body) throw new Error("Streaming is not supported.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let event = "";
  let data = "";
  const dispatch = () => {
    if (!event || !data) return;
    const parsed = JSON.parse(data) as Record<string, string>;
    if (event === "metadata")
      options.onMetadata(parsed as { chatId: string; messageId: string });
    if (event === "delta") options.onDelta(parsed.content ?? "");
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data = line.slice(5).trim();
      else if (!line.trim()) {
        dispatch();
        event = "";
        data = "";
      }
    }
    if (done) break;
  }
}

export function useApiData<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiRequest<T>(url));
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load this data."));
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);
  return { data, setData, loading, error, retry: load };
}

export const downloadText = (name: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const copyText = async (content: string) =>
  navigator.clipboard.writeText(content);
