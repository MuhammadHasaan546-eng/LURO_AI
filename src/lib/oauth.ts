import { createHash } from "node:crypto";
import type { OAuthProvider } from "@/lib/db";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/lib/env";

export const oauthProviders = {
  google: "GOOGLE",
  apple: "APPLE",
} as const satisfies Record<string, OAuthProvider>;

export type ProviderName = keyof typeof oauthProviders;

export const isProviderName = (value: string): value is ProviderName =>
  Object.hasOwn(oauthProviders, value);
export type VerifiedIdentity = {
  subject: string;
  email: string | null;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
};
const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const appleJwks = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);
const callback = (provider: ProviderName) =>
  `${env.APP_URL}/api/auth/oauth/${provider}/callback`;

const appleClientSecret = async () => {
  const key = await import("jose").then(({ importPKCS8 }) =>
    importPKCS8(env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"), "ES256"),
  );
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
    .setIssuer(env.APPLE_TEAM_ID!)
    .setAudience("https://appleid.apple.com")
    .setSubject(env.APPLE_CLIENT_ID!)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
};

export const exchangeAndVerify = async (
  provider: ProviderName,
  code: string,
  verifier: string,
  nonce: string,
  appleUser?: string | null,
): Promise<VerifiedIdentity> => {
  const isGoogle = provider === "google";
  const endpoint = isGoogle
    ? "https://oauth2.googleapis.com/token"
    : "https://appleid.apple.com/auth/token";
  const clientId = isGoogle ? env.GOOGLE_CLIENT_ID! : env.APPLE_CLIENT_ID!;
  const secret = isGoogle
    ? env.GOOGLE_CLIENT_SECRET!
    : await appleClientSecret();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: secret,
    redirect_uri: callback(provider),
  });
  if (isGoogle) body.set("code_verifier", verifier);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("OAuth code exchange failed");
  const token = (await response.json()) as { id_token?: string };
  if (!token.id_token) throw new Error("Provider did not return an ID token");
  const verified = await jwtVerify(
    token.id_token,
    isGoogle ? googleJwks : appleJwks,
    {
      issuer: isGoogle
        ? ["https://accounts.google.com", "accounts.google.com"]
        : "https://appleid.apple.com",
      audience: clientId,
    },
  );
  if (
    typeof verified.payload.nonce !== "string" ||
    createHash("sha256").update(verified.payload.nonce).digest("hex") !== nonce
  )
    throw new Error("Invalid OAuth nonce");
  const email =
    typeof verified.payload.email === "string"
      ? verified.payload.email.trim().toLowerCase()
      : null;
  const emailVerified =
    verified.payload.email_verified === true ||
    verified.payload.email_verified === "true";
  let firstName =
    typeof verified.payload.given_name === "string"
      ? verified.payload.given_name
      : "";
  let lastName =
    typeof verified.payload.family_name === "string"
      ? verified.payload.family_name
      : "";
  if (!isGoogle && appleUser) {
    try {
      const parsed = JSON.parse(appleUser) as {
        name?: { firstName?: string; lastName?: string };
      };
      firstName = parsed.name?.firstName ?? firstName;
      lastName = parsed.name?.lastName ?? lastName;
    } catch {}
  }
  if (!verified.payload.sub) throw new Error("ID token is missing subject");
  return {
    subject: verified.payload.sub,
    email,
    emailVerified,
    firstName,
    lastName,
  };
};
