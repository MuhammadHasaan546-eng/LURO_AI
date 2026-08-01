import { createHash, createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "luro_session";
export const CSRF_COOKIE_NAME = "luro_csrf";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const IDLE_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_BYTES = 32;
const tokenPattern = /^[a-f0-9]{64}$/;

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const hashIp = (value: string | null) =>
  value
    ? createHmac("sha256", env.AUTH_SECRET ?? "development-only-auth-key")
        .update(value)
        .digest("hex")
    : null;
export const isValidToken = (token: string | undefined) =>
  Boolean(token && tokenPattern.test(token));
export const hashPassword = (password: string) =>
  argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
export const verifyPassword = (password: string, hash: string) =>
  argon2.verify(hash, password);

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
  expires,
});

export const createSession = async (userId: string, request?: Request) => {
  const sessionToken = randomBytes(TOKEN_BYTES).toString("hex");
  const csrfToken = randomBytes(TOKEN_BYTES).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const idleExpiresAt = new Date(now.getTime() + IDLE_TTL_MS);
  const userAgent = request?.headers.get("user-agent")?.slice(0, 500);
  const ip =
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request?.headers.get("x-real-ip") ??
    null;

  await db.session.create({
    data: {
      tokenHash: hashToken(sessionToken),
      csrfTokenHash: hashToken(csrfToken),
      userId,
      expiresAt,
      idleExpiresAt,
      userAgent: userAgent ?? null,
      ipAddressHash: hashIp(ip),
    },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions(expiresAt));
  store.set(CSRF_COOKIE_NAME, csrfToken, {
    ...cookieOptions(expiresAt),
    httpOnly: false,
  });
  return { expiresAt, csrfToken };
};

export type CurrentSession = import("@/lib/db").CurrentSession;

export const getCurrentSession = async (): Promise<CurrentSession | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!isValidToken(token)) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token!) },
    include: true,
  });
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.idleExpiresAt <= new Date()
  ) {
    if (session)
      await db.session
        .update({ where: { id: session.id }, data: { revokedAt: new Date() } })
        .catch(() => undefined);
    return null;
  }
  return session as CurrentSession;
};

export const requireCsrf = async (
  request: Request,
): Promise<CurrentSession | null> => {
  const header = request.headers.get("x-csrf-token");
  const session = await getCurrentSession();
  if (!session || !header || !isValidToken(header)) return null;
  return hashToken(header) === session.csrfTokenHash ? session : null;
};

export const deleteCurrentSession = async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (isValidToken(token))
    await db.session.updateMany({
      where: { tokenHash: hashToken(token!), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  store.set(SESSION_COOKIE_NAME, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
  store.set(CSRF_COOKIE_NAME, "", {
    ...cookieOptions(new Date(0)),
    httpOnly: false,
    maxAge: 0,
  });
};

export const deleteAllSessions = async (userId: string) =>
  db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
export const issueAuthToken = async (
  userId: string,
  purpose: "VERIFY_EMAIL" | "RESET_PASSWORD",
  ttlMs: number,
) => {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  await db.authToken.create({
    data: {
      tokenHash: hashToken(token),
      purpose,
      userId,
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });
  return token;
};
export const consumeAuthToken = async (
  token: string,
  purpose: "VERIFY_EMAIL" | "RESET_PASSWORD",
) => {
  if (!isValidToken(token)) return null;
  const record = await db.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (
    !record ||
    record.purpose !== purpose ||
    record.usedAt ||
    record.expiresAt <= new Date()
  )
    return null;
  const updated = await db.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  return updated.count === 1 ? record.userId : null;
};
export const audit = (
  event: string,
  outcome: "SUCCESS" | "FAILURE",
  userId?: string,
  request?: Request,
) =>
  db.auditEvent.create({
    data: {
      event,
      outcome,
      userId,
      userAgent: request?.headers.get("user-agent")?.slice(0, 500),
      ipAddressHash: hashIp(
        request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      ),
    },
  });
