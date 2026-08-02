import { describe, expect, it } from "vitest";
import { SignInSchema } from "@/signin-schema";
import { SignUpSchema } from "@/signup-schema";
import { accountNameSchema, tokenSchema } from "@/lib/validation";

describe("Joi backend validation", () => {
  it("normalizes valid signup input", () => {
    const result = SignUpSchema.validate({
      firstName: " Ada ",
      lastName: " Lovelace ",
      email: " ADA@EXAMPLE.COM ",
      password: "Strong-password-123!",
      confirmPassword: "Strong-password-123!",
    });
    expect(result.error).toBeUndefined();
    expect(result.value.email).toBe("ada@example.com");
    expect(result.value.firstName).toBe("Ada");
  });

  it("rejects unknown signup fields and password mismatch", () => {
    const result = SignUpSchema.validate(
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "Strong-password-123!",
        confirmPassword: "different",
        role: "admin",
      },
      { abortEarly: false },
    );
    expect(
      result.error?.details.map((detail) => detail.path.join(".")),
    ).toEqual(expect.arrayContaining(["confirmPassword", "role"]));
  });

  it("rejects operator objects where scalar credentials are required", () => {
    expect(
      SignInSchema.validate({
        email: { $ne: null },
        password: { $gt: "" },
      }).error,
    ).toBeDefined();
  });

  it("enforces token format and account field limits", () => {
    expect(tokenSchema.validate({ token: "not-a-token" }).error).toBeDefined();
    expect(
      accountNameSchema.validate({ firstName: "x".repeat(101), lastName: "Ok" })
        .error,
    ).toBeDefined();
  });
});
