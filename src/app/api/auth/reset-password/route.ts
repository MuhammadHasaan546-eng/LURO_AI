import { NextResponse } from "next/server";
import { consumeAuthToken, deleteAllSessions, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z
  .object({
    token: z.string().length(64),
    password: z.string().min(12).max(1024),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        message: "Please check the form.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const userId = await consumeAuthToken(parsed.data.token, "RESET_PASSWORD");
  if (!userId)
    return NextResponse.json(
      { message: "This reset link is invalid or expired." },
      { status: 400 },
    );
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      passwordChangedAt: new Date(),
      lastAuthenticatedAt: null,
    },
  });
  await deleteAllSessions(userId);
  return NextResponse.json({
    message: "Password updated. Sign in with your new password.",
  });
}
