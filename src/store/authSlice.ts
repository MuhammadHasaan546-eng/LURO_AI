import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { apiRequest, getApiError, type ApiError } from "@/store/api";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type AuthResponse = ApiError & { message?: string };
type SigninResponse = AuthResponse & {
  code?: "ALREADY_AUTHENTICATED";
  redirectTo?: string;
};
type Credentials = { email: string; password: string };
type SignupPayload = Credentials & {
  firstName: string;
  lastName: string;
  confirmPassword: string;
};
type ResetPasswordPayload = {
  token: string | null;
  password: FormDataEntryValue | null;
  confirmPassword: FormDataEntryValue | null;
};

type AuthState = {
  status: RequestStatus;
  operation: string | null;
  data: AuthResponse | SigninResponse | null;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
  currentRequestId: string | null;
  lastCompletedAt: number | null;
};

const initialState: AuthState = {
  status: "idle",
  operation: null,
  data: null,
  error: null,
  fieldErrors: {},
  formErrors: [],
  currentRequestId: null,
  lastCompletedAt: null,
};

const rejectApiError = (error: unknown, fallback: string) => {
  const apiError = (
    typeof error === "object" && error ? error : {}
  ) as ApiError;
  return {
    ...apiError,
    message: getApiError(error, fallback),
  };
};

export const signIn = createAsyncThunk<
  SigninResponse,
  Credentials,
  { rejectValue: ApiError }
>(
  "auth/signIn",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<SigninResponse>("/api/auth/signin", {
        method: "POST",
        data: payload,
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to sign in. Please try again."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const signUp = createAsyncThunk<
  AuthResponse,
  SignupPayload,
  { rejectValue: ApiError }
>(
  "auth/signUp",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        data: payload,
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(
          error,
          "Unable to create your account. Please try again.",
        ),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const logout = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: ApiError }
>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to log out. Please try again."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const forgotPassword = createAsyncThunk<
  AuthResponse,
  string,
  { rejectValue: ApiError }
>(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/forgot-password", {
        method: "POST",
        data: { email },
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to request a reset link."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const resetPassword = createAsyncThunk<
  AuthResponse,
  ResetPasswordPayload,
  { rejectValue: ApiError }
>(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/reset-password", {
        method: "POST",
        data: payload,
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to update your password."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const verifyEmail = createAsyncThunk<
  AuthResponse,
  string | null,
  { rejectValue: ApiError }
>(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/verify-email", {
        method: "POST",
        data: { token },
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to verify your email."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

export const resendVerification = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: ApiError }
>(
  "auth/resendVerification",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest<AuthResponse>("/api/auth/resend-verification", {
        method: "POST",
      });
    } catch (error) {
      return rejectWithValue(
        rejectApiError(error, "Unable to resend verification."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.status !== "loading",
  },
);

const thunks = [
  signIn,
  signUp,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
] as const;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthRequest(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    for (const thunk of thunks) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.status = "loading";
          state.operation = action.type.split("/")[1];
          state.error = null;
          state.fieldErrors = {};
          state.formErrors = [];
          state.currentRequestId = action.meta.requestId;
        })
        .addCase(
          thunk.fulfilled,
          (state, action: PayloadAction<AuthResponse>) => {
            state.status = "succeeded";
            state.data = action.payload;
            state.error = null;
            state.currentRequestId = null;
            state.lastCompletedAt = Date.now();
          },
        )
        .addCase(thunk.rejected, (state, action) => {
          if (action.meta.condition) return;
          const payload = action.payload as ApiError | undefined;
          state.status = "failed";
          state.error =
            payload?.message ?? action.error.message ?? "Request failed.";
          state.fieldErrors = payload?.fieldErrors ?? {};
          state.formErrors = payload?.formErrors ?? [state.error];
          state.currentRequestId = null;
          state.lastCompletedAt = Date.now();
        });
    }
  },
});

export const { clearAuthRequest } = authSlice.actions;
export default authSlice.reducer;
