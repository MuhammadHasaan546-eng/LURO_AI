import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { type ApiError } from "@/store/api/index";
import {
  forgotPassword,
  logout,
  resendVerification,
  resetPassword,
  signIn,
  signUp,
  verifyEmail,
} from "@/store/auth/api/authThunk";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type AuthResponse = ApiError & { message?: string };

type AuthState = {
  status: RequestStatus;
  operation: string | null;
  data: AuthResponse | null;
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
            payload?.message ??
            (thunk === signIn
              ? "Unable to sign in. Please try again."
              : (action.error.message ?? "Request failed."));
          state.fieldErrors = payload?.fieldErrors ?? {};
          state.formErrors = payload?.formErrors ?? [state.error];
          state.currentRequestId = null;
          state.lastCompletedAt = Date.now();
        });
    }
  },
});

export const { clearAuthRequest } = authSlice.actions;
export {
  signIn,
  signUp,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
export default authSlice.reducer;
