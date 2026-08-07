"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LoaderCircle, AlertCircle, RefreshCw } from "lucide-react";

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
    let request: { abort: () => void } | null = null;
    const task = window.setTimeout(() => {
      request = dispatch(fetchAccount());
    }, 0);

    return () => {
      window.clearTimeout(task);
      request?.abort();
    };
  }, [dispatch]);

  const action = async (payload: Parameters<typeof mutateAccount>[0]) => {
    const result = await dispatch(mutateAccount(payload));
    if (mutateAccount.fulfilled.match(result)) {
      toast.success(result.payload?.message ?? "Success!");
      if (result.payload?.kind === "deleteAccount") location.href = "/";
      else void dispatch(fetchAccount({ force: true }));
      return true;
    }
    if (mutateAccount.rejected.match(result) && !result.meta.condition) {
      const payloadError = result.payload as { message?: string } | undefined;
      toast.error(payloadError?.message ?? result.error?.message ?? "Unable to update your account.");
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
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4"
          >
            <Skeleton className="h-6 w-40 bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-2/3 bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "failed" && !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center space-y-4 backdrop-blur"
      >
        <div className="flex justify-center text-red-400">
          <AlertCircle className="size-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-red-200">The request could not be completed</h3>
          <p className="text-sm text-red-300/80 max-w-md mx-auto">
            {error ?? "Unable to load your account details from the server."}
          </p>
        </div>
        <button
          onClick={() => void dispatch(fetchAccount({ force: true }))}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 transition-all shadow-lg"
        >
          <RefreshCw className="size-4" />
          Retry Request
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-gray-400 backdrop-blur">
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
          className="flex items-center justify-between rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100"
        >
          <span>{error}</span>
          <button
            className="underline font-semibold hover:text-amber-200 ml-4 shrink-0"
            onClick={() => void dispatch(fetchAccount({ force: true }))}
          >
            Retry
          </button>
        </div>
      )}
      {!data.user.emailVerified && (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5 backdrop-blur">
          <h2 className="font-medium text-amber-100">Verify your email</h2>
          <p className="mt-1 text-sm text-amber-100/70">
            Verification protects recovery and sensitive account changes.
          </p>
          <button
            disabled={authLoading}
            onClick={async () => {
              const result = await dispatch(resendVerification());
              if (resendVerification.fulfilled.match(result))
                toast.success(result.payload?.message ?? "Verification email sent!");
              else if (
                resendVerification.rejected.match(result) &&
                !result.meta.condition
              ) {
                const errPayload = result.payload as { message?: string } | undefined;
                toast.error(errPayload?.message ?? "Failed to send verification.");
              }
            }}
            className="mt-3 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-black disabled:opacity-50 hover:bg-white transition-all"
          >
            {authLoading ? "Sending…" : "Resend verification"}
          </button>
        </section>
      )}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
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
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground"
          />
          <input
            name="lastName"
            defaultValue={data.user.lastName}
            aria-label="Last name"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground"
          />
          <div className="text-sm text-muted-foreground sm:col-span-2 pt-1">
            {data.user.email}
          </div>
          <button
            disabled={busy}
            className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50 hover:bg-white/90 transition-all"
          >
            {busy && mutationKind === "profile" ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
        <h2 className="text-lg font-medium">Sign-in methods</h2>
        <div className="mt-4 space-y-3">
          {data.user.hasPassword && (
            <div className="rounded-xl border border-white/10 p-3 text-sm bg-white/[0.01]">
              Email and password
            </div>
          )}
          {!data.user.hasPassword && data.user.identities.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
              No sign-in methods are available.
            </p>
          )}
          {data.user.identities.map((identity) => (
            <div
              key={identity.id}
              className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm bg-white/[0.01]"
            >
              <span className="capitalize">
                {identity.provider.toLowerCase()}{" "}
                {identity.email && `· ${identity.email}`}
              </span>
              <button
                disabled={busy}
                onClick={() =>
                  void action({ kind: "removeProvider", id: identity.id })
                }
                className="text-red-300 hover:text-red-200 disabled:opacity-50 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            prefetch={false}
            href="/api/auth/oauth/google?returnTo=/account"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition-all"
          >
            Link Google
          </Link>
          <Link
            prefetch={false}
            href="/api/auth/oauth/apple?returnTo=/account"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition-all"
          >
            Link Apple
          </Link>
        </div>
        <form
          className="mt-6 grid gap-3 pt-4 border-t border-white/10"
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
              className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground"
            />
          )}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="New password (12+ characters)"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground"
          />
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-foreground"
          />
          <button
            disabled={busy}
            className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50 hover:bg-white/90 transition-all mt-1"
          >
            {busy && mutationKind === "password"
              ? "Updating…"
              : "Update password"}
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active sessions</h2>
          <button
            disabled={busy}
            onClick={() => void action({ kind: "revokeOtherSessions" })}
            className="text-sm text-violet-300 hover:text-violet-200 disabled:opacity-50 font-medium"
          >
            Revoke all others
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {data.sessions.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-muted-foreground">
              No active sessions were found.
            </p>
          )}
          {data.sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm bg-white/[0.01]"
            >
              <div>
                <p className="font-medium">
                  {session.current
                    ? "This device"
                    : (session.userAgent ?? "Unknown device")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Started {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <button
                  disabled={busy}
                  onClick={() =>
                    void action({ kind: "revokeSession", id: session.id })
                  }
                  className="text-red-300 hover:text-red-200 disabled:opacity-50 font-medium"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 backdrop-blur">
        <h2 className="font-medium text-red-200">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
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
          className="mt-3 rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-200 disabled:opacity-50 hover:bg-red-500/10 transition-all font-medium"
        >
          {busy && mutationKind === "deleteAccount"
            ? "Deleting…"
            : "Delete my account"}
        </button>
      </section>
    </div>
  );
}