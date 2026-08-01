"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type SignupErrors = {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

type SignupResponse = SignupErrors & {
  message?: string;
};

const inputClassName =
  "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition backdrop-blur-md text-sm";

export const SignUpPage = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  const getFieldErrors = (field: string) => errors.fieldErrors?.[field] ?? [];
  const formErrors = errors.formErrors ?? [];

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          passwordConfirmation,
        }),
      });

      const data = (await response.json()) as SignupResponse;

      if (!response.ok) {
        const nextErrors: SignupErrors = {
          fieldErrors: data.fieldErrors,
          formErrors: data.formErrors,
        };

        if (!data.fieldErrors && !data.formErrors && data.message) {
          nextErrors.formErrors = [data.message];
        }

        setErrors(nextErrors);
        toast.error(data.message ?? "Unable to create your account.");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/app");
      router.refresh();
    } catch {
      const message = "Unable to create your account. Please try again.";
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your Luro account
        </h1>
        <p className="text-sm text-gray-300/80">
          Start your journey with Luro.ai
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

      <form onSubmit={handleEmailSignUp} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-xs text-gray-300 mb-1 block font-medium"
              htmlFor="firstName"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              autoComplete="given-name"
              className={inputClassName}
              aria-invalid={getFieldErrors("firstName").length > 0}
            />
            {getFieldErrors("firstName").map((message) => (
              <p key={message} className="mt-1 text-xs text-red-300">
                {message}
              </p>
            ))}
          </div>

          <div>
            <label
              className="text-xs text-gray-300 mb-1 block font-medium"
              htmlFor="lastName"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              autoComplete="family-name"
              className={inputClassName}
              aria-invalid={getFieldErrors("lastName").length > 0}
            />
            {getFieldErrors("lastName").map((message) => (
              <p key={message} className="mt-1 text-xs text-red-300">
                {message}
              </p>
            ))}
          </div>
        </div>

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
            aria-invalid={getFieldErrors("email").length > 0}
          />
          {getFieldErrors("email").map((message) => (
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
            placeholder="Create a secure password"
            autoComplete="new-password"
            maxLength={1024}
            className={inputClassName}
            aria-invalid={getFieldErrors("password").length > 0}
          />
          {getFieldErrors("password").map((message) => (
            <p key={message} className="mt-1 text-xs text-red-300">
              {message}
            </p>
          ))}
        </div>

        <div>
          <label
            className="text-xs text-gray-300 mb-1 block font-medium"
            htmlFor="passwordConfirmation"
          >
            Confirm password
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            maxLength={1024}
            className={inputClassName}
            aria-invalid={getFieldErrors("passwordConfirmation").length > 0}
          />
          {getFieldErrors("passwordConfirmation").map((message) => (
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="text-xs text-gray-400 pt-2">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="text-white underline underline-offset-4 hover:text-gray-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;
