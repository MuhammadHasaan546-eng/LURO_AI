import { apiRequest, getApiError, type ApiError } from "@/store/api/index";

export type Account = {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    hasPassword: boolean;
    identities: { id: string; provider: string; email: string | null }[];
  };
  sessions: {
    id: string;
    current: boolean;
    createdAt: string;
    lastSeenAt: string;
    userAgent: string | null;
  }[];
};

export type Mutation =
  | {
      kind: "profile";
      firstName: FormDataEntryValue | null;
      lastName: FormDataEntryValue | null;
    }
  | {
      kind: "password";
      currentPassword: FormDataEntryValue | null;
      password: FormDataEntryValue | null;
      confirmPassword: FormDataEntryValue | null;
    }
  | { kind: "removeProvider"; id: string }
  | { kind: "revokeSession"; id: string }
  | { kind: "revokeOtherSessions" }
  | { kind: "deleteAccount" };

export type MutationResponse = { message: string; kind: Mutation["kind"] };

const rejectError = (error: unknown, fallback: string): ApiError => ({
  message: getApiError(error, fallback),
});

export const fetchAccountRequest = () => apiRequest<Account>("/api/account");

export const mutateAccountRequest = async (mutation: Mutation) => {
  const config: Record<
    Mutation["kind"],
    { url: string; method: string; body?: unknown }
  > = {
    profile: { url: "/api/account", method: "PATCH", body: mutation },
    password: { url: "/api/account/password", method: "POST", body: mutation },
    removeProvider: {
      url: `/api/account/providers/${"id" in mutation ? mutation.id : ""}`,
      method: "DELETE",
    },
    revokeSession: {
      url: `/api/account/sessions/${"id" in mutation ? mutation.id : ""}`,
      method: "DELETE",
    },
    revokeOtherSessions: { url: "/api/account/security", method: "POST" },
    deleteAccount: { url: "/api/account/security", method: "DELETE" },
  };
  const selected = config[mutation.kind];
  try {
    const response = await apiRequest<{ message: string }>(selected.url, {
      method: selected.method,
      data: selected.body,
    });
    return { ...response, kind: mutation.kind };
  } catch (error) {
    throw rejectError(error, "Unable to update your account.");
  }
};
