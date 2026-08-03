"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { clearAuthRequest, signUp } from "@/store/auth/slice/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

const inputClassName =
  "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition backdrop-blur-md text-sm";

export const SignUpPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error, fieldErrors, formErrors } = useAppSelector(
    (state) => state.auth,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const loading = status === "loading";
  useEffect(
    () => () => {
      dispatch(clearAuthRequest());
    },
    [dispatch],
  );
  const fieldErrorList = (field: string) => fieldErrors[field] ?? [];

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await dispatch(
      signUp({
        firstName,
        lastName,
        email,
        password,
        confirmPassword: passwordConfirmation,
      }),
    );
    if (signUp.fulfilled.match(result)) {
      toast.success(result.payload.message ?? "Account created successfully!");
      router.push("/app");
      router.refresh();
    } else if (signUp.rejected.match(result) && !result.meta.condition) {
      toast.error(result.payload?.message ?? "Unable to create your account.");
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

      {(formErrors.length > 0 || error) && (
        <div
          role="alert"
          className="p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl text-sm backdrop-blur-sm text-left"
        >
          {(formErrors.length ? formErrors : [error!]).map((message, index) => (
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
              aria-invalid={fieldErrorList("firstName").length > 0}
            />
            {fieldErrorList("firstName").map((message) => (
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
              aria-invalid={fieldErrorList("lastName").length > 0}
            />
            {fieldErrorList("lastName").map((message) => (
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
            aria-invalid={fieldErrorList("email").length > 0}
          />
          {fieldErrorList("email").map((message) => (
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              autoComplete="new-password"
              maxLength={1024}
              className={`${inputClassName} pr-11`}
              aria-invalid={fieldErrorList("password").length > 0}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          {fieldErrorList("password").map((message) => (
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
          <div className="relative">
            <input
              id="passwordConfirmation"
              type={showPasswordConfirmation ? "text" : "password"}
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              maxLength={1024}
              className={`${inputClassName} pr-11`}
              aria-invalid={fieldErrorList("confirmPassword").length > 0}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation((visible) => !visible)}
              aria-label={
                showPasswordConfirmation
                  ? "Hide password confirmation"
                  : "Show password confirmation"
              }
              aria-pressed={showPasswordConfirmation}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              {showPasswordConfirmation ? (
                <EyeOff aria-hidden="true" className="size-4" />
              ) : (
                <Eye aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
          {fieldErrorList("confirmPassword").map((message) => (
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
          <span aria-live="polite">
            {loading ? "Creating account..." : "Create account"}
          </span>
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-white/10" />
        or sign up with
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/api/auth/oauth/google"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10 transition duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Link>
        <Link
          href="/api/auth/oauth/apple"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm font-medium hover:bg-white/10 transition duration-200"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.16-1.9-14.49-6.08-3.32-2.62-7.23-7.22-11.73-13.8-6.86-9.84-12.22-20.73-16.08-32.68-3.86-11.94-5.79-23.27-5.79-33.99 0-14.28 3.58-25.86 10.74-34.73 7.16-8.87 16.12-13.39 26.88-13.56 4.7 0 9.87 1.18 15.51 3.55 5.64 2.37 9.42 3.56 11.34 3.56 1.55 0 5.48-1.25 11.79-3.75 6.31-2.5 11.69-3.61 16.14-3.33 12.01.63 21.43 4.96 28.26 12.99-10.75 6.47-16.02 15.43-15.81 26.87.21 9.03 3.63 16.63 10.26 22.8 6.63 6.17 14.61 9.77 23.94 10.8-2.3 6.82-5.35 13.62-9.15 20.4zM119.22 31.84c0-6.79 2.45-13.43 7.35-19.92 4.9-6.49 11.16-10.59 18.78-12.3 1.07 7.02-.97 13.78-6.12 20.28-5.15 6.5-11.45 10.63-18.9 12.39-.23-.15-.53-.24-.91-.28-.13-.08-.2-.13-.2-.17z" />
          </svg>
          Apple
        </Link>
      </div>

      <div className="text-xs text-gray-400 pt-2">
        {"Already have an account?"}{" "}
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
