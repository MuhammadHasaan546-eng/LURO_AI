import "server-only";

import type Joi from "joi";
import {
  errorResponse,
  internalErrorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import {
  getCurrentSession,
  requireCsrf,
  type CurrentSession,
} from "@/lib/auth";
import { ProviderConfigurationError } from "@/lib/ai/providers";
import { validationResponse } from "@/lib/validation";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const requireAiSession = async (
  request?: Request,
): Promise<CurrentSession> => {
  const session = request
    ? await requireCsrf(request)
    : await getCurrentSession();
  if (!session)
    throw new HttpError(
      request ? 403 : 401,
      request ? "CSRF_INVALID" : "UNAUTHORIZED",
      request ? "Invalid request." : "Authentication required.",
    );
  return session;
};

export const parseBody = async <T>(
  request: Request,
  schema: Joi.Schema,
): Promise<T> => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 100_000)
    throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 100_000)
      throw new HttpError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    body = JSON.parse(text);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      400,
      "MALFORMED_JSON",
      "Request body must be valid JSON.",
    );
  }
  const result = schema.validate(body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });
  if (result.error) {
    const details = validationResponse(result.error);
    throw Object.assign(
      new HttpError(400, "VALIDATION_ERROR", details.message),
      { details },
    );
  }
  return result.value as T;
};

export const handleRouteError = (error: unknown) => {
  if (error instanceof HttpError) {
    const details = (
      error as HttpError & {
        details?: {
          fieldErrors: Record<string, string[]>;
          formErrors: string[];
        };
      }
    ).details;
    return details
      ? validationErrorResponse(details.fieldErrors, details.formErrors)
      : errorResponse(error.code, error.message, error.status);
  }
  if (error instanceof ProviderConfigurationError)
    return errorResponse(
      "PROVIDER_NOT_CONFIGURED",
      `${error.provider} is not configured for this deployment.`,
      503,
    );
  console.error(
    "AI route failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return internalErrorResponse();
};

export const parseHistoryQuery = (request: Request) => {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? 20), 1),
    100,
  );
  const beforeValue = url.searchParams.get("before");
  const before = beforeValue ? new Date(beforeValue) : undefined;
  if (before && Number.isNaN(before.getTime()))
    throw new HttpError(400, "VALIDATION_ERROR", "Invalid history cursor.");
  return { limit, before };
};
