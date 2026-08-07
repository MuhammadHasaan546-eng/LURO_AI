import { createAsyncThunk } from "@reduxjs/toolkit";

import { getApiError, type ApiError } from "@/store/api/index";
import {
  forgotPasswordRequest,
  logoutRequest,
  resendVerificationRequest,
  resetPasswordRequest,
  signInRequest,
  signUpRequest,
  verifyEmailRequest,
  type AuthResponse,
  type Credentials,
  type ResetPasswordPayload,
  type SigninResponse,
  type SignupPayload,
} from "@/store/auth/api/authApi";

const rejectApiError = (error: unknown, fallback: string): ApiError => {
  const apiError = (
    typeof error === "object" && error ? error : {}
  ) as ApiError;
  return { ...apiError, message: getApiError(error, fallback) };
};

const rejectSignInError = (error: unknown) =>
  rejectApiError(error, "Unable to sign in. Please try again.");

type AuthThunkConfig = { rejectValue: ApiError };

const notLoading = (_: unknown, { getState }: { getState: () => unknown }) =>
  (getState() as { auth: { status: string } }).auth.status !== "loading";

export const signIn = createAsyncThunk<
  SigninResponse,
  Credentials,
  AuthThunkConfig
>(
  "auth/signIn",
  async (payload, { rejectWithValue }) => {
    try {
      return await signInRequest(payload);
    } catch (error) {
      return rejectWithValue(rejectSignInError(error));
    }
  },
  { condition: notLoading },
);

export const signUp = createAsyncThunk<
  AuthResponse,
  SignupPayload,
  AuthThunkConfig
>(
  "auth/signUp",
  async (payload, { rejectWithValue }) => {
    try {
      return await signUpRequest(payload);
    } catch (error) {
      return rejectWithValue(
        rejectApiError(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    }
  },
  { condition: notLoading },
);

export const logout = createAsyncThunk<AuthResponse, void, AuthThunkConfig>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await logoutRequest();
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to log out. Please try again."),
      );
    }
  },
  { condition: notLoading },
);

export const forgotPassword = createAsyncThunk<
  AuthResponse,
  string,
  AuthThunkConfig
>(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      return await forgotPasswordRequest(email);
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to request a reset link."),
      );
    }
  },
  { condition: notLoading },
);

export const resetPassword = createAsyncThunk<
  AuthResponse,
  ResetPasswordPayload,
  AuthThunkConfig
>(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await resetPasswordRequest(payload);
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to update your password."),
      );
    }
  },
  { condition: notLoading },
);

export const verifyEmail = createAsyncThunk<
  AuthResponse,
  string | null,
  AuthThunkConfig
>(
  "auth/verifyEmail",
  async (token, { rejectWithValue, signal }) => {
    try {
      return await verifyEmailRequest(token, signal);
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to verify your email."),
      );
    }
  },
  { condition: notLoading },
);

export const resendVerification = createAsyncThunk<
  AuthResponse,
  void,
  AuthThunkConfig
>(
  "auth/resendVerification",
  async (_, { rejectWithValue }) => {
    try {
      return await resendVerificationRequest();
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to resend verification."),
      );
    }
  },
  { condition: notLoading },
);

export type {
  AuthResponse,
  Credentials,
  ResetPasswordPayload,
  SigninResponse,
  SignupPayload,
};
