import { NextResponse } from "next/server";
import { getCurrentSession, requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
  });
}

export async function PATCH(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  const body = (await request.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
  } | null;
  const firstName = body?.firstName?.trim().slice(0, 100);
  const lastName = body?.lastName?.trim().slice(0, 100);
  if (!firstName || !lastName)
    return NextResponse.json(
      { message: "First and last name are required." },
      { status: 400 },
    );
  await db.user.update({
    where: { id: session.userId },
    data: { firstName, lastName },
  });
  return NextResponse.json({ message: "Account updated." });
}
