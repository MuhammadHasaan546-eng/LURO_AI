import React from "react";
import { redirect } from "next/navigation";
import SignUpPage from "@/components/auth/Signup";
import LiquidChrome from "@/components/ui/LiquidChrome";
import { getCurrentSession } from "@/lib/auth";

const SignupPage = async () => {
  const session = await getCurrentSession();

  if (session) redirect("/app");

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.15]}
          speed={0.25}
          amplitude={0.4}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />
      </div>

      {/* 2. Optional Dark Backdrop Blur overlay to make form pop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 pointer-events-none" />

      {/* 3. Auth Form Floating on top */}
      <div className="relative z-20 w-full max-w-md px-4">
        <SignUpPage />
      </div>
    </main>
  );
};

export default SignupPage;
