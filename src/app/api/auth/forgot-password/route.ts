import { NextResponse } from "next/server";
import { audit, issueAuthToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((v) => v.toLowerCase()),
});
export async function POST(request: Request) {
  const limit = await checkRateLimit(request, "recovery");
  if (!limit.allowed)
    return NextResponse.json({
      message: "If an account exists, reset instructions will be sent shortly.",
    });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (parsed.success) {
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (user) {
      await db.authToken.updateMany({
        where: { userId: user.id, purpose: "RESET_PASSWORD", usedAt: null },
        data: { usedAt: new Date() },
      });
      const token = await issueAuthToken(
        user.id,
        "RESET_PASSWORD",
        30 * 60_000,
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
            type: "reset-password",
            email: user.email,
            token,
            url: `${env.APP_URL}/auth/reset-password?token=${token}`,
          }),
        }).catch(() => undefined);
      await audit("password_reset_requested", "SUCCESS", user.id, request);
    }
  }
  return NextResponse.json({
    message: "If an account exists, reset instructions will be sent shortly.",
  });
}
