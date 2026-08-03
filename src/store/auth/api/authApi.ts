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

export const logoutRequest = () =>
  apiRequest<AuthResponse>("/api/auth/logout", { method: "POST" });

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

export const verifyEmailRequest = (token: string | null) =>
  apiRequest<AuthResponse>("/api/auth/verify-email", {
    method: "POST",
    data: { token },
  });

export const resendVerificationRequest = () =>
  apiRequest<AuthResponse>("/api/auth/resend-verification", {
    method: "POST",
  });
