"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { isRateLimited, resendErrorMessage } from "@/lib/auth/errors";
import {
  AuthField,
  FormMessage,
  SubmitButton,
} from "@/components/auth/AuthFields";
import {
  checkAuthEmailDelivery,
  useAuthEmailDelivery,
} from "@/lib/use-auth-email-delivery";

export function VerifyEmailForm({
  initialEmail,
  returnTo,
}: {
  initialEmail: string;
  returnTo: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const emailDelivery = useAuthEmailDelivery();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setFormError(null);
    setNote(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldError("Enter the email address you registered with.");
      return;
    }
    setFieldError(undefined);
    setPending(true);
    try {
      if (!(await checkAuthEmailDelivery())) {
        setFormError(
          "Account emails are temporarily unavailable. Please try again shortly.",
        );
        return;
      }
      const { error } = await authClient.sendVerificationEmail({
        email: email.trim(),
        callbackURL: `/login?verified=1&returnTo=${encodeURIComponent(returnTo)}`,
      });
      if (error && isRateLimited(error)) {
        setFormError("Too many requests. Please wait a minute and try again.");
      } else if (error) {
        setFormError(resendErrorMessage(error));
      } else {
        setNote(
          "If the account still needs verification, a new email has been requested. The link expires in one hour.",
        );
      }
    } catch {
      setFormError("We could not reach the email service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {emailDelivery === "unavailable" ? (
        <FormMessage>
          Account emails are temporarily unavailable. Please try again shortly.
        </FormMessage>
      ) : null}
      {formError ? <FormMessage>{formError}</FormMessage> : null}
      {note ? <FormMessage tone="success">{note}</FormMessage> : null}
      <AuthField
        id="verify-email"
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
        hint="We will only respond with a generic confirmation to protect account privacy."
        required
      />
      <SubmitButton pending={pending} pendingLabel="Requesting email…">
        Resend verification email
      </SubmitButton>
      <p className="text-center text-body-sm text-on-surface-variant">
        Already verified?{" "}
        <Link
          href={`/login${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-primary underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
