import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSessionUser } from "@/lib/auth/session";
import { sanitizeReturnTo } from "@/lib/auth/return-to";
import { googleIsConfigured } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a TerraNova customer account.",
};

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const returnTo = sanitizeReturnTo(value(params.returnTo));
  const user = await getSessionUser();
  if (user) redirect(returnTo);

  return (
    <AuthShell
      eyebrow="Customer account"
      title="Create your account."
      description="A quiet place for your fountain orders, delivery details, and care notes. Email verification keeps your account secure."
      showDevMailbox={
        process.env.NODE_ENV !== "production" ||
        process.env.DEV_MAILBOX_ENABLED === "1"
      }
    >
      <RegisterForm
        returnTo={returnTo}
        googleEnabled={googleIsConfigured()}
      />
    </AuthShell>
  );
}
