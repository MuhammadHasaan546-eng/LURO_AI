import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "luro_session";
const JWT_ISSUER = "luro-ai";
const JWT_AUDIENCE = "luro-ai-web";
const DEVELOPMENT_AUTH_SECRET =
  "development-only-auth-key-change-before-production";

const protectedApi = ["/api/account", "/api/auth/resend-verification"];

const isProtectedApiPath = (pathname: string) =>
  protectedApi.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedApiPath(pathname)) return NextResponse.next();

  // Keep token verification consistent with lib/auth.ts in development. In
  // production, env validation requires AUTH_SECRET, so no fallback is used.
  const secret =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : DEVELOPMENT_AUTH_SECRET);
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!secret || !token || token.length > 4096) {
    return NextResponse.json(
      {
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      },
      { status: 401 },
    );
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_TOKEN",
        message: "Your session has expired. Please sign in again.",
      },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/account/:path*", "/api/auth/resend-verification"],
};
