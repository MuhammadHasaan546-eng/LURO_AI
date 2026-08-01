import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { OAuthProvider } from "@prisma/client";
import { db } from "@/lib/db";
import { env, isAppleEnabled, isGoogleEnabled } from "@/lib/env";
import { getCurrentSession, hashToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const providerConfig = {
  google: {
    enabled: isGoogleEnabled,
    provider: OAuthProvider.GOOGLE,
    authorization: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: "openid email profile",
  },
  apple: {
    enabled: isAppleEnabled,
    provider: OAuthProvider.APPLE,
    authorization: "https://appleid.apple.com/auth/authorize",
    scope: "name email",
  },
} as const;

const redirectUri = (provider: string) =>
  `${env.APP_URL}/api/auth/oauth/${provider}/callback`;
const safeReturnTo = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/app";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: providerName } = await context.params;
  const config = providerConfig[providerName as keyof typeof providerConfig];
  if (!config?.enabled)
    return NextResponse.json(
      { message: "This sign-in provider is not configured." },
      { status: 404 },
    );
  const limit = await checkRateLimit(request, "oauth", providerName);
  if (!limit.allowed)
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  const url = new URL(request.url);
  const state = randomBytes(32).toString("hex");
  const nonce = randomBytes(32).toString("hex");
  const verifier = randomBytes(32).toString("base64url");
  const session = await getCurrentSession();
  await db.oAuthChallenge.create({
    data: {
      stateHash: hashToken(state),
      nonceHash: hashToken(nonce),
      codeVerifier: verifier,
      provider: config.provider,
      intent: session ? "link" : "signin",
      returnTo: safeReturnTo(url.searchParams.get("returnTo")),
      userId: session?.userId,
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });
  const params = new URLSearchParams({
    client_id:
      providerName === "google" ? env.GOOGLE_CLIENT_ID! : env.APPLE_CLIENT_ID!,
    redirect_uri: redirectUri(providerName),
    response_type: "code",
    scope: config.scope,
    state,
    nonce,
  });
  if (providerName === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "select_account");
    params.set(
      "code_challenge",
      createHash("sha256").update(verifier).digest("base64url"),
    );
    params.set("code_challenge_method", "S256");
  }
  return NextResponse.redirect(`${config.authorization}?${params.toString()}`);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  return GET(request, context);
}
