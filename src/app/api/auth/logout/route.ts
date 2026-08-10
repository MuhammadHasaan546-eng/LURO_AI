import { NextResponse } from "next/server";
import { deleteCurrentSession, requireCsrf } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await requireCsrf(request);
  if (!session)
    return NextResponse.json({ message: "Invalid request." }, { status: 403 });
  await deleteCurrentSession();
  return NextResponse.json({ success: true });
}
