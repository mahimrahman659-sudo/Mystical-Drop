import type { Metadata } from "next";
import Link from "next/link";
import { getAdminViewer } from "@/lib/admin/auth";
import { getAdminOrderStats } from "@/lib/db/orders";
import {
  FULFILLMENT_LABELS,
  formatOrderDate,
  type FulfillmentStatus,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import {
  ArrowRightIcon,
  BagIcon,
  PackageIcon,
  SparkleIcon,
  WavesIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Overview",
};

const statusStyles: Record<FulfillmentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-primary-fixed text-primary",
  delivered: "bg-secondary text-on-secondary",
  cancelled: "bg-error-container text-on-error-container",
};

export default async function AdminOverviewPage() {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const stats = await getAdminOrderStats();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Studio operations</p>
          <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface">
            Overview
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Live counts from the TerraNova MongoDB database.
          </p>
        </div>
        <Link href="/admin/orders" className="btn btn-outline">
          All orders
          <ArrowRightIcon size={16} />
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Orders
          </p>
          <p className="mt-1 font-display text-[2rem] leading-none text-on-surface">
            {stats.totalOrders}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            {stats.demoOrders} demo COD
          </p>
        </div>
        <div className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Awaiting action
          </p>
          <p className="mt-1 font-display text-[2rem] leading-none text-primary">
            {stats.awaitingAction}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Pending or confirmed
          </p>
        </div>
        <div className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Active products
          </p>
          <p className="mt-1 font-display text-[2rem] leading-none text-on-surface">
            {stats.activeProducts}
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Visible in the storefront
          </p>
        </div>
        <div className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
            Payment state
          </p>
          <p className="mt-1 font-display text-headline-sm text-on-surface">
            COD demo
          </p>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            Payment is not collected
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/25 pb-3">
          <div className="flex items-center gap-2">
            <BagIcon size={18} className="text-secondary" />
            <h2 className="font-display text-headline-sm text-on-surface">
              Recent orders
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-label-sm font-medium text-primary underline underline-offset-2"
          >
            View all orders
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <WavesIcon size={26} className="mx-auto text-secondary" />
            <p className="mt-2 font-display text-headline-sm text-on-surface">
              No orders yet
            </p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Storefront checkout orders will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/25">
            {stats.recentOrders.map((order) => (
              <li key={order._id!.toHexString()}>
                <Link
                  href={`/admin/orders/${order._id!.toHexString()}`}
                  className="grid grid-cols-1 gap-2 py-3 transition-colors hover:bg-surface-container-low/50 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
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
                      {order.customer.fullName || "Guest"} •{" "}
                      {formatOrderDate(order.createdAt.toISOString())} •{" "}
                      {order.quantity} {order.quantity === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Order value
                    </p>
                    <p className="price text-headline-sm text-on-surface">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <span className="hidden text-label-sm text-on-surface-variant sm:block">
                    View →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-3 rounded-lg border border-on-surface/[0.05] bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
        >
          <PackageIcon size={20} className="text-primary" />
          <div>
            <p className="text-body-sm font-semibold text-on-surface">
              Manage catalog
            </p>
            <p className="text-label-sm text-on-surface-variant">
              Add, edit, archive, and restore fountains
            </p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-lg border border-on-surface/[0.05] bg-surface-container-low p-4 transition-colors hover:bg-surface-container"
        >
          <SparkleIcon size={20} className="text-secondary" />
          <div>
            <p className="text-body-sm font-semibold text-on-surface">
              Fulfilment queue
            </p>
            <p className="text-label-sm text-on-surface-variant">
              Reference search, status filters, and order details
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
