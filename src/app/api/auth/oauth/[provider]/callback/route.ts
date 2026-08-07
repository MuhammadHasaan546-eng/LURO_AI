import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { audit, createSession, getCurrentSession, hashToken } from "@/lib/auth";
import { exchangeAndVerify, isProviderName, oauthProviders } from "@/lib/oauth";
const fallback = (message: string, path = "/auth/signin") =>
  NextResponse.redirect(
    new URL(`${path}?error=${encodeURIComponent(message)}`, env.APP_URL),
  );

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: providerName } = await context.params;
  if (!isProviderName(providerName))
    return fallback("Unsupported sign-in provider.");
  const provider = oauthProviders[providerName];
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error") || !code || !state)
    return fallback("Sign-in was cancelled or could not be completed.");
  const challenge = await db.oAuthChallenge.findUnique({
    where: { stateHash: hashToken(state) },
  });
  if (
    !challenge ||
    challenge.provider !== provider ||
    challenge.expiresAt <= new Date()
  )
    return fallback("Sign-in session expired. Please try again.");
  await db.oAuthChallenge.delete({ where: { id: challenge.id } });
  try {
    const identity = await exchangeAndVerify(
      providerName,
      code,
      challenge.codeVerifier,
      challenge.nonceHash,
      url.searchParams.get("user"),
    );
    const existingIdentity = await db.providerIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider,
          providerSubject: identity.subject,
        },
      },
    });
    const current = await getCurrentSession();
    if (challenge.intent === "link") {
      if (!current || current.userId !== challenge.userId)
        return fallback("Your session expired. Please sign in again.");
      if (existingIdentity && existingIdentity.userId !== current.userId)
        return fallback("This provider is already linked to another account.");
      await db.providerIdentity.upsert({
        where: {
          provider_providerSubject: {
            provider,
            providerSubject: identity.subject,
          },
        },
        create: {
          provider,
          providerSubject: identity.subject,
          providerEmail: identity.email,
          emailVerified: identity.emailVerified,
          displayName: `${identity.firstName} ${identity.lastName}`.trim(),
          userId: current.userId,
        },
        update: {
          providerEmail: identity.email,
          emailVerified: identity.emailVerified,
        },
      });
      return NextResponse.redirect(new URL("/account?linked=1", url.origin));
    }
    let userId = existingIdentity?.userId;
    if (challenge.intent === "signin" && !userId) {
      return fallback(
        "No account exists for this Google email. Please sign up first.",
      );
    }
    if (challenge.intent === "signup" && !userId) {
      if (!identity.email || !identity.emailVerified)
        return fallback(
          "This provider did not provide a verified email address.",
        );
      const emailUser = await db.user.findUnique({
        where: { email: identity.email },
      });
      if (emailUser)
        return fallback(
          "An account already exists with this email. Please sign in instead.",
          "/auth/signup",
        );
      const user = await db.user.create({
        data: {
          email: identity.email,
          firstName: identity.firstName,
          lastName: identity.lastName,
          emailVerifiedAt: new Date(),
          identities: {
            create: {
              provider,
              providerSubject: identity.subject,
              providerEmail: identity.email,
              emailVerified: true,
              displayName: `${identity.firstName} ${identity.lastName}`.trim(),
            },
          },
        },
        select: { id: true },
      });
      if (!user) throw new Error("Failed to create OAuth user");
      userId = user.id;
    }
    if (!userId) return fallback("We could not find an account for this sign-in.");
    if (current)
      await db.session.update({
        where: { id: current.id },
        data: { revokedAt: new Date() },
      });
    await createSession(userId, request);
    await audit("oauth_signin", "SUCCESS", userId, request);
    return NextResponse.redirect(new URL(challenge.returnTo, url.origin));
  } catch {
    await audit("oauth_signin", "FAILURE", undefined, request);
    return fallback("We could not verify this sign-in. Please try again.");
  }
}
