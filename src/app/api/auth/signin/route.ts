import { SignInSchema } from "@/signin-schema";
import {
  errorResponse,
  internalErrorResponse,
  successResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { sendWelcomeBackEmail } from "@/lib/auth-notifications";
import {
  audit,
  createSession,
  getCurrentSession,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_JSON_BODY_BYTES = 100_000;

const invalidCredentials = () =>
  errorResponse("INVALID_CREDENTIALS", "Invalid email or password.", 401);

async function signIn(request: Request) {
  const current = await getCurrentSession();
  if (current) {
    return errorResponse(
      "ALREADY_AUTHENTICATED",
      "You are already logged in.",
      409,
      {
        formErrors: [],
      },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BODY_BYTES)
    return errorResponse("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
  const rawBody = await request.text().catch(() => "");
  if (new TextEncoder().encode(rawBody).byteLength > MAX_JSON_BODY_BYTES)
    return errorResponse("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
  const body = (() => {
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  })();
  const validation = SignInSchema.validate(body, {
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

  const { email, password } = validation.value as {
    email: string;
    password: string;
  };
  const limit = await checkRateLimit(request, "signin", email);
  if (!limit.allowed)
    return errorResponse(
      "RATE_LIMITED",
      "Too many attempts. Please try again later.",
      429,
      {},
      { "Retry-After": String(limit.retryAfter) },
    );
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      passwordHash: true,
    },
  });
  if (!user) {
    await audit("signin", "FAILURE", undefined, request).catch(() => undefined);
    return invalidCredentials();
  }
  if (!user.passwordHash) {
    await audit("signin", "FAILURE", user.id, request).catch(() => undefined);
    return invalidCredentials();
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    await audit("signin", "FAILURE", user.id, request).catch(() => undefined);
    return invalidCredentials();
  }
  await db.user.update({
    where: { id: user.id },
    data: { lastAuthenticatedAt: new Date() },
  });
  await createSession(user.id, request);
  await audit("signin", "SUCCESS", user.id, request).catch(() => undefined);
  const loginNotificationClaimedAt = new Date();
  const loginNotificationClaimed = await db.user.claimNotification({
    id: user.id,
    field: "loginNotificationSentAt",
    before: new Date(Date.now() - 15 * 60 * 1000),
    now: loginNotificationClaimedAt,
  });
  if (loginNotificationClaimed) {
    const notification = await sendWelcomeBackEmail({
      email: user.email,
      firstName: user.firstName,
      loginAt: loginNotificationClaimedAt,
    });
    if (notification.status !== "sent")
      await db.user.releaseNotification({
        id: user.id,
        field: "loginNotificationSentAt",
        claimedAt: loginNotificationClaimedAt,
      });
  }
  return successResponse(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
    "Successfully signed in.",
  );
}

export async function POST(request: Request) {
  try {
    return await signIn(request);
  } catch {
    return internalErrorResponse();
  }
}
