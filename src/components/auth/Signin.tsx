"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SigninErrors = {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

type SigninResponse = SigninErrors & {
  message?: string;
};

const inputClassName =
  "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition backdrop-blur-md text-sm";

export const Signin = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<SigninErrors>({});
  const [loading, setLoading] = useState(false);

  const fieldErrors = (field: string) => errors.fieldErrors?.[field] ?? [];
  const formErrors = errors.formErrors ?? [];

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as SigninResponse;

      if (!response.ok) {
        const nextErrors: SigninErrors = {
          fieldErrors: data.fieldErrors,
          formErrors: data.formErrors,
        };

        if (!data.fieldErrors && !data.formErrors && data.message) {
          nextErrors.formErrors = [data.message];
        }

        setErrors(nextErrors);
        toast.error(data.message ?? "Unable to sign in.");
        return;
      }

      toast.success("Successfully logged in!");
      router.push("/app");
      router.refresh();
    } catch {
      const message = "Unable to sign in. Please try again.";
      setErrors({ formErrors: [message] });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-white space-y-6 text-center">
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
        <p className="text-sm text-gray-300/80">
          Sign in to continue to Luro.ai
        </p>
      </div>

      {formErrors.length > 0 && (
        <div
          role="alert"
          className="p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl text-sm backdrop-blur-sm text-left"
        >
          {formErrors.map((message, index) => (
            <p key={`${message}-${index}`}>{message}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
        <div>
          <label
            className="text-xs text-gray-300 mb-1 block font-medium"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            className={inputClassName}
            aria-invalid={fieldErrors("email").length > 0}
          />
          {fieldErrors("email").map((message) => (
            <p key={message} className="mt-1 text-xs text-red-300">
              {message}
            </p>
          ))}
        </div>

        <div>
          <label
            className="text-xs text-gray-300 mb-1 block font-medium"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            maxLength={1024}
            className={inputClassName}
            aria-invalid={fieldErrors("password").length > 0}
          />
          {fieldErrors("password").map((message) => (
            <p key={message} className="mt-1 text-xs text-red-300">
              {message}
            </p>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 shadow-lg text-sm"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="text-xs text-gray-400 pt-2">
        Don't have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-white underline underline-offset-4 hover:text-gray-200"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Signin;
