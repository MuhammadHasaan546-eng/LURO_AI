"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { resetPassword } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const { status, data, error, fieldErrors } = useAppSelector(
    (state) => state.auth,
  );
  const loading = status === "loading";

  const submit = (form: HTMLFormElement) => {
    const values = new FormData(form);
    void dispatch(
      resetPassword({
        token: new URLSearchParams(location.search).get("token"),
        password: values.get("password"),
        confirmPassword: values.get("confirmPassword"),
      }),
    );
  };

  return (
    <AuthShell>
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-2xl font-semibold">Choose a new password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Use at least 12 characters and a password you do not reuse.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit(event.currentTarget);
          }}
        >
          <div>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="New password"
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3"
            />
            {fieldErrors.password?.map((message) => (
              <p key={message} className="mt-1 text-xs text-red-300">
                {message}
              </p>
            ))}
          </div>
          <div>
            <input
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Confirm password"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3"
            />
            {fieldErrors.confirmPassword?.map((message) => (
              <p key={message} className="mt-1 text-xs text-red-300">
                {message}
              </p>
            ))}
          </div>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-50"
          >
            <span aria-live="polite">
              {loading ? "Updating…" : "Update password"}
            </span>
          </button>
        </form>
        {status === "succeeded" && (
          <p role="status" className="text-sm text-emerald-300">
            {data?.message}
          </p>
        )}
        {status === "failed" && (
          <div role="alert" className="text-sm text-red-300">
            {error}
            <button
              onClick={() =>
                document.querySelector<HTMLFormElement>("form")?.requestSubmit()
              }
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        )}
        <Link
          href="/auth/signin"
          className="block text-center text-sm text-gray-400 underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
