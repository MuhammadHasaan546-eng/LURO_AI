"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Account = {
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
const csrf = () =>
  document.cookie
    .split("; ")
    .find((v) => v.startsWith("luro_csrf="))
    ?.split("=")[1] ?? "";
const request = (url: string, init: RequestInit = {}) =>
  fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrf(),
      ...init.headers,
    },
  });

export default function AccountPanel() {
  const [data, setData] = useState<Account | null>(null);
  const load = () =>
    fetch("/api/account")
      .then((r) => r.json())
      .then(setData);
  useEffect(() => {
    void load();
  }, []);
  const action = async (url: string, method: string, body?: unknown) => {
    const response = await request(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    response.ok ? toast.success(result.message) : toast.error(result.message);
    if (response.ok) await load();
    return response.ok;
  };
  if (!data)
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
        Loading account…
      </div>
    );
  return (
    <div className="space-y-6">
      {!data.user.emailVerified && (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
          <h2 className="font-medium text-amber-100">Verify your email</h2>
          <p className="mt-1 text-sm text-amber-100/70">
            Verification protects recovery and sensitive account changes.
          </p>
          <button
            onClick={() => action("/api/auth/resend-verification", "POST")}
            className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-black"
          >
            Resend verification
          </button>
        </section>
      )}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-medium">Profile</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void action("/api/account", "PATCH", {
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
          <button className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Save profile
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
          {data.user.identities.map((id) => (
            <div
              key={id.id}
              className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm"
            >
              <span className="capitalize">
                {id.provider.toLowerCase()} {id.email && `· ${id.email}`}
              </span>
              <button
                onClick={() =>
                  action(`/api/account/providers/${id.id}`, "DELETE")
                }
                className="text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <a
            href="/api/auth/oauth/google?returnTo=/account"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm"
          >
            Link Google
          </a>
          <a
            href="/api/auth/oauth/apple?returnTo=/account"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm"
          >
            Link Apple
          </a>
        </div>
        <form
          className="mt-5 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void action("/api/account/password", "POST", {
              currentPassword: f.get("currentPassword"),
              password: f.get("password"),
              confirmPassword: f.get("confirmPassword"),
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
          <button className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Update password
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Active sessions</h2>
          <button
            onClick={() => action("/api/account/security", "POST")}
            className="text-sm text-violet-300"
          >
            Revoke all others
          </button>
        </div>
        <div className="mt-4 space-y-3">
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
                  onClick={() =>
                    action(`/api/account/sessions/${session.id}`, "DELETE")
                  }
                  className="text-red-300"
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
          onClick={async () => {
            if (
              confirm("Permanently delete your account? This cannot be undone.")
            ) {
              if (await action("/api/account/security", "DELETE"))
                location.href = "/";
            }
          }}
          className="mt-3 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-200"
        >
          Delete my account
        </button>
      </section>
    </div>
  );
}
