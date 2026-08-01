import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db } from "@/lib/db";

export const SESSION_COOKIE_NAME = "luro_session";

const BCRYPT_ROUNDS = 12;
const SESSION_TOKEN_BYTES = 32;
const SESSION_TOKEN_LENGTH = SESSION_TOKEN_BYTES * 2;
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_TOKEN_PATTERN = /^[a-f0-9]+$/;

const sessionCookieOptions = (expires: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  expires,
});

export const hashPassword = (password: string) =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const isValidSessionToken = (token: string) =>
  token.length === SESSION_TOKEN_LENGTH && SESSION_TOKEN_PATTERN.test(token);

export const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createSession = async (userId: string) => {
  const token = randomBytes(SESSION_TOKEN_BYTES).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));

  return expiresAt;
};

export const getCurrentSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token || !isValidSessionToken(token)) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await db.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session;
};

export const deleteCurrentSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token && isValidSessionToken(token)) {
    await db.session.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
  });
};
