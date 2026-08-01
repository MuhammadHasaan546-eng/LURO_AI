import { NextResponse } from "next/server";
import { hashPassword, requireCsrf, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
const schema = z
  .object({
    currentPassword: z.string().max(1024).optional(),
    password: z.string().min(12).max(1024),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export async function POST(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      {
        message: "Please check the form.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (
    session.user.passwordHash &&
    (!parsed.data.currentPassword ||
      !(await verifyPassword(
        parsed.data.currentPassword,
        session.user.passwordHash,
      )))
  )
    return NextResponse.json(
      { message: "Current password is incorrect." },
      { status: 401 },
    );
  await db.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      passwordChangedAt: new Date(),
      lastAuthenticatedAt: new Date(),
    },
  });
  await db.session.updateMany({
    where: { userId: session.userId, id: { not: session.id }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return NextResponse.json({ message: "Password updated." });
}
