import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateFulfillmentStatusAction } from "@/app/admin/orders/actions";
import { getAdminViewer } from "@/lib/admin/auth";
import { getAdminOrder } from "@/lib/db/orders";
import {
  FULFILLMENT_LABELS,
  formatOrderDate,
  nextFulfillmentStatuses,
  type FulfillmentStatus,
} from "@/lib/orders";
import { formatDeliveryAddress } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

const statusStyles: Record<FulfillmentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-primary-fixed text-primary",
  delivered: "bg-secondary text-on-secondary",
  cancelled: "bg-error-container text-on-error-container",
};

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string {
  return Array.isArray(input) ? input[0] ?? "" : input ?? "";
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: AdminOrderPageProps) {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const { id } = await params;
  const query = await searchParams;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const nextStatuses = nextFulfillmentStatuses(order.fulfillmentStatus);
  const updated = value(query.updated) === "1";
  const error = value(query.error);
  const addressLines = formatDeliveryAddress(order.customer);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
        <Link href="/admin/orders" className="hover:text-primary">
          Orders
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-on-surface">#{order.reference}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Order record</p>
          <h1 className="mt-1 break-all font-display text-display-sm tracking-tight text-on-surface">
            #{order.reference}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {formatOrderDate(order.createdAt.toISOString())} •{" "}
            {order.quantity} {order.quantity === 1 ? "item" : "items"} •{" "}
            {order.userId ? "Customer account" : "Guest order"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-label-sm font-semibold uppercase tracking-wider ${statusStyles[order.fulfillmentStatus]}`}
          >
            {FULFILLMENT_LABELS[order.fulfillmentStatus]}
          </span>
          <span className="rounded-full bg-surface-container px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Demo COD
          </span>
        </div>
      </div>

      {updated ? (
        <div role="status" className="mt-4 rounded border border-secondary/20 bg-secondary-container px-4 py-3 text-body-sm text-on-secondary-container">
          Fulfilment status updated.
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="mt-4 rounded border border-error/25 bg-error-container px-4 py-3 text-body-sm text-on-error-container">
          {error === "stale"
            ? "The order changed before this update was applied. Review the current status and try again."
            : "That status transition is not permitted."}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-5">
            <h2 className="font-display text-headline-sm text-on-surface">
              Items
            </h2>
            <ul className="mt-3 divide-y divide-outline-variant/25">
              {order.items.map((item) => (
                <li key={item.slug} className="flex gap-3 py-3 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-label-sm uppercase tracking-wider text-primary">
                          {item.collectionLine}
                        </p>
                        <h3 className="font-display text-[18px] leading-6 text-on-surface">
                          {item.name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {item.flowDescription}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="price text-headline-sm text-on-surface">
                          {formatPrice(item.lineTotal)}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
              <h2 className="font-display text-headline-sm text-on-surface">
                Customer
              </h2>
              <div className="mt-2 space-y-1 text-body-sm">
                <p className="font-semibold text-on-surface">
                  {order.customer.fullName}
                </p>
                <p className="text-on-surface-variant">{order.customer.phone}</p>
                {order.customer.email ? (
                  <p className="break-all text-on-surface-variant">
                    {order.customer.email}
                  </p>
                ) : null}
                <p className="text-label-sm text-on-surface-variant">
                  {order.userId ? "Linked customer account" : "Guest checkout"}
                </p>
              </div>
              <h3 className="mt-4 font-display text-headline-sm text-on-surface">
                Delivery address
              </h3>
              <div className="mt-1 space-y-1 text-body-sm text-on-surface-variant">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {order.customer.instructions ? (
                  <p className="rounded bg-surface-container-low p-2">
                    <span className="font-semibold text-on-surface">
                      Instructions:
                    </span>{" "}
                    {order.customer.instructions}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
              <h2 className="font-display text-headline-sm text-on-surface">
                Order value
              </h2>
              <dl className="mt-2 space-y-1 text-body-sm text-on-surface-variant">
                <div className="flex justify-between gap-3">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-on-surface">
                    {formatPrice(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Free nationwide delivery</dt>
                  <dd className="font-medium uppercase text-secondary">Free</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>COD processing</dt>
                  <dd className="text-on-surface">৳0</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-outline-variant/30 pt-2">
                  <dt className="font-display text-headline-sm text-on-surface">
                    Total
                  </dt>
                  <dd className="price font-display text-headline-sm text-primary">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 space-y-1 border-t border-outline-variant/30 pt-3 text-body-sm">
                <p>
                  <span className="text-on-surface-variant">Payment method:</span>{" "}
                  <span className="text-on-surface">{order.paymentMethod}</span>
                </p>
                <p>
                  <span className="text-on-surface-variant">Payment status:</span>{" "}
                  <span className="text-on-surface">Not collected</span>
                </p>
                <p>
                  <span className="text-on-surface-variant">Fulfilment status:</span>{" "}
                  <span className="text-on-surface">
                    {FULFILLMENT_LABELS[order.fulfillmentStatus]}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm">
            <h2 className="font-display text-headline-sm text-on-surface">
              Status history
            </h2>
            <ol className="mt-3 space-y-3 border-l border-outline-variant/45 pl-4">
              {order.statusHistory.map((event, index) => (
                <li key={`${event.status}-${event.changedAt}-${index}`}>
                  <p className="text-body-sm font-semibold text-on-surface">
                    {FULFILLMENT_LABELS[event.status]}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    {formatOrderDate(event.changedAt)}
                    {event.changedBy ? ` • ${event.changedBy.email}` : ""}
                  </p>
                  {event.note ? (
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">
                      {event.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm lg:sticky lg:top-28">
            <h2 className="font-display text-headline-sm text-on-surface">
              Fulfilment actions
            </h2>
            {nextStatuses.length === 0 ? (
              <p className="mt-2 text-body-sm text-on-surface-variant">
                No further transitions are available from{" "}
                {FULFILLMENT_LABELS[order.fulfillmentStatus]}.
              </p>
            ) : (
              <form action={updateFulfillmentStatusAction} className="mt-3 space-y-2">
                <input type="hidden" name="orderId" value={order._id!.toHexString()} />
                <input
                  type="hidden"
                  name="expectedStatus"
                  value={order.fulfillmentStatus}
                />
                <p className="text-label-sm text-on-surface-variant">
                  Move one step from{" "}
                  <strong className="text-on-surface">
                    {FULFILLMENT_LABELS[order.fulfillmentStatus]}
                  </strong>{" "}
                  and record the acting admin.
                </p>
                {nextStatuses.map((next) => (
                  <button
                    key={next}
                    type="submit"
                    name="nextStatus"
                    value={next}
                    className={`btn w-full ${
                      next === "cancelled"
                        ? "border-error/30 bg-surface-container-lowest text-error hover:bg-error-container"
                        : "btn-primary"
                    }`}
                  >
                    {next === "cancelled"
                      ? "Cancel order"
                      : `Mark as ${FULFILLMENT_LABELS[next]}`}
                  </button>
                ))}
              </form>
            )}
            <p className="mt-4 border-t border-outline-variant/30 pt-3 text-label-sm leading-relaxed text-on-surface-variant">
              Payment status is separate and is not changed by fulfilment. This is
              a demo COD order, so no payment collection is recorded.
            </p>
          </div>
          <Link href="/admin/orders" className="btn btn-outline mt-3 w-full">
            Back to all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
