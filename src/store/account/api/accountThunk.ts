import { createAsyncThunk } from "@reduxjs/toolkit";

import { getApiError, type ApiError } from "@/store/api/index";
import {
  fetchAccountRequest,
  mutateAccountRequest,
  type Account,
  type Mutation,
  type MutationResponse,
} from "@/store/account/api/accountApi";

export type AccountStateShape = {
  data: Account | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isRefreshing: boolean;
  mutationStatus: "idle" | "loading" | "succeeded" | "failed";
  lastFetchedAt: number | null;
};

export const fetchAccount = createAsyncThunk<
  Account,
  { force?: boolean } | void,
  { state: { account: AccountStateShape }; rejectValue: ApiError }
>(
  "account/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountRequest();
    } catch (error) {
      return rejectWithValue({
        message: getApiError(error, "Unable to load your account."),
      });
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
    try {
      return await mutateAccountRequest(mutation);
    } catch (error) {
      return rejectWithValue({
        message: getApiError(error, "Unable to update your account."),
      });
    }
  },
  {
    condition: (_, { getState }) =>
      (getState() as { account: AccountStateShape }).account.mutationStatus !==
      "loading",
  },
);

export type { Account, Mutation, MutationResponse };
