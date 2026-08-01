import { NextResponse } from "next/server";
import { issueAuthToken, requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
export async function POST(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  if (session.user.emailVerifiedAt)
    return NextResponse.json({ message: "Your email is already verified." });
  await db.authToken.updateMany({
    where: { userId: session.userId, purpose: "VERIFY_EMAIL", usedAt: null },
    data: { usedAt: new Date() },
  });
  const token = await issueAuthToken(
    session.userId,
    "VERIFY_EMAIL",
    24 * 60 * 60_000,
  );
  if (env.EMAIL_WEBHOOK_URL)
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
        email: session.user.email,
        token,
        url: `${env.APP_URL}/auth/verify-email?token=${token}`,
      }),
    }).catch(() => undefined);
  return NextResponse.json({
    message: "Verification instructions have been sent.",
  });
}
