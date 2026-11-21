import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { formatOrderDate } from "@/lib/orders";
import { isDevelopmentMailboxEnabled } from "@/lib/dev-mailbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local email inbox",
  robots: { index: false, follow: false },
};

type DevMail = {
  _id: unknown;
  to: string;
  subject: string;
  text: string;
  kind: string;
  createdAt: Date;
};

function linkify(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`${part}-${index}`}
        href={part}
        className="break-all font-medium text-primary underline underline-offset-2"
      >
        {part}
      </a>
    ) : (
      <Fragment key={`text-${index}`}>{part}</Fragment>
    ),
  );
}

export default async function DevMailboxPage() {
  if (!isDevelopmentMailboxEnabled()) notFound();

  const mails = await getDb()
    .collection<DevMail>("devMailbox")
    .find({ expireAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();

  return (
    <section className="site-container py-space-xl">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-primary">Local development only</p>
        <h1 className="mt-2 font-display text-headline-lg text-on-surface">
          Development email inbox
        </h1>
        <p className="mt-2 max-w-2xl text-body-md leading-relaxed text-on-surface-variant">
          Verification and password-reset emails from this local server are
          captured here. This route is not available in a normal production
          deployment.
        </p>

        <div className="mt-6 space-y-4">
          {mails.length === 0 ? (
            <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-6 text-body-md text-on-surface-variant shadow-sm">
              No captured emails yet. Register an account or request a password
              reset to see one here.
            </div>
          ) : (
            mails.map((mail) => (
              <article
                key={String(mail._id)}
                className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-headline-sm text-on-surface">
                    {mail.subject}
                  </h2>
                  <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                    {mail.kind}
                  </span>
                </div>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  To {mail.to} • {formatOrderDate(mail.createdAt.toISOString())}
                </p>
                <pre className="mt-4 whitespace-pre-wrap break-words rounded bg-surface-container-low p-4 font-sans text-body-sm text-on-surface">
                  {linkify(mail.text)}
                </pre>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
