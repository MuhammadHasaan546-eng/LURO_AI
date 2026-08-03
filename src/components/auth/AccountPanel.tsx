"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { resendVerification } from "@/store/auth/slice/authSlice";
import { fetchAccount, mutateAccount } from "@/store/account/slice/accountSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function AccountPanel() {
  const dispatch = useAppDispatch();
  const { data, status, isRefreshing, error, mutationStatus, mutationKind } =
    useAppSelector((state) => state.account);
  const authLoading = useAppSelector(
    (state) => state.auth.status === "loading",
  );

  useEffect(() => {
    void dispatch(fetchAccount());
  }, [dispatch]);

  const action = async (payload: Parameters<typeof mutateAccount>[0]) => {
    const result = await dispatch(mutateAccount(payload));
    if (mutateAccount.fulfilled.match(result)) {
      toast.success(result.payload.message);
      if (result.payload.kind === "deleteAccount") location.href = "/";
      else void dispatch(fetchAccount({ force: true }));
      return true;
    }
    if (mutateAccount.rejected.match(result) && !result.meta.condition) {
      toast.error(result.payload?.message ?? "Unable to update your account.");
    }
    return false;
  };

  if (status === "loading" && !data) {
    return (
      <div role="status" aria-label="Loading account" className="space-y-6">
        <span className="sr-only">Loading account details…</span>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "failed" && !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center"
      >
        <p className="text-red-200">
          {error ?? "Unable to load your account."}
        </p>
        <button
          onClick={() => dispatch(fetchAccount({ force: true }))}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center text-gray-400">
        No account data is available.
      </div>
    );
  }

  const busy = mutationStatus === "loading";
  return (
    <div className="space-y-6" aria-busy={isRefreshing}>
      {isRefreshing && (
        <p role="status" className="sr-only">
          Refreshing account details…
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100"
        >
          {error}{" "}
          <button
            className="ml-2 underline"
            onClick={() => dispatch(fetchAccount({ force: true }))}
          >
            Retry
          </button>
        </div>
      )}
      {!data.user.emailVerified && (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
          <h2 className="font-medium text-amber-100">Verify your email</h2>
          <p className="mt-1 text-sm text-amber-100/70">
            Verification protects recovery and sensitive account changes.
          </p>
          <button
            disabled={authLoading}
            onClick={async () => {
              const result = await dispatch(resendVerification());
              if (resendVerification.fulfilled.match(result))
                toast.success(result.payload.message);
              else if (
                resendVerification.rejected.match(result) &&
                !result.meta.condition
              )
                toast.error(result.payload?.message);
            }}
            className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {authLoading ? "Sending…" : "Resend verification"}
          </button>
        </section>
      )}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium">Profile</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void action({
              kind: "profile",
              firstName: form.get("firstName"),
              lastName: form.get("lastName"),
            });
          }}
        >
          <input
            name="firstName"
            defaultValue={data.user.firstName}
            aria-label="First name"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
          />
          <input
            name="lastName"
            defaultValue={data.user.lastName}
            aria-label="Last name"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
          />
          <div className="text-sm text-gray-400 sm:col-span-2">
            {data.user.email}
          </div>
          <button
            disabled={busy}
            className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {busy && mutationKind === "profile" ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium">Sign-in methods</h2>
        <div className="mt-4 space-y-3">
          {data.user.hasPassword && (
            <div className="rounded-xl border border-white/10 p-3 text-sm">
              Email and password
            </div>
          )}
          {!data.user.hasPassword && data.user.identities.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-gray-400">
              No sign-in methods are available.
            </p>
          )}
          {data.user.identities.map((identity) => (
            <div
              key={identity.id}
              className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm"
            >
              <span className="capitalize">
                {identity.provider.toLowerCase()}{" "}
                {identity.email && `· ${identity.email}`}
              </span>
              <button
                disabled={busy}
                onClick={() =>
                  action({ kind: "removeProvider", id: identity.id })
                }
                className="text-red-300 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href="/api/auth/oauth/google?returnTo=/account"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm"
          >
            Link Google
          </Link>
          <Link
            href="/api/auth/oauth/apple?returnTo=/account"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm"
          >
            Link Apple
          </Link>
        </div>
        <form
          className="mt-5 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void action({
              kind: "password",
              currentPassword: form.get("currentPassword"),
              password: form.get("password"),
              confirmPassword: form.get("confirmPassword"),
            });
          }}
        >
          <h3 className="font-medium">
            {data.user.hasPassword ? "Change password" : "Set a password"}
          </h3>
          {data.user.hasPassword && (
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Current password"
              className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
            />
          )}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="New password (12+ characters)"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
          />
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3"
          />
          <button
            disabled={busy}
            className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {busy && mutationKind === "password"
              ? "Updating…"
              : "Update password"}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active sessions</h2>
          <button
            disabled={busy}
            onClick={() => action({ kind: "revokeOtherSessions" })}
            className="text-sm text-violet-300 disabled:opacity-50"
          >
            Revoke all others
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {data.sessions.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-gray-400">
              No active sessions were found.
            </p>
          )}
          {data.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm"
            >
              <div>
                <p>
                  {session.current
                    ? "This device"
                    : (session.userAgent ?? "Unknown device")}
                </p>
                <p className="text-xs text-gray-500">
                  Started {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <button
                  disabled={busy}
                  onClick={() =>
                    action({ kind: "revokeSession", id: session.id })
                  }
                  className="text-red-300 disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h2 className="font-medium text-red-200">Delete account</h2>
        <p className="mt-1 text-sm text-gray-400">
          Permanently deletes your account and authentication data.
        </p>
        <button
          disabled={busy}
          onClick={() => {
            if (
              confirm("Permanently delete your account? This cannot be undone.")
            )
              void action({ kind: "deleteAccount" });
          }}
          className="mt-3 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200 disabled:opacity-50"
        >
          {busy && mutationKind === "deleteAccount"
            ? "Deleting…"
            : "Delete my account"}
        </button>
      </section>
    </div>
  );
}
