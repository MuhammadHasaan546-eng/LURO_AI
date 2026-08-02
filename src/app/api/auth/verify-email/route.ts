import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { tokenSchema } from "@/lib/validation";
export async function POST(request: Request) {
  const parsed = tokenSchema.validate(await request.json().catch(() => null));
  const userId = parsed.error
    ? null
    : await consumeAuthToken(parsed.value.token, "VERIFY_EMAIL");
  if (!userId)
    return NextResponse.json(
      { message: "This verification link is invalid or expired." },
      { status: 400 },
    );
  await db.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });
  return NextResponse.json({ message: "Your email has been verified." });
}
