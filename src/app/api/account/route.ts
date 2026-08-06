import { NextResponse } from "next/server";
import { getCurrentSession, requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";
import { accountNameSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session)
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
        { status: 401 },
      );

    const sessions = await db.session.findMany({
      where: {
        userId: session.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
        userAgent: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account loaded successfully.",
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          emailVerified: Boolean(session.user.emailVerifiedAt),
          hasPassword: Boolean(session.user.passwordHash),
          identities: session.user.identities.map((identity) => ({
            id: identity.id,
            provider: identity.provider,
            email: identity.providerEmail,
          })),
        },
        sessions: sessions.map((item) => ({
          ...item,
          current: item.id === session.id,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/account error:", error);
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireCsrf(request);
    if (!session)
      return NextResponse.json(
        { success: false, code: "CSRF_INVALID", message: "Invalid request." },
        { status: 403 },
      );

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", message: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const parsed = accountNameSchema.validate(body);
    if (parsed.error)
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "First and last name are required.",
          fieldErrors: {
            firstName: ["First name is required."],
            lastName: ["Last name is required."],
          },
        },
        { status: 400 },
      );

    const dataValue = parsed.value || body;

    await db.user.update({
      where: { id: session.userId },
      data: {
        firstName: dataValue.firstName,
        lastName: dataValue.lastName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account updated successfully.",
      data: null,
    });
  } catch (error) {
    console.error("PATCH /api/account error:", error);
    return NextResponse.json(
      { success: false, code: "INTERNAL_ERROR", message: "Internal server error." },
      { status: 500 }
    );
  }
}