import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { isDevelopmentMailboxEnabled } from "@/lib/dev-mailbox";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a single-use TerraNova password reset link.",
};

type ForgotPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPageProps) {
  const params = await searchParams;
  const returnTo = sanitizeReturnTo(value(params.returnTo));

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      description="Enter your account email and we will request a single-use link. The response is the same whether or not an account exists."
      showDevMailbox={isDevelopmentMailboxEnabled()}
    >
      <ForgotPasswordForm returnTo={returnTo} />
    </AuthShell>
  );
}
