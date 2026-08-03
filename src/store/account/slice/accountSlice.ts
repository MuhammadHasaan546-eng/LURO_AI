import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAccount,
  mutateAccount,
  type Account,
  type Mutation,
} from "@/store/account/api/accountThunk";

export type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

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
export { fetchAccount, mutateAccount };
export default accountSlice.reducer;
