import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  ShieldIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { requireUser } from "@/lib/auth/session";
import { getOrderForCustomer } from "@/lib/db/orders";
import {
  FULFILLMENT_LABELS,
  formatOrderDate,
  paymentStatusLabel,
  type FulfillmentStatus,
} from "@/lib/orders";
import { formatDeliveryAddress } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order details",
  description: "Your private Mystical Drop order.",
  robots: { index: false, follow: false },
};

const statusStyles: Record<FulfillmentStatus, string> = {
  pending: "bg-surface-container-high text-on-surface-variant",
  confirmed: "bg-secondary-container text-on-secondary-container",
  shipped: "bg-primary-fixed text-primary",
  delivered: "bg-secondary text-on-secondary",
  cancelled: "bg-error-container text-on-error-container",
};

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountOrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await getOrderForCustomer(id, user.id);
  if (!order) notFound();

  const addressLines = formatDeliveryAddress(order.customer);

  return (
    <section className="site-container py-space-lg sm:py-space-xl">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
          <Link href="/account" className="transition-colors hover:text-primary">
            Account
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/account#orders" className="transition-colors hover:text-primary">
            Orders
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface">#{order.reference}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-primary">Private order record</p>
            <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface sm:text-display-md">
              #{order.reference}
            </h1>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Placed {formatOrderDate(order.createdAt.toISOString())} •{" "}
              {order.quantity} {order.quantity === 1 ? "fountain" : "fountains"}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-label-sm font-semibold uppercase tracking-wider ${statusStyles[order.fulfillmentStatus]}`}
          >
            {FULFILLMENT_LABELS[order.fulfillmentStatus]}
          </span>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant/25 bg-surface-container-low p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
                <PackageIcon size={17} />
                Cash on Delivery order
              </div>
              <span className="text-label-sm text-on-surface-variant">
                Payment: {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <h2 className="font-display text-headline-sm text-on-surface">
              Fountains ordered
            </h2>
            <ul className="mt-4 divide-y divide-outline-variant/25">
              {order.items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-surface-container">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-label-sm uppercase tracking-wider text-primary">
                          {item.collectionLine}
                        </p>
                        <h3 className="mt-0.5 font-display text-[19px] leading-6 text-on-surface">
                          {item.name}
                        </h3>
                        <p className="text-body-sm text-on-surface-variant">
                          {item.flowDescription}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="price text-headline-sm text-on-surface">
                          {formatPrice(item.lineTotal)}
                        </p>
                        <p className="text-label-sm text-on-surface-variant">
                          {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    {item.included ? (
                      <p className="mt-2 w-fit rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface">
                        {item.included}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-surface-container-low/45 p-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <MapPinIcon size={18} />
                  <h2 className="font-display text-headline-sm text-on-surface">
                    Delivery destination
                  </h2>
                </div>
                <div className="mt-2 space-y-1 pl-7 text-body-sm">
                  <p className="font-semibold text-on-surface">
                    {order.customer.fullName}
                  </p>
                  {addressLines.map((line) => (
                    <p key={line} className="text-on-surface-variant">
                      {line}
                    </p>
                  ))}
                  <p className="flex items-center gap-1.5 text-on-surface">
                    <PhoneIcon size={13} className="text-secondary" />
                    {order.customer.phone}
                  </p>
                  {order.customer.email ? (
                    <p className="break-all text-on-surface-variant">
                      {order.customer.email}
                    </p>
                  ) : null}
                  {order.customer.instructions ? (
                    <p className="mt-2 rounded bg-surface-container p-2 text-on-surface-variant">
                      <span className="font-semibold text-on-surface">
                        Instructions:
                      </span>{" "}
                      {order.customer.instructions}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="rounded-lg bg-surface-container-lowest p-4 shadow-sm">
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
                    <dt>Cash-on-delivery processing</dt>
                    <dd className="text-on-surface">৳0</dd>
                  </div>
                  <div className="mt-2 flex justify-between gap-3 border-t border-outline-variant/30 pt-2">
                    <dt className="font-display text-headline-sm text-on-surface">
                      Total
                    </dt>
                    <dd className="price font-display text-headline-sm text-primary">
                      {formatPrice(order.total)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-label-sm text-on-surface-variant">
                  Payment is collected in cash when your order is delivered.
                  This page reflects the payment once your order is marked
                  delivered.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-secondary">
                <ShieldIcon size={17} />
                <h2 className="font-display text-headline-sm text-on-surface">
                  Order timeline
                </h2>
              </div>
              <ol className="mt-3 space-y-2 border-l border-outline-variant/45 pl-4 text-body-sm">
                {order.statusHistory.map((event, index) => (
                  <li key={`${event.status}-${event.changedAt}-${index}`}>
                    <p className="font-semibold text-on-surface">
                      {FULFILLMENT_LABELS[event.status]}
                    </p>
                    <p className="text-on-surface-variant">
                      {formatOrderDate(event.changedAt)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/account#orders" className="btn btn-outline">
            <ArrowLeftIcon size={16} />
            Back to orders
          </Link>
          <Link href="/#collection" className="btn btn-soft">
            <WavesIcon size={16} />
            Browse fountains
          </Link>
        </div>
      </div>
    </section>
  );
}
