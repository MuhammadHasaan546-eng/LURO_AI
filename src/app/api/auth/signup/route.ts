import { SignUpSchema } from "@/signup-schema";
import {
  errorResponse,
  internalErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { audit, createSession, hashPassword, issueAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendWelcomeEmail } from "@/lib/auth-notifications";
import { checkSignupRateLimits } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const MAX_JSON_BODY_BYTES = 100_000;

const genericDuplicateResponse = () =>
  errorResponse(
    "ACCOUNT_EXISTS",
    "An account with this email already exists. Please sign in.",
    409,
  );

const parseBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BODY_BYTES)
    return errorResponse("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);

  const body = await parseBody(request);
  const rawEmail =
    body && typeof body === "object" && "email" in body
      ? (body as { email?: unknown }).email
      : undefined;
  const limit = await checkSignupRateLimits(request, rawEmail);
  if (!limit.allowed)
    return NextResponse.json(
      {
        success: false,
        error: "TOO_MANY_REQUESTS",
        message: "Too many signup attempts. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfter),
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  const validation = SignUpSchema.validate(body, {
    abortEarly: false,
    allowUnknown: false,
  });
  if (validation.error) {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];
    for (const detail of validation.error.details) {
      if (detail.path.length)
        (fieldErrors[detail.path.join(".")] ??= []).push(detail.message);
      else formErrors.push(detail.message);
    }
    return validationErrorResponse(fieldErrors, formErrors);
  }

  const { firstName, lastName, email, password } = validation.value as {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    await audit("signup", "FAILURE", existingUser.id, request);
    return genericDuplicateResponse();
  }

  try {
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: await hashPassword(password),
        passwordChangedAt: new Date(),
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!user) throw new Error("Failed to create user");
    const verificationToken = await issueAuthToken(
      user.id,
      "VERIFY_EMAIL",
      24 * 60 * 60 * 1000,
    );
    await audit("signup", "SUCCESS", user.id, request);
    await createSession(user.id, request);
    const welcomeClaimedAt = new Date();
    if (
      await db.user.claimNotification({
        id: user.id,
        field: "welcomeEmailSentAt",
        before: new Date(0),
        now: welcomeClaimedAt,
      })
    ) {
      const notification = await sendWelcomeEmail(user).catch(() => ({
        status: "failed" as const,
      }));
      if (notification.status !== "sent")
        await db.user.releaseNotification({
          id: user.id,
          field: "welcomeEmailSentAt",
          claimedAt: welcomeClaimedAt,
        });
    }
    if (env.EMAIL_WEBHOOK_URL) {
      await fetch(env.EMAIL_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(env.EMAIL_WEBHOOK_SECRET
            ? { authorization: `Bearer ${env.EMAIL_WEBHOOK_SECRET}` }
            : {}),
        },
        body: JSON.stringify({
          type: "verify-email",
          email: user.email,
          token: verificationToken,
          url: `${env.APP_URL}/auth/verify-email?token=${verificationToken}`,
        }),
      }).catch(() => undefined);
    }
    return successResponse(
      { user, emailVerificationRequired: true },
      "Account created successfully. Please verify your email.",
      201,
    );
  } catch (error) {
    if (error instanceof Error && /duplicate key|E11000/i.test(error.message))
      return genericDuplicateResponse();
    await audit("signup", "FAILURE", undefined, request).catch(() => undefined);
    return internalErrorResponse();
  }
}
