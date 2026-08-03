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
