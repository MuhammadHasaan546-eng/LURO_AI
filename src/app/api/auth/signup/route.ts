import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { SignUpSchema } from "@/signup-schema";
import { createSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const duplicateEmailResponse = () =>
  NextResponse.json(
    {
      message: "An account with this email already exists.",
      fieldErrors: {
        email: ["An account with this email already exists."],
      },
    },
    { status: 409 },
  );

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

  const validation = SignUpSchema.safeParse(body);

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

  const { firstName, lastName, email, password } = validation.data;
  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    return duplicateEmailResponse();
  }

  const passwordHash = await hashPassword(password);
  let user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  try {
    user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return duplicateEmailResponse();
    }

    throw error;
  }

  await createSession(user.id);

  return NextResponse.json({ user }, { status: 201 });
}
