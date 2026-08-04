import { NextResponse } from "next/server";

export type ApiErrorDetails = {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export const successResponse = <T>(
  data: T,
  message = "Operation completed successfully.",
  status = 200,
) => NextResponse.json({ success: true, message, data }, { status });

export const errorResponse = (
  code: string,
  message: string,
  status: number,
  details: ApiErrorDetails = {},
  headers?: HeadersInit,
) =>
  NextResponse.json(
    { success: false, code, message, ...details },
    { status, headers },
  );

export const validationErrorResponse = (
  fieldErrors: Record<string, string[]>,
  formErrors: string[] = [],
) =>
  errorResponse(
    "VALIDATION_ERROR",
    "Please correct the highlighted fields.",
    400,
    { fieldErrors, formErrors },
  );

export const internalErrorResponse = () =>
  errorResponse(
    "INTERNAL_SERVER_ERROR",
    "Something went wrong. Please try again later.",
    500,
  );
