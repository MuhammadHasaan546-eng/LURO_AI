"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const AlreadyAuthenticatedRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    toast.info("You are already logged in. Redirecting to your dashboard.", {
      id: "already-authenticated",
    });
    router.replace("/app");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <p className="text-sm text-gray-300" role="status">
        Redirecting to your dashboard...
      </p>
    </main>
  );
};
