import { NextResponse } from "next/server";
import { deleteCurrentSession, requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireCsrf(request);
    if (!session) {
      return NextResponse.json({ message: "Invalid request." }, { status: 403 });
    }

    await db.session.updateMany({
      where: { userId: session.userId, id: { not: session.id }, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ message: "Other sessions revoked." });
  } catch (error) {
    console.error("Error in POST /api/account:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireCsrf(request);
    if (!session) {
      return NextResponse.json({ message: "Invalid request." }, { status: 403 });
    }

    await db.user.delete({ where: { id: session.userId } });
    await deleteCurrentSession();

    return NextResponse.json({ message: "Account deleted." });
  } catch (error) {
    console.error("Error in DELETE /api/account:", error);
    return NextResponse.json({ message: "Internal Server Error." }, { status: 500 });
  }
}