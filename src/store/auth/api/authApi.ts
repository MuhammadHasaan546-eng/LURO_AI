import { apiRequest, type ApiError } from "@/store/api/index";

export type AuthResponse = ApiError & { message?: string };

export type SigninResponse = AuthResponse & {
  code?: "ALREADY_AUTHENTICATED";
  redirectTo?: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type SignupPayload = Credentials & {
  firstName: string;
  lastName: string;
  confirmPassword: string;
};

export type ResetPasswordPayload = {
  token: string | null;
  password: FormDataEntryValue | null;
  confirmPassword: FormDataEntryValue | null;
};

export const signInRequest = (payload: Credentials) =>
  apiRequest<SigninResponse>("/api/auth/signin", {
    method: "POST",
    data: payload,
  });

export const signUpRequest = (payload: SignupPayload) =>
  apiRequest<AuthResponse>("/api/auth/signup", {
    method: "POST",
    data: payload,
  });

const clearClientAuthArtifacts = () => {
  if (typeof window === "undefined") return;

  // The session cookie is HttpOnly and is cleared by the server. Remove the
  // readable CSRF cookie and any legacy client-side auth values as defense in
  // depth so credentials cannot survive a successful logout.
  document.cookie =
    "luro_csrf=; Path=/; Max-Age=0; SameSite=Lax" +
    (window.location.protocol === "https:" ? "; Secure" : "");

  const authStorageKeys = [
    "luro_token",
    "luro_access_token",
    "luro_refresh_token",
    "authToken",
    "accessToken",
    "refreshToken",
  ];

  for (const key of authStorageKeys) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
};

export const logoutRequest = async () => {
  try {
    return await apiRequest<AuthResponse>("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    // Clear browser-side auth state even when the server session is already
    // expired or the logout endpoint returns an authentication error.
    clearClientAuthArtifacts();
  }
};

export const forgotPasswordRequest = (email: string) =>
  apiRequest<AuthResponse>("/api/auth/forgot-password", {
    method: "POST",
    data: { email },
  });

export const resetPasswordRequest = (payload: ResetPasswordPayload) =>
  apiRequest<AuthResponse>("/api/auth/reset-password", {
    method: "POST",
    data: payload,
  });

export const verifyEmailRequest = (
  token: string | null,
  signal?: AbortSignal,
) =>
  apiRequest<AuthResponse>("/api/auth/verify-email", {
    method: "POST",
    data: { token },
    signal,
  });

export const resendVerificationRequest = () =>
  apiRequest<AuthResponse>("/api/auth/resend-verification", {
    method: "POST",
  });
