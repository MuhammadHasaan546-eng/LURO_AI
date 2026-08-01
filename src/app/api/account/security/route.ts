import { NextResponse } from "next/server";
import { deleteCurrentSession, requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";
export async function POST(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  await db.session.updateMany({
    where: { userId: session.userId, id: { not: session.id }, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return NextResponse.json({ message: "Other sessions revoked." });
}
export async function DELETE(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  await db.user.delete({ where: { id: session.userId } });
  await deleteCurrentSession();
  return NextResponse.json({ message: "Account deleted." });
}
