"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email…");
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ data }) => setMessage(data.message))
      .catch(() => setMessage("Unable to verify your email."));
  }, []);
  return (
    <AuthShell>
      <div className="space-y-5 text-center text-white">
        <h1 className="text-2xl font-semibold">Email verification</h1>
        <p role="status" className="text-sm text-gray-300">
          {message}
        </p>
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
