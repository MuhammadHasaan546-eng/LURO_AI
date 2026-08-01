import { NextResponse } from "next/server";

import { SignInSchema } from "@/signin-schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const invalidCredentialsResponse = () =>
  NextResponse.json({ message: "Invalid email or password." }, { status: 401 });

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

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

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return invalidCredentialsResponse();
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
}
