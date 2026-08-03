import { describe, expect, it } from "vitest";
import {
  AuthTokenModel,
  OAuthChallengeModel,
  ProviderIdentityModel,
  SessionModel,
  UserModel,
} from "@/models";

describe("Mongoose model constraints", () => {
  it("normalizes users and omits sensitive fields from JSON", async () => {
    const user = new UserModel({
      email: " USER@EXAMPLE.COM ",
      firstName: "User",
      lastName: "Example",
      passwordHash: "argon2-hash",
    });
    await user.validate();
    expect(user.email).toBe("user@example.com");
    expect(user.toJSON()).not.toHaveProperty("passwordHash");
  });

  it("requires valid provider enum values", async () => {
    const identity = new ProviderIdentityModel({
      provider: "UNTRUSTED",
      providerSubject: "subject",
      userId: "user-id",
    });
    await expect(identity.validate()).rejects.toThrow();
  });

  it("omits session and challenge secrets", () => {
    const session = new SessionModel({
      tokenHash: "a".repeat(64),
      csrfTokenHash: "b".repeat(64),
      userId: "user-id",
      expiresAt: new Date(Date.now() + 10_000),
      idleExpiresAt: new Date(Date.now() + 10_000),
      lastSeenAt: new Date(),
      authenticatedAt: new Date(),
    });
    expect(session.toJSON()).not.toHaveProperty("tokenHash");
    expect(session.toJSON()).not.toHaveProperty("csrfTokenHash");

    const challenge = new OAuthChallengeModel({
      stateHash: "c".repeat(64),
      nonceHash: "d".repeat(64),
      codeVerifier: "verifier",
      provider: "GOOGLE",
      intent: "signin",
      returnTo: "/app",
      expiresAt: new Date(Date.now() + 10_000),
    });
    expect(challenge.toJSON()).not.toHaveProperty("codeVerifier");
  });

  it("defines integrity and expiry indexes", () => {
    expect(UserModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ email: 1 }, expect.objectContaining({ unique: true })],
      ]),
    );
    expect(AuthTokenModel.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })],
      ]),
    );
  });
});
