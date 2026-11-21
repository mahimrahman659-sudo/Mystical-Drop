"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { isRateLimited } from "@/lib/auth/errors";
import {
  AuthField,
  FormMessage,
  SubmitButton,
} from "@/components/auth/AuthFields";

export function ForgotPasswordForm({ returnTo }: { returnTo: string }) {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setFormError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Enter the email address for your account.");
      return;
    }
    setFieldError(undefined);

    pendingRef.current = true;
    setPending(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });
      if (error && isRateLimited(error)) {
        setFormError(
          "Too many recovery requests. Please wait a minute and try again.",
        );
        pendingRef.current = false;
        setPending(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setFormError("We could not reach the recovery service. Please try again.");
      pendingRef.current = false;
      setPending(false);
      return;
    }
    pendingRef.current = false;
    setPending(false);
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <FormMessage tone="success">
          If an account exists for that email, a password reset link has been
          requested. The response is intentionally the same for every address.
        </FormMessage>
        <p className="text-body-sm leading-relaxed text-on-surface-variant">
          The link expires in one hour and can only be used once. Check your spam
          folder if it does not arrive.
        </p>
        <Link
          href={`/login${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="btn btn-primary w-full"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <FormMessage>{formError}</FormMessage> : null}
      <AuthField
        id="forgot-email"
        label="Email address"
        type="email"
        value={email}
        onChange={(value) => {
          setEmail(value);
          setFieldError(undefined);
        }}
        autoComplete="email"
        error={fieldError}
        placeholder="you@example.com"
        hint="We will send a single-use reset link if the account exists."
        required
      />
      <SubmitButton pending={pending} pendingLabel="Requesting link…">
        Send reset link
      </SubmitButton>
      <p className="text-center text-body-sm text-on-surface-variant">
        Remembered it?{" "}
        <Link
          href={`/login${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-primary underline underline-offset-2"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
