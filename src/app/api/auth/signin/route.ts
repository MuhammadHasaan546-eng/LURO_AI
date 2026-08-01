import { NextResponse } from "next/server";
import { SignInSchema } from "@/signin-schema";
import {
  audit,
  createSession,
  getCurrentSession,
  verifyPassword,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const invalid = () =>
  NextResponse.json({ message: "Invalid email or password." }, { status: 401 });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = SignInSchema.safeParse(body);
  if (!validation.success) {
    const { fieldErrors, formErrors } = validation.error.flatten();
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        fieldErrors,
        formErrors,
      },
      { status: 400 },
    );
  }
  const { email, password } = validation.data;
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
  if (
    !user?.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    await audit("signin", "FAILURE", user?.id, request);
    return invalid();
  }
  await db.user.update({
    where: { id: user.id },
    data: { lastAuthenticatedAt: new Date() },
  });
  const current = await getCurrentSession();
  if (current)
    await db.session.update({
      where: { id: current.id },
      data: { revokedAt: new Date() },
    });
  await createSession(user.id, request);
  await audit("signin", "SUCCESS", user.id, request);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}
