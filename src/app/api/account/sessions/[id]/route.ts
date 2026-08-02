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
  if (!/^[0-9a-f]{24}$/i.test(id) && !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json(
      { message: "Session not found." },
      { status: 404 },
    );
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
