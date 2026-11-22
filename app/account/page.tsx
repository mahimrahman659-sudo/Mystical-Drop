import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/account/LogoutButton";
import { ConnectGoogleButton } from "@/components/account/ConnectGoogleButton";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  HeartIcon,
  PackageIcon,
  ShieldIcon,
  SparkleIcon,
  UserIcon,
} from "@/components/ui/icons";
import { googleIsConfigured } from "@/lib/auth/server";
import { requireUser, hasGoogleAccount } from "@/lib/auth/session";
import { listOrdersForCustomer } from "@/lib/db/orders";
import {
  FULFILLMENT_LABELS,
  formatOrderDate,
  type FulfillmentStatus,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your Mystical Drop profile and order history.",
  robots: { index: false, follow: false },
};

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string | undefined {
  return Array.isArray(input) ? input[0] : input;
}

const statusStyles: Record<FulfillmentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-primary-fixed text-primary",
  delivered: "bg-secondary text-on-secondary",
  cancelled: "bg-error-container text-on-error-container",
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await requireUser("/account");
  const params = await searchParams;
  const orders = await listOrdersForCustomer(user.id);
  const googleConnected = await hasGoogleAccount(user.id);
  const googleEnabled = googleIsConfigured();
  const googleLinked = value(params.linked) === "google";

  return (
    <section className="site-container py-space-lg sm:py-space-xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-primary">Customer account</p>
          <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface sm:text-display-md">
            Your quiet corner.
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Profile, saved pieces, and order history in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/#collection" className="btn btn-soft">
            Browse fountains
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-gutter lg:col-span-4">
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
                <UserIcon size={22} />
              </span>
              <div className="min-w-0">
                <h2 className="break-words font-display text-headline-sm text-on-surface">
                  {user.name}
                </h2>
                <p className="break-all text-body-sm text-on-surface-variant">
                  {user.email}
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-outline-variant/25 pt-4 text-body-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Email status</dt>
                <dd
                  className={`flex items-center gap-1.5 font-medium ${
                    user.emailVerified ? "text-secondary" : "text-error"
                  }`}
                >
                  {user.emailVerified ? <CheckCircleIcon size={15} /> : null}
                  {user.emailVerified ? "Verified" : "Verification pending"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Account type</dt>
                <dd className="font-medium text-on-surface">
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Member since</dt>
                <dd className="text-right font-medium text-on-surface">
                  {user.createdAt ? formatOrderDate(user.createdAt) : "—"}
                </dd>
              </div>
            </dl>
            {user.role === "admin" ? (
              <Link href="/admin" className="btn btn-primary mt-5 w-full">
                Open admin panel
                <ArrowRightIcon size={16} />
              </Link>
            ) : null}
          </div>

          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-secondary">
              <ShieldIcon size={18} />
              <h2 className="font-display text-headline-sm text-on-surface">
                Sign-in security
              </h2>
            </div>
            <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
              Email and password sign-in uses Better Auth&apos;s password hashing.
              Connect Google only while signed in to this account.
            </p>
            {googleLinked ? (
              <p className="mt-3 rounded bg-secondary-container px-3 py-2 text-body-sm text-on-secondary-container">
                Google was linked to this account.
              </p>
            ) : null}
            <div className="mt-4">
              <ConnectGoogleButton connected={googleConnected} enabled={googleEnabled} />
            </div>
          </div>

          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-low p-5 sm:p-6">
            <HeartIcon size={18} className="text-primary" />
            <h2 className="mt-2 font-display text-headline-sm text-on-surface">
              Your favorites are saved locally
            </h2>
            <p className="mt-1 text-body-sm leading-relaxed text-on-surface-variant">
              The heart button keeps fountains close in this browser. Favorites
              are not attached to account history.
            </p>
          </div>
        </div>

        <div id="orders" className="scroll-mt-28 lg:col-span-8">
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-outline-variant/25 pb-4">
              <div>
                <p className="eyebrow text-primary">Order history</p>
                <h2 className="mt-1 font-display text-headline-md text-on-surface">
                  Your orders
                </h2>
              </div>
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-secondary">
                  <PackageIcon size={26} />
                </span>
                <h3 className="mt-4 font-display text-headline-sm text-on-surface">
                  No account orders yet
                </h3>
                <p className="mt-2 max-w-sm text-body-sm leading-relaxed text-on-surface-variant">
                  Orders placed while signed in appear here. Guest orders remain
                  private to the browser where checkout was completed.
                </p>
                <Link href="/#collection" className="btn btn-primary mt-5">
                  Find a fountain
                  <ArrowRightIcon size={16} />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant/25">
                {orders.map((order) => (
                  <li key={order._id!.toHexString()}>
                    <Link
                      href={`/account/orders/${order._id!.toHexString()}`}
                      className="group flex flex-col gap-3 py-4 transition-colors hover:bg-surface-container-low/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-headline-sm text-primary">
                            #{order.reference}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusStyles[order.fulfillmentStatus]}`}
                          >
                            {FULFILLMENT_LABELS[order.fulfillmentStatus]}
                          </span>
                          <span className="rounded-full bg-surface-container px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-on-surface-variant">
                            Demo
                          </span>
                        </div>
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                          {formatOrderDate(order.createdAt.toISOString())} •{" "}
                          {order.quantity} {order.quantity === 1 ? "item" : "items"} •{" "}
                          {order.items.map((item) => item.name).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <span className="price text-headline-sm text-on-surface">
                          {formatPrice(order.total)}
                        </span>
                        <span className="text-label-sm text-on-surface-variant transition-colors group-hover:text-primary">
                          View order →
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
            <SparkleIcon size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              These are demo Cash on Delivery orders. No payment has been
              collected and no dispatch is scheduled. The admin panel and this
              history are fed by the same MongoDB order records.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
