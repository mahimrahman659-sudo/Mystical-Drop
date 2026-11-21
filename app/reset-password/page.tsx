import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { sanitizeReturnTo } from "@/lib/auth/return-to";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your TerraNova account.",
  robots: { index: false, follow: false },
};

type ResetPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const params = await searchParams;
  const token = value(params.token) || null;
  const returnTo = sanitizeReturnTo(value(params.returnTo));

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password."
      description="This reset link expires after one hour and can only be used once. Your cart is not affected."
    >
      <ResetPasswordForm token={token} returnTo={returnTo} />
    </AuthShell>
  );
}
