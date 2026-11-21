import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  belowCard?: ReactNode;
  showDevMailbox?: boolean;
};

export function AuthShell({
  eyebrow = "Customer account",
  title,
  description,
  children,
  belowCard,
  showDevMailbox = false,
}: AuthShellProps) {
  return (
    <section className="site-container py-space-lg sm:py-space-xl">
      <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-xl">
        <div className="mx-auto w-full max-w-lg lg:col-span-6 lg:mx-0 xl:col-span-5">
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-5 shadow-card sm:p-7">
            <p className="eyebrow text-primary">{eyebrow}</p>
            <h1 className="mt-2 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md">
              {title}
            </h1>
            <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">
              {description}
            </p>
            <div className="mt-6">{children}</div>
            {showDevMailbox ? (
              <div className="mt-5 rounded bg-surface-container-low px-3 py-2.5 text-label-sm text-on-surface-variant">
                Local development: emails are captured in the{" "}
                <Link
                  href="/dev/mailbox"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  development inbox
                </Link>
                .
              </div>
            ) : null}
          </div>
          {belowCard ? <div className="mt-4">{belowCard}</div> : null}
        </div>

        <aside className="hidden lg:col-span-6 lg:block xl:col-span-7">
          <div className="relative h-[500px] overflow-hidden rounded-xl bg-surface-container">
            <Image
              src="/images/triptych-study.jpg"
              alt="Three TerraNova handcrafted water fountains arranged on a warm wooden study desk"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 via-transparent to-transparent"
            />
            <div className="absolute bottom-6 left-6 right-6 rounded bg-surface-container-lowest/95 p-4 backdrop-blur">
              <p className="eyebrow text-primary">Slow water, quiet rooms</p>
              <p className="mt-1 font-display text-headline-sm text-on-surface">
                Keep your cart and favorites while you sign in.
              </p>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Guest checkout remains available. A customer account keeps your
                order history in one place.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
