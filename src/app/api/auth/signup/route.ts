import { NextResponse } from "next/server";

import { SignUpSchema } from "@/signup-schema";
import { audit, createSession, hashPassword, issueAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const genericDuplicateResponse = () =>
  NextResponse.json(
    {
      message:
        "If an account can be created with these details, we will continue the setup.",
    },
    { status: 202 },
  );

const parseBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  const body = await parseBody(request);
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
    return NextResponse.json(
      {
        message: "Please correct the highlighted fields.",
        fieldErrors,
        formErrors,
      },
      { status: 400 },
    );
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
    return NextResponse.json(
      { user, emailVerificationRequired: true },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && /duplicate key|E11000/i.test(error.message))
      return genericDuplicateResponse();
    throw error;
  }
}
