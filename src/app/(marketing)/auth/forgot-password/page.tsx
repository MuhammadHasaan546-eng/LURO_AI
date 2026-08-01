import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
export default function ForgotPasswordPage() {
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
          action="/api/auth/forgot-password"
          method="post"
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
          <button className="w-full rounded-xl bg-white py-3 font-medium text-black">
            Send reset link
          </button>
        </form>
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
