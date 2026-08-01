"use client";

import React from "react";
import Signin from "@/components/auth/Signin";
import LiquidChrome from "@/components/ui/LiquidChrome";

const SigninPage = () => {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* 1. Animated Liquid Chrome Background */}
      <div className="absolute inset-0 z-0">
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.15]} // Dark sleek theme matching modern dark UI
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
        <Signin />
      </div>
    </main>
  );
};

export default SigninPage;
