import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { googleIsConfigured } from "@/lib/auth/server";
import { isDevelopmentMailboxEnabled } from "@/lib/dev-mailbox";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Mystical Drop customer account.",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnTo = sanitizeReturnTo(value(params.returnTo));
  const user = await getSessionUser();
  if (user) redirect(returnTo);

  return (
    <AuthShell
      eyebrow="Customer account"
      title="Welcome back."
      description="Sign in to keep your order history together. Your cart and favorites stay on this device."
      showDevMailbox={isDevelopmentMailboxEnabled()}
      belowCard={
        <p className="text-center text-body-sm text-on-surface-variant">
          Prefer to browse without an account?{" "}
          <Link
            href="/checkout"
            className="font-medium text-primary underline underline-offset-2"
          >
            Guest checkout
          </Link>{" "}
          is still available.
        </p>
      }
    >
      <LoginForm
        returnTo={returnTo}
        googleEnabled={googleIsConfigured()}
        verified={value(params.verified) === "1"}
        resetComplete={value(params.reset) === "1"}
        oauthError={value(params.error)}
      />
    </AuthShell>
  );
}
