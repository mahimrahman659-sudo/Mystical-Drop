import Link from "next/link";
import { LockIcon } from "@/components/ui/icons";

export function AdminAccessDenied({ email }: { email?: string }) {
  return (
    <section className="site-container py-space-xl">
      <div className="mx-auto max-w-xl rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
          <LockIcon size={26} />
        </span>
        <p className="mt-4 text-label-sm uppercase tracking-widest text-primary">
          Admin access required
        </p>
        <h1 className="mt-1 font-display text-headline-md text-on-surface">
          This area is restricted
        </h1>
        <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">
          {email ? (
            <>
              The signed-in account <strong>{email}</strong> is a customer account
              and cannot read or change admin data.
            </>
          ) : (
            "This account cannot read or change admin data."
          )}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/account" className="btn btn-primary">
            Go to your account
          </Link>
          <Link href="/" className="btn btn-outline">
            Return to store
          </Link>
        </div>
      </div>
    </section>
  );
}
