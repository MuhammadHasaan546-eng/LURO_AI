import { describe, expect, it } from "vitest";

import accountReducer, {
  fetchAccount,
} from "@/store/account/slice/accountSlice";
import authReducer, {
  clearAuthRequest,
  verifyEmail,
} from "@/store/auth/slice/authSlice";

const account = {
  user: {
    email: "user@example.com",
    firstName: "User",
    lastName: "Example",
    emailVerified: true,
    hasPassword: true,
    identities: [],
  },
  sessions: [],
};

describe("request lifecycle reducers", () => {
  it("ignores an auth fulfillment after request state was cleared", () => {
    const pending = authReducer(
      undefined,
      verifyEmail.pending("auth-request", "token"),
    );
    const cleared = authReducer(pending, clearAuthRequest());
    const completed = authReducer(
      cleared,
      verifyEmail.fulfilled(
        { message: "Verified" },
        "auth-request",
        "token",
      ),
    );

    expect(completed.status).toBe("idle");
    expect(completed.data).toBeNull();
    expect(completed.currentRequestId).toBeNull();
  });

  it("treats an aborted current auth request as idle, not failed", () => {
    const pending = authReducer(
      undefined,
      verifyEmail.pending("auth-request", "token"),
    );
    const aborted = authReducer(
      pending,
      {
        type: verifyEmail.rejected.type,
        payload: undefined,
        error: { name: "AbortError", message: "Aborted" },
        meta: {
          arg: "token",
          requestId: "auth-request",
          requestStatus: "rejected",
          aborted: true,
          condition: false,
        },
      } as never,
    );

    expect(aborted.status).toBe("idle");
    expect(aborted.error).toBeNull();
    expect(aborted.currentRequestId).toBeNull();
  });

  it("ignores an account fulfillment whose request id is no longer current", () => {
    const pending = accountReducer(
      undefined,
      fetchAccount.pending("account-request", undefined),
    );
    const completed = accountReducer(
      pending,
      fetchAccount.fulfilled(account, "stale-request", undefined),
    );

    expect(completed.status).toBe("loading");
    expect(completed.data).toBeNull();
    expect(completed.currentRequestId).toBe("account-request");
  });

  it("clears loading without an error when the current account request aborts", () => {
    const pending = accountReducer(
      undefined,
      fetchAccount.pending("account-request", undefined),
    );
    const aborted = accountReducer(
      pending,
      {
        type: fetchAccount.rejected.type,
        payload: undefined,
        error: { name: "AbortError", message: "Aborted" },
        meta: {
          arg: undefined,
          requestId: "account-request",
          requestStatus: "rejected",
          aborted: true,
          condition: false,
        },
      } as never,
    );

    expect(aborted.status).toBe("idle");
    expect(aborted.error).toBeNull();
    expect(aborted.currentRequestId).toBeNull();
  });
});
