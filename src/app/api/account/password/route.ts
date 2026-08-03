import { NextResponse } from "next/server";
import Joi from "joi";
import { hashPassword, requireCsrf, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = Joi.object({
  currentPassword: Joi.string().max(1024).allow(""),
  password: Joi.string().min(8).max(1024).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
}).options({ abortEarly: false, allowUnknown: false });
export async function POST(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  const { value, error } = schema.validate(
    await request.json().catch(() => null),
    {
      abortEarly: false,
      allowUnknown: false,
    },
  );
  if (error)
    return NextResponse.json(
      {
        message: "Please check the form.",
        fieldErrors: Object.fromEntries(
          error.details.map((detail) => [
            detail.path.join("."),
            [detail.message],
          ]),
        ),
      },
      { status: 400 },
    );
  if (
    session.user.passwordHash &&
    (!value.currentPassword ||
      !(await verifyPassword(value.currentPassword, session.user.passwordHash)))
  )
    return NextResponse.json(
      { message: "Current password is incorrect." },
      { status: 401 },
    );
  await db.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashPassword(value.password),
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
