import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { isDevelopmentMailboxEnabled } from "@/lib/dev-mailbox";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Resend the Mystical Drop account verification email.",
  robots: { index: false, follow: false },
};

type VerifyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

export default async function VerifyEmailPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const email = value(params.email) ?? "";
  const returnTo = sanitizeReturnTo(value(params.returnTo));

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Verify your email."
      description="Enter the address you registered with to request a fresh verification link. Links expire after one hour."
      showDevMailbox={isDevelopmentMailboxEnabled()}
    >
      <VerifyEmailForm initialEmail={email} returnTo={returnTo} />
    </AuthShell>
  );
}
