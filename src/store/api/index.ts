import axios, { isAxiosError, type AxiosRequestConfig } from "axios";

export type ApiError = {
  message: string;
  status?: number;
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

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (config.method && config.method.toUpperCase() !== "GET") {
    config.headers.set("x-csrf-token", getCsrfToken());
    if (config.data !== undefined && !config.headers.has("Content-Type")) {
      config.headers.set("Content-Type", "application/json");
    }
  }
  return config;
});

export const apiRequest = async <T>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<T> => {
  try {
    const response = await apiClient.request<T>({
      url,
      ...config,
      headers: { Accept: "application/json", ...config.headers },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const responseError = error.response?.data as
        | Partial<ApiError>
        | undefined;
      throw {
        message:
          responseError?.message ??
          "The request could not be completed. Please try again.",
        status: error.response?.status,
        fieldErrors: responseError?.fieldErrors,
        formErrors: responseError?.formErrors,
        code: responseError?.code,
        redirectTo: responseError?.redirectTo,
      } satisfies ApiError;
    }
    throw { message: "The request could not be completed." } satisfies ApiError;
  }
};

export const getApiError = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
};
