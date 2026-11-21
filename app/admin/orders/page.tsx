import type { Metadata } from "next";
import Link from "next/link";
import { getAdminViewer } from "@/lib/admin/auth";
import { listAdminOrders } from "@/lib/db/orders";
import {
  FULFILLMENT_LABELS,
  FULFILLMENT_STATUSES,
  formatOrderDate,
  isFulfillmentStatus,
  type FulfillmentStatus,
} from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
};

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string {
  return Array.isArray(input) ? input[0] ?? "" : input ?? "";
}

const statusStyles: Record<FulfillmentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-primary-fixed text-primary",
  delivered: "bg-secondary text-on-secondary",
  cancelled: "bg-error-container text-on-error-container",
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const params = await searchParams;
  const query = value(params.q);
  const requestedStatus = value(params.status);
  const status: FulfillmentStatus | "all" = isFulfillmentStatus(requestedStatus)
    ? requestedStatus
    : "all";
  const orders = await listAdminOrders({ query, status });

  return (
    <div>
      <div>
        <p className="eyebrow text-primary">Fulfilment</p>
        <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface">
          Orders
        </h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {orders.length} matching {orders.length === 1 ? "order" : "orders"}.
          Payment and fulfilment are tracked separately.
        </p>
      </div>

      <form
        method="get"
        className="mt-5 flex flex-col gap-2 rounded-lg border border-on-surface/[0.05] bg-surface-container-low p-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="field-label" htmlFor="admin-order-search">
            Search by reference, customer, or phone
          </label>
          <input
            id="admin-order-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="TNV-12345"
            className="field-input"
          />
        </div>
        <div className="sm:w-44">
          <label className="field-label" htmlFor="admin-order-status">
            Fulfilment status
          </label>
          <select
            id="admin-order-status"
            name="status"
            defaultValue={status}
            className="field-input"
          >
            <option value="all">All statuses</option>
            {FULFILLMENT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {FULFILLMENT_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-outline">
          Apply
        </button>
        {query || status !== "all" ? (
          <Link href="/admin/orders" className="btn btn-soft">
            Clear
          </Link>
        ) : null}
      </form>

      {orders.length === 0 ? (
        <div className="mt-5 rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-8 text-center shadow-sm">
          <p className="font-display text-headline-sm text-on-surface">
            No matching orders
          </p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Orders appear here after a checkout has been saved. Try clearing the
            search or status filter.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((order) => (
            <li
              key={order._id!.toHexString()}
              className="rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/orders/${order._id!.toHexString()}`}
                      className="font-display text-headline-sm text-primary hover:underline"
                    >
                      #{order.reference}
                    </Link>
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
                    {order.customer.fullName} •{" "}
                    {order.userId ? "Customer account" : "Guest"} •{" "}
                    {formatOrderDate(order.createdAt.toISOString())}
                  </p>
                  <p className="mt-0.5 break-all text-label-sm text-on-surface-variant">
                    {order.customer.phone}
                    {order.customer.email ? ` • ${order.customer.email}` : ""}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-left sm:text-right">
                  <div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Order value
                    </p>
                    <p className="price text-headline-sm text-on-surface">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Payment
                    </p>
                    <p className="text-body-sm text-on-surface">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-outline-variant/20 pt-3">
                <Link
                  href={`/admin/orders/${order._id!.toHexString()}`}
                  className="text-label-sm font-medium text-primary underline underline-offset-2"
                >
                  Open order details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
