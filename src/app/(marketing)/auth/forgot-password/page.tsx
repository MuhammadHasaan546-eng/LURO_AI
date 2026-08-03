"use client";

import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { forgotPassword } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { status, data, error } = useAppSelector((state) => state.auth);
  const loading = status === "loading";

  return (
    <AuthShell>
      <div className="space-y-6 text-white">
        <div>
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email and we’ll send a secure reset link if an account
            exists.
          </p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void dispatch(forgotPassword(String(form.get("email") ?? "")));
          }}
        >
          <label className="block text-sm text-gray-300">
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3"
            />
          </label>
          <button
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-50"
          >
            <span aria-live="polite">
              {loading ? "Sending…" : "Send reset link"}
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
