import { NextResponse } from "next/server";
import { requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  const { id } = await context.params;
  if (id === session.id)
    return NextResponse.json(
      { message: "Use sign out to revoke the current session." },
      { status: 400 },
    );
  await db.session.updateMany({
    where: { id, userId: session.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return NextResponse.json({ message: "Session revoked." });
}
