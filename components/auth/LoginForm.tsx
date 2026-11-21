"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import {
  googleErrorMessage,
  isEmailNotVerified,
  isRateLimited,
  loginErrorMessage,
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
import {
  checkAuthEmailDelivery,
  useAuthEmailDelivery,
} from "@/lib/use-auth-email-delivery";

type LoginFormProps = {
  returnTo: string;
  googleEnabled: boolean;
  verified?: boolean;
  resetComplete?: boolean;
  oauthError?: string;
};

export function verificationCallback(returnTo: string): string {
  return `/login?verified=1&returnTo=${encodeURIComponent(returnTo)}`;
}

export function LoginForm({
  returnTo,
  googleEnabled,
  verified = false,
  resetComplete = false,
  oauthError,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [googleError] = useState<string | null>(() => googleErrorMessage(oauthError));
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const emailDelivery = useAuthEmailDelivery();

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) next.password = "Enter your password.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setFormError(null);
    setResendNote(null);
    if (!validate()) return;

    pendingRef.current = true;
    setPending(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: returnTo,
        rememberMe: true,
      });

      if (error) {
        setFormError(loginErrorMessage(error));
        if (isEmailNotVerified(error)) setUnverifiedEmail(email.trim());
        pendingRef.current = false;
        setPending(false);
        return;
      }

      window.location.assign(returnTo);
    } catch {
      setFormError("We could not reach the sign-in service. Please try again.");
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
            : "Google sign-in could not be started. Please try again.",
        );
        pendingRef.current = false;
        setGooglePending(false);
      }
    } catch {
      setFormError("Google sign-in could not be started. Please try again.");
      pendingRef.current = false;
      setGooglePending(false);
    }
  }

  async function resendVerification() {
    if (!unverifiedEmail || resending) return;
    setResending(true);
    setResendNote(null);
    try {
      if (!(await checkAuthEmailDelivery())) {
        setResendNote(
          "Account emails are temporarily unavailable. Please try again shortly.",
        );
        return;
      }
      const { error } = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: verificationCallback(returnTo),
      });
      setResendNote(
        error
          ? resendErrorMessage(error)
          : "If the account still needs verification, a new email has been requested.",
      );
    } catch {
      setResendNote("We could not send the email. Please try again in a moment.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {verified ? (
        <FormMessage tone="success">
          Email verified. Sign in to continue.
        </FormMessage>
      ) : null}
      {resetComplete ? (
        <FormMessage tone="success">
          Password updated. Sign in with your new password.
        </FormMessage>
      ) : null}
      {googleError ? <FormMessage>{googleError}</FormMessage> : null}
      {emailDelivery === "unavailable" ? (
        <FormMessage>
          Account emails are temporarily unavailable. Resend requests will not
          work until delivery is restored.
        </FormMessage>
      ) : null}
      {formError ? <FormMessage>{formError}</FormMessage> : null}
      {resendNote ? <FormMessage tone="info">{resendNote}</FormMessage> : null}

      <GoogleAuthButton enabled={googleEnabled} pending={googlePending} onClick={handleGoogle} />
      <AuthDivider />

      <AuthField
        id="login-email"
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
        id="login-password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        error={fieldErrors.password}
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/forgot-password${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-label-lg text-primary underline underline-offset-2"
        >
          Forgot password?
        </Link>
        <Link
          href={`/verify-email${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="text-label-sm text-on-surface-variant hover:text-on-surface"
        >
          Resend verification
        </Link>
      </div>

      {unverifiedEmail ? (
        <button
          type="button"
          onClick={resendVerification}
          disabled={resending}
          className="btn btn-soft w-full disabled:cursor-wait disabled:opacity-70"
        >
          {resending ? "Requesting email…" : "Resend verification email"}
        </button>
      ) : null}

      <SubmitButton pending={pending} disabled={googlePending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>

      <p className="text-center text-body-sm text-on-surface-variant">
        New to TerraNova?{" "}
        <Link
          href={`/register${returnTo !== "/account" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-medium text-primary underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
