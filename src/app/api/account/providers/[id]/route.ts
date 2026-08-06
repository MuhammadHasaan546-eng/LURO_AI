import { NextResponse } from "next/server";
import { requireCsrf } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireCsrf(request);
    if (!session)
      return NextResponse.json({ message: "Invalid request." }, { status: 403 });

    const { id } = await context.params;
    if (!/^[0-9a-f]{24}$/i.test(id) && !/^[0-9a-f-]{36}$/i.test(id))
      return NextResponse.json(
        { message: "Sign-in method not found." },
        { status: 404 },
      );

    const identity = await db.providerIdentity.findFirst({
      where: { id, userId: session.userId },
    });
    if (!identity)
      return NextResponse.json(
        { message: "Sign-in method not found." },
        { status: 404 },
      );

    const methods =
      session.user.identities.length + (session.user.passwordHash ? 1 : 0);
    if (methods <= 1)
      return NextResponse.json(
        { message: "You cannot remove your final sign-in method." },
        { status: 400 },
      );

    await db.providerIdentity.delete({ where: { id } });
    return NextResponse.json({ message: "Sign-in method removed." });
  } catch (error) {
    console.error("DELETE provider identity error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}