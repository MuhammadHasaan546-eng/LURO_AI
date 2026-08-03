"use client";

import { useEffect } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmail } from "@/store/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const { status, data, error } = useAppSelector((state) => state.auth);
  const token =
    typeof location === "undefined"
      ? null
      : new URLSearchParams(location.search).get("token");

  useEffect(() => {
    void dispatch(verifyEmail(token));
  }, [dispatch, token]);

  return (
    <AuthShell>
      <div className="space-y-5 text-center text-white">
        <h1 className="text-2xl font-semibold">Email verification</h1>
        {status === "loading" && (
          <div role="status" className="animate-pulse text-sm text-gray-300">
            <span className="sr-only">Verifying your email…</span>
            <div className="mx-auto h-4 w-48 rounded bg-white/10" />
          </div>
        )}
        {status === "succeeded" && (
          <p role="status" className="text-sm text-emerald-300">
            {data?.message}
          </p>
        )}
        {status === "failed" && (
          <div role="alert" className="text-sm text-red-300">
            {error}
            <button
              onClick={() => dispatch(verifyEmail(token))}
              className="ml-2 underline"
            >
              Retry
            </button>
          </div>
        )}
        <Link
          href="/app"
          className="inline-block rounded-xl bg-white px-4 py-3 text-sm font-medium text-black"
        >
          Continue to Luro
        </Link>
      </div>
    </AuthShell>
  );
}
