import { NextResponse } from "next/server";
import { consumeAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  const token = (
    (await request.json().catch(() => null)) as { token?: string } | null
  )?.token;
  const userId = token ? await consumeAuthToken(token, "VERIFY_EMAIL") : null;
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
