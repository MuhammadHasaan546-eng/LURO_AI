"use client";

import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import Image from "next/image";
import { toast } from "sonner";

export const Signin = () => {
  const { isLoaded, signIn, setActive }: any = useSignIn();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Social OAuth Login (Google & Apple)
  const handleSocialAuth = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "OAuth authentication failed";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // 2. Direct Email Continue Flow (Passwordless Initiator)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setLoading(true);

    try {
      // Direct Email Attempt
      const result = await signIn.create({
        identifier: email,
      });

      // Simple handling if account directly authenticates (or redirect for verification)
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Successfully logged in!");
      } else {
        toast.info("Verification code sent to your email!");
        // Yahan aap verification step / OTP input screen show karwa sakte hain
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "Failed to continue with email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-white space-y-6 text-center">
      {/* Header Branding */}
      <div className="space-y-2">
        <div className="flex justify-center mb-3">
          <Image
            src="/icons/logo-dark.png"
            alt="Luro Logo"
            width={44}
            height={44}
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Login to Luro</h1>
        <p className="text-sm text-gray-300/80">Choose a method to login</p>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl text-sm backdrop-blur-sm">
          {error}
        </div>
      )}

      {!showEmailForm ? (
        <div className="space-y-3">
          {/* Google Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialAuth("oauth_google")}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium py-3 px-4 rounded-xl transition duration-200 backdrop-blur-md disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.8 6.3C.7 8.5 0 10.9 0 13.5s.7 5 1.8 7.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 16c1.9 3.7 5.7 7 10.2 7z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Apple Button */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSocialAuth("oauth_apple")}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium py-3 px-4 rounded-xl transition duration-200 backdrop-blur-md disabled:opacity-50"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.31c.65-.79 1.09-1.89.97-2.99-.94.04-2.08.63-2.75 1.42-.58.67-1.1 1.77-.96 2.84 1.05.08 2.11-.51 2.74-1.27z" />
            </svg>
            Continue with Apple
          </button>

          {/* Email Option Toggle Button */}
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium py-3 px-4 rounded-xl transition duration-200 backdrop-blur-md"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Continue with email
          </button>
        </div>
      ) : (
        /* Direct Email Form View */
        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          <div>
            <label className="text-xs text-gray-300 mb-1 block font-medium">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition backdrop-blur-md text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 shadow-lg text-sm"
          >
            {loading ? "Continuing..." : "Continue with email"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEmailForm(false);
              setError("");
            }}
            className="w-full text-center text-sm text-gray-300 hover:text-white transition pt-1 block"
          >
            ← Back to options
          </button>
        </form>
      )}
    </div>
  );
};

export default Signin;
