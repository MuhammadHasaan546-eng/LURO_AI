import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  audit: vi.fn().mockResolvedValue(undefined),
  createSession: vi.fn().mockResolvedValue(undefined),
  getCurrentSession: vi.fn().mockResolvedValue(null),
  hashPassword: vi.fn().mockResolvedValue("safe-hash"),
  issueAuthToken: vi.fn().mockResolvedValue("a".repeat(64)),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

const db = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined),
    claimNotification: vi.fn(),
    releaseNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

const notifications = vi.hoisted(() => ({
  sendWelcomeEmail: vi.fn(),
  sendWelcomeBackEmail: vi.fn(),
}));

vi.mock("@/lib/auth", () => auth);
vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  checkSignupRateLimits: vi.fn().mockResolvedValue({
    allowed: true,
    limit: 5,
    remaining: 4,
    retryAfter: 0,
  }),
}));
vi.mock("@/lib/env", () => ({
  env: {
    APP_URL: "https://luro.example",
    EMAIL_WEBHOOK_URL: undefined,
  },
}));
vi.mock("@/lib/auth-notifications", () => notifications);

import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as signin } from "@/app/api/auth/signin/route";

const request = (url: string, body: unknown) =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const user = {
  id: "user-id",
  email: "user@example.com",
  firstName: "Ava",
  lastName: "Stone",
  passwordHash: "safe-hash",
};

describe("authentication email notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getCurrentSession.mockResolvedValue(null);
    auth.verifyPassword.mockResolvedValue(true);
    db.user.update.mockResolvedValue(undefined);
    db.user.releaseNotification.mockResolvedValue(undefined);
    notifications.sendWelcomeEmail.mockResolvedValue({ status: "sent" });
    notifications.sendWelcomeBackEmail.mockResolvedValue({ status: "sent" });
  });

  it("sends one welcome email after successful signup", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue(user);
    db.user.claimNotification.mockResolvedValue(true);

    const response = await signup(
      request("https://luro.example/api/auth/signup", {
        firstName: "Ava",
        lastName: "Stone",
        email: "USER@example.com",
        password: "correct-horse",
        confirmPassword: "correct-horse",
      }),
    );

    expect(response.status).toBe(201);
    expect(notifications.sendWelcomeEmail).toHaveBeenCalledOnce();
    expect(notifications.sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" }),
    );
  });

  it("rejects an invalid signup email without delivery", async () => {
    const response = await signup(
      request("https://luro.example/api/auth/signup", {
        firstName: "Ava",
        lastName: "Stone",
        email: "not-an-email",
        password: "correct-horse",
        confirmPassword: "correct-horse",
      }),
    );

    expect(response.status).toBe(400);
    expect(notifications.sendWelcomeEmail).not.toHaveBeenCalled();
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it("keeps signup successful and releases the claim after failed delivery", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue(user);
    db.user.claimNotification.mockResolvedValue(true);
    notifications.sendWelcomeEmail.mockResolvedValue({ status: "failed" });

    const response = await signup(
      request("https://luro.example/api/auth/signup", {
        firstName: "Ava",
        lastName: "Stone",
        email: "user@example.com",
        password: "correct-horse",
        confirmPassword: "correct-horse",
      }),
    );

    expect(response.status).toBe(201);
    expect(db.user.releaseNotification).toHaveBeenCalledWith(
      expect.objectContaining({ field: "welcomeEmailSentAt" }),
    );
  });

  it("sends a dated welcome-back email after successful login", async () => {
    db.user.findUnique.mockResolvedValue(user);
    db.user.claimNotification.mockResolvedValue(true);

    const response = await signin(
      request("https://luro.example/api/auth/signin", {
        email: user.email,
        password: "correct-horse",
      }),
    );

    expect(response.status).toBe(200);
    expect(notifications.sendWelcomeBackEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: user.email,
        loginAt: expect.any(Date),
      }),
    );
  });

  it("suppresses a repeated login notification within the throttle window", async () => {
    db.user.findUnique.mockResolvedValue(user);
    db.user.claimNotification
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const credentials = { email: user.email, password: "correct-horse" };
    const first = await signin(
      request("https://luro.example/api/auth/signin", credentials),
    );
    const second = await signin(
      request("https://luro.example/api/auth/signin", credentials),
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(notifications.sendWelcomeBackEmail).toHaveBeenCalledOnce();
  });
});
