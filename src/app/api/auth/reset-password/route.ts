import { NextResponse } from "next/server";
import Joi from "joi";
import { consumeAuthToken, deleteAllSessions, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = Joi.object({
  token: Joi.string().hex().length(64).required(),
  password: Joi.string().min(12).max(1024).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
}).options({ abortEarly: false, allowUnknown: false });
export async function POST(request: Request) {
  const parsed = schema.validate(await request.json().catch(() => null));
  if (parsed.error)
    return NextResponse.json(
      {
        message: "Please check the form.",
        fieldErrors: Object.fromEntries(
          parsed.error.details.map((detail) => [
            detail.path.join("."),
            [detail.message],
          ]),
        ),
      },
      { status: 400 },
    );
  const userId = await consumeAuthToken(parsed.value.token, "RESET_PASSWORD");
  if (!userId)
    return NextResponse.json(
      { message: "This reset link is invalid or expired." },
      { status: 400 },
    );
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(parsed.value.password),
      passwordChangedAt: new Date(),
      lastAuthenticatedAt: null,
    },
  });
  await deleteAllSessions(userId);
  return NextResponse.json({
    message: "Password updated. Sign in with your new password.",
  });
}
