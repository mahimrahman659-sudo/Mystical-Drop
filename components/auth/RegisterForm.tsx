"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import {
  isRateLimited,
  registerErrorMessage,
  resendErrorMessage,
} from "@/lib/auth/errors";
import {
  AuthDivider,
  AuthField,
  AuthPasswordField,
  FormMessage,
  GoogleAuthButton,
  SubmitButton,
} from "@/components/auth/AuthFields";
import { verificationCallback } from "@/components/auth/LoginForm";

type RegisterFormProps = {
  returnTo: string;
  googleEnabled: boolean;
};

export function RegisterForm({ returnTo, googleEnabled }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const pendingRef = useRef(false);

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    else if (name.trim().length > 80) next.name = "Keep your name under 80 characters.";
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setFormError(null);
    if (!validate()) return;

    pendingRef.current = true;
    setPending(true);
    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: verificationCallback(returnTo),
      });

      if (error) {
        setFormError(registerErrorMessage(error));
        pendingRef.current = false;
        setPending(false);
        return;
      }

      setSuccessEmail(email.trim());
      setPending(false);
      pendingRef.current = false;
    } catch {
      setFormError("We could not reach the account service. Please try again.");
      pendingRef.current = false;
      setPending(false);
    }
  }

  async function handleGoogle() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setGooglePending(true);
    setFormError(null);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: returnTo,
        newUserCallbackURL: returnTo,
        errorCallbackURL: `/login?returnTo=${encodeURIComponent(returnTo)}`,
      });
      if (error) {
        setFormError(
          isRateLimited(error)
            ? "Too many attempts. Please wait a minute and try again."
            : "Google sign-up could not be started. Please try again.",
        );
        pendingRef.current = false;
        setGooglePending(false);
      }
    } catch {
      setFormError("Google sign-up could not be started. Please try again.");
      pendingRef.current = false;
      setGooglePending(false);
    }
  }

  async function resendVerification() {
    if (!successEmail || resending) return;
    setResending(true);
    setResendNote(null);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: successEmail,
        callbackURL: verificationCallback(returnTo),
      });
      setResendNote(
        error
          ? resendErrorMessage(error)
          : "A new verification email has been requested.",
      );
    } catch {
      setResendNote("We could not send the email. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  }

  if (successEmail) {
    return (
      <div className="space-y-4">
        <FormMessage tone="success">
          Check your inbox. We sent a verification link to{" "}
          <strong className="break-all">{successEmail}</strong>. Verify the
          address, then sign in.
        </FormMessage>
        <p className="text-body-sm leading-relaxed text-on-surface-variant">
          The link expires in one hour. If it does not arrive, check your spam
          folder or request another email.
        </p>
        {resendNote ? (
          <FormMessage tone={resendNote.includes("could not") ? "error" : "info"}>
            {resendNote}
          </FormMessage>
        ) : null}
        <button
          type="button"
          onClick={resendVerification}
          disabled={resending}
          className="btn btn-soft w-full disabled:cursor-wait disabled:opacity-70"
        >
          {resending ? "Requesting email…" : "Resend verification email"}
        </button>
        <Link
          href={`/login${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="btn btn-primary w-full"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError ? <FormMessage>{formError}</FormMessage> : null}

      <GoogleAuthButton enabled={googleEnabled} pending={googlePending} onClick={handleGoogle} />
      <AuthDivider />

      <AuthField
        id="register-name"
        label="Full name"
        value={name}
        onChange={setName}
        autoComplete="name"
        error={fieldErrors.name}
        placeholder="Your full name"
        required
      />
      <AuthField
        id="register-email"
        label="Email address"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        error={fieldErrors.email}
        placeholder="you@example.com"
        required
      />
      <AuthPasswordField
        id="register-password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        error={fieldErrors.password}
        hint="At least 8 characters."
        required
      />
      <AuthPasswordField
        id="register-confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        required
      />

      <SubmitButton pending={pending} disabled={googlePending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-center text-body-sm text-on-surface-variant">
        Already have an account?{" "}
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
