"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { resetErrorMessage } from "@/lib/auth/errors";
import {
  AuthPasswordField,
  FormMessage,
  SubmitButton,
} from "@/components/auth/AuthFields";

export function ResetPasswordForm({
  token,
  returnTo,
}: {
  token: string | null;
  returnTo: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const pendingRef = useRef(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <FormMessage>
          This reset link is invalid, expired, or already used. Request a new
          password reset link.
        </FormMessage>
        <Link
          href={`/forgot-password${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="btn btn-primary w-full"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="space-y-4">
        <FormMessage tone="success">
          Your password has been updated. Sign in with the new password.
        </FormMessage>
        <Link
          href={`/login?reset=1${returnTo !== "/account" ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="btn btn-primary w-full"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const resetToken = token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setFormError(null);

    const next: typeof fieldErrors = {};
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    pendingRef.current = true;
    setPending(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: resetToken,
      });
      if (error) {
        setFormError(resetErrorMessage(error));
        pendingRef.current = false;
        setPending(false);
        return;
      }
      window.history.replaceState({}, "", `/reset-password${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`);
      setComplete(true);
      pendingRef.current = false;
      setPending(false);
    } catch {
      setFormError("We could not update the password. Please try again.");
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <FormMessage>{formError}</FormMessage> : null}
      <AuthPasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        error={fieldErrors.password}
        hint="At least 8 characters."
        required
      />
      <AuthPasswordField
        id="reset-confirm-password"
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        required
      />
      <SubmitButton pending={pending} pendingLabel="Updating password…">
        Update password
      </SubmitButton>
      <p className="text-center text-body-sm text-on-surface-variant">
        <Link
          href={`/forgot-password${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-primary underline underline-offset-2"
        >
          Request a new link
        </Link>
      </p>
    </form>
  );
}
