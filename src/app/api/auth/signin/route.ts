import { NextResponse } from "next/server";
import { SignInSchema } from "@/signin-schema";
import { sendWelcomeBackEmail } from "@/lib/auth-notifications";
import {
  audit,
  createSession,
  getCurrentSession,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const invalid = () =>
  NextResponse.json(
    {
      code: "INVALID_CREDENTIALS",
      message: "Incorrect username or password",
    },
    { status: 401 },
  );

const userNotFound = () =>
  NextResponse.json(
    {
      code: "USER_NOT_FOUND",
      message: "User does not exist. Please sign up.",
    },
    { status: 404 },
  );

async function signIn(request: Request) {
  const current = await getCurrentSession();
  if (current) {
    return NextResponse.json(
      {
        code: "ALREADY_AUTHENTICATED",
        message: "You are already logged in.",
        redirectTo: "/app",
      },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
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
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        fieldErrors,
        formErrors,
      },
      { status: 400 },
    );
  }
  const { email, password } = validation.value as {
    email: string;
    password: string;
  };
  const limit = await checkRateLimit(request, "signin", email);
  if (!limit.allowed)
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
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
    return userNotFound();
  }
  if (
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    await audit("signin", "FAILURE", user.id, request).catch(() => undefined);
    return invalid();
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
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}

export async function POST(request: Request) {
  try {
    return await signIn(request);
  } catch {
    return NextResponse.json(
      { message: "Unable to sign in. Please try again." },
      { status: 500 },
    );
  }
}
