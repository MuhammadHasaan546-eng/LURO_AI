import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { apiRequest, getApiError, type ApiError } from "@/store/api";
import type { RequestStatus } from "@/store/authSlice";

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

type Mutation =
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

type MutationResponse = { message: string; kind: Mutation["kind"] };

type AccountState = {
  data: Account | null;
  status: RequestStatus;
  isRefreshing: boolean;
  error: string | null;
  mutationStatus: RequestStatus;
  mutationKind: Mutation["kind"] | null;
  mutationMessage: string | null;
  mutationError: string | null;
  lastFetchedAt: number | null;
  currentRequestId: string | null;
};

const initialState: AccountState = {
  data: null,
  status: "idle",
  isRefreshing: false,
  error: null,
  mutationStatus: "idle",
  mutationKind: null,
  mutationMessage: null,
  mutationError: null,
  lastFetchedAt: null,
  currentRequestId: null,
};

const rejectError = (error: unknown, fallback: string): ApiError => ({
  message: getApiError(error, fallback),
});

export const fetchAccount = createAsyncThunk<
  Account,
  { force?: boolean } | void,
  { state: { account: AccountState }; rejectValue: ApiError }
>(
  "account/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest<Account>("/api/account");
    } catch (error) {
      return rejectWithValue(
        rejectError(error, "Unable to load your account."),
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      const state = getState().account;
      if (state.status === "loading" || state.isRefreshing) return false;
      return (
        Boolean(arg && arg.force) ||
        !state.lastFetchedAt ||
        Date.now() - state.lastFetchedAt > 30_000
      );
    },
  },
);

export const mutateAccount = createAsyncThunk<
  MutationResponse,
  Mutation,
  { rejectValue: ApiError }
>(
  "account/mutate",
  async (mutation, { rejectWithValue }) => {
    const config: Record<
      Mutation["kind"],
      { url: string; method: string; body?: unknown }
    > = {
      profile: { url: "/api/account", method: "PATCH", body: mutation },
      password: {
        url: "/api/account/password",
        method: "POST",
        body: mutation,
      },
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
        body: selected.body ? JSON.stringify(selected.body) : undefined,
      });
      return { ...response, kind: mutation.kind };
    } catch (error) {
      return rejectWithValue(
        rejectError(error, "Unable to update your account."),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { account: AccountState }).account.mutationStatus !==
      "loading",
  },
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearMutationState(state) {
      state.mutationStatus = "idle";
      state.mutationKind = null;
      state.mutationMessage = null;
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.error = null;
        if (state.data) state.isRefreshing = true;
        else state.status = "loading";
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = "succeeded";
        state.isRefreshing = false;
        state.currentRequestId = null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.status = state.data ? "succeeded" : "failed";
        state.isRefreshing = false;
        state.error = action.payload?.message ?? "Unable to load your account.";
        state.currentRequestId = null;
      })
      .addCase(mutateAccount.pending, (state, action) => {
        state.mutationStatus = "loading";
        state.mutationKind = action.meta.arg.kind;
        state.mutationMessage = null;
        state.mutationError = null;
      })
      .addCase(mutateAccount.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.mutationMessage = action.payload.message;
      })
      .addCase(mutateAccount.rejected, (state, action) => {
        if (action.meta.condition) return;
        state.mutationStatus = "failed";
        state.mutationError =
          action.payload?.message ?? "Unable to update your account.";
      });
  },
});

export const { clearMutationState } = accountSlice.actions;
export default accountSlice.reducer;
