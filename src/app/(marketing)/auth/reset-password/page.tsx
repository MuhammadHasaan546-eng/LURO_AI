"use client";
import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
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
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const token = new URLSearchParams(location.search).get("token");
            const r = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                token,
                password: f.get("password"),
                confirmPassword: f.get("confirmPassword"),
              }),
            });
            const d = await r.json();
            setMessage(d.message);
          }}
        >
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="New password"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3"
          />
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Confirm password"
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3"
          />
          <button className="w-full rounded-xl bg-white py-3 font-medium text-black">
            Update password
          </button>
        </form>
        {message && (
          <p role="status" className="text-sm text-gray-300">
            {message}
          </p>
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
