import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import AccountPanel from "@/components/auth/AccountPanel";

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/signin?returnTo=/account");
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-24 text-white sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-violet-300">Account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Manage your sign-in
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Update your profile, security, and active sessions.
            </p>
          </div>
          <Link
            href="/app"
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Back to app
          </Link>
        </div>
        <AccountPanel />
      </div>
    </main>
  );
}
