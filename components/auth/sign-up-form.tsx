"use client";

import { signInWithGoogleAction, signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { Logo } from "@/components/auth/logo";
import { GoogleGlyph } from "@/components/auth/google-glyph";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";


const fieldClass =
  "h-12 rounded-xl border-line bg-white pl-11 pr-4 text-[15px] text-ink shadow-none placeholder:text-ink-muted/70 focus-visible:border-brand focus-visible:ring-brand/25";

export function SignUpForm({ message }: { message: Message }) {
  const [showPassword, setShowPassword] = useState(false);

  if ("message" in message) {
    return (
      <div className="w-full rounded-[24px] border border-line bg-white p-8 text-ink shadow-[0_1px_2px_rgba(16,17,20,0.04),0_28px_64px_-28px_rgba(16,17,20,0.22)] sm:p-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <FormMessage message={message} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[24px] border border-line bg-white p-8 text-ink shadow-[0_1px_2px_rgba(16,17,20,0.04),0_28px_64px_-28px_rgba(16,17,20,0.22)] sm:p-10">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-7 text-[38px] font-extrabold leading-[1.05] tracking-display text-ink">
          Create your account
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
          Start building better financial habits with FinTrack.
        </p>
      </div>

      <form className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="fullName"
            className="text-[13px] font-semibold text-ink"
          >
            Full name
          </Label>
          <div className="relative">
            <User
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
            />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-[13px] font-semibold text-ink"
          >
            Email
          </Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-[13px] font-semibold text-ink"
          >
            Password
          </Label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              minLength={6}
              required
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>

        <SubmitButton
          formAction={signUpAction}
          pendingText="Creating account..."
          className="group mt-1 h-12 w-full rounded-xl bg-cta text-[15px] font-semibold text-white shadow-none transition-opacity hover:bg-cta hover:opacity-90 focus-visible:ring-cta"
        >
          <span className="flex items-center justify-center gap-2">
            Create account
            <ArrowRight
              strokeWidth={2.5}
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </SubmitButton>

        <FormMessage message={message} />
      </form>

      <div className="mt-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] text-ink-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGoogleAction} className="mt-5">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white text-[15px] font-medium text-ink transition-colors hover:bg-surface"
        >
          <GoogleGlyph />
          Continue with Google
        </button>
      </form>

      <p className="mt-7 text-center text-[15px] text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand-ink transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-muted">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="font-medium text-brand-ink hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-brand-ink hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
