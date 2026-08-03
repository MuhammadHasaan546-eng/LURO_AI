export type ApiError = {
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
  code?: string;
  redirectTo?: string;
};

const getCsrfToken = () =>
  typeof document === "undefined"
    ? ""
    : (document.cookie
        .split("; ")
        .find((value) => value.startsWith("luro_csrf="))
        ?.split("=")[1] ?? "");

export async function apiRequest<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.method && init.method !== "GET"
        ? { "x-csrf-token": getCsrfToken() }
        : {}),
      ...init.headers,
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) {
    throw data;
  }
  return data;
}

export const getApiError = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
};
