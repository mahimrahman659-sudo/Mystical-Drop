"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  PrinterIcon,
  ShieldIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { BRAND_NAME } from "@/lib/brand";
import { formatDeliveryAddress } from "@/lib/checkout";
import { CONFIRMATION_STORAGE_KEY } from "@/lib/checkout";
import { formatOrderDate, type OrderConfirmation } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

type ConfirmationState = "loading" | "ready" | "missing" | "error";

type ConfirmationHandle = {
  orderId?: unknown;
  accessToken?: unknown;
};

export function ConfirmationView() {
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [state, setState] = useState<ConfirmationState>("loading");
  const [attempt, setAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState(
    "The confirmation is temporarily unavailable.",
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setState("loading");
      let handle: ConfirmationHandle | null = null;
      try {
        const raw = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
        handle = raw ? (JSON.parse(raw) as ConfirmationHandle) : null;
      } catch {
        handle = null;
      }

      if (
        !handle ||
        typeof handle.orderId !== "string" ||
        typeof handle.accessToken !== "string"
      ) {
        if (!cancelled) setState("missing");
        return;
      }

      try {
        const response = await fetch("/api/orders/confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          signal: controller.signal,
          body: JSON.stringify({
            orderId: handle.orderId,
            accessToken: handle.accessToken,
          }),
        });
        const payload = (await response.json().catch(() => null)) as {
          order?: OrderConfirmation;
          message?: string;
        } | null;

        if (!response.ok || !payload?.order) {
          if (response.status === 404) {
            if (!cancelled) setState("missing");
            return;
          }
          throw new Error(payload?.message || "Confirmation unavailable.");
        }

        if (!cancelled) {
          setOrder(payload.order);
          setState("ready");
        }
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The confirmation is temporarily unavailable.",
        );
        setState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  if (state === "loading") {
    return (
      <div className="site-container py-space-xl" aria-busy="true">
        <p className="text-body-md text-on-surface-variant">
          Opening your order confirmation…
        </p>
        <div className="mx-auto mt-6 h-72 max-w-3xl animate-pulse rounded-xl bg-surface-container-low" />
      </div>
    );
  }

  if (state === "missing" || state === "error") {
    return (
      <section className="site-container py-space-xl">
        <div className="mx-auto max-w-xl rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-lg text-center shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
            <WavesIcon size={28} />
          </span>
          <p className="mt-4 text-label-sm uppercase tracking-widest text-primary">
            {state === "error" ? "Confirmation unavailable" : "No order to display"}
          </p>
          <h1 className="mt-1 font-display text-headline-md text-on-surface">
            {state === "error" ? "We could not open this order" : "This confirmation is empty"}
          </h1>
          <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">
            {state === "error"
              ? errorMessage
              : "For guest checkout, confirmation details are available only in the tab where the order was completed. If you opened this link elsewhere, return to the collection or sign in to view account orders."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            {state === "error" ? (
              <button
                type="button"
                onClick={() => setAttempt((current) => current + 1)}
                className="btn btn-primary"
              >
                Try again
              </button>
            ) : null}
            <Link href="/#collection" className="btn btn-outline">
              Return to the collection
              <ArrowRightIcon size={17} />
            </Link>
            <Link href="/account" className="btn btn-soft">
              Your account orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!order) return null;

  const formattedDate = formatOrderDate(order.createdAt);
  const addressLines = formatDeliveryAddress(order.customer);
  const itemLabel = order.quantity === 1 ? "Fountain" : "Fountains";

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[340px] w-[min(850px,100vw)] -translate-x-1/2 bg-gradient-to-b from-secondary-container/30 via-primary-fixed/20 to-transparent blur-3xl"
      />
      <div className="mx-auto max-w-4xl px-margin-mobile pb-space-xl pt-space-md sm:px-space-md lg:px-0">
        <div className="print-only mb-6 border-b border-outline-variant pb-4">
          <p className="font-display text-headline-md text-on-surface">{BRAND_NAME}</p>
          <p className="text-body-sm text-on-surface-variant">
            Demo order summary • Not a live invoice
          </p>
        </div>

        <div className="no-print flex items-center justify-center gap-space-xs py-space-sm">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-label-sm uppercase tracking-widest text-secondary">
            Demo storefront • Order preview
          </span>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
        </div>

        <div className="mb-space-lg text-center">
          <div className="relative mb-space-md inline-flex">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container/70 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-md">
                <CheckCircleIcon size={28} />
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-2 rounded-full border border-secondary/20 opacity-25"
            />
          </div>
          <p className="text-label-sm font-semibold uppercase tracking-widest text-primary">
            Order Confirmed
          </p>
          <h1 className="mt-1 font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md">
            Your Demo Order Has Been Placed!
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">
            Thank you for exploring {BRAND_NAME}. This is a demo confirmation:
            no payment has been collected and no fountain will be dispatched.
          </p>
          <p className="mx-auto mt-3 inline-flex rounded-full bg-secondary-container px-3 py-1 text-label-sm font-semibold uppercase tracking-wider text-on-secondary-container">
            Demo order only • Nothing will be charged or shipped
          </p>
        </div>

        <div className="print-card overflow-hidden rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest shadow-sm">
          <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low px-space-md py-space-md md:grid-cols-4 md:px-space-lg">
            <div className="flex flex-col">
              <span className="text-label-sm uppercase text-on-surface-variant">
                Order Reference
              </span>
              <span className="font-display text-headline-sm font-medium tracking-tight text-primary">
                #{order.reference}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase text-on-surface-variant">
                Date
              </span>
              <span className="text-body-md font-medium text-on-surface">
                {formattedDate}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase text-on-surface-variant">
                Estimated Delivery
              </span>
              <span className="text-body-md font-medium text-on-surface">
                {order.deliveryEstimate}
              </span>
              <span className="text-label-sm text-secondary">
                {order.deliveryEstimateNote}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm uppercase text-on-surface-variant">
                Payment Method
              </span>
              <span className="text-body-md font-medium text-on-surface">
                {order.paymentMethod}
              </span>
              <span className="text-label-sm font-semibold text-primary">
                {formatPrice(order.total)} demo total
              </span>
            </div>
          </div>

          <div className="p-space-md md:p-space-lg">
            <div className="mb-space-md flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-baseline gap-space-xs">
                <h2 className="font-display text-headline-sm text-on-surface">
                  Artisanal Pieces Ordered
                </h2>
                <span className="text-label-sm text-on-surface-variant">
                  ({order.quantity} {itemLabel})
                </span>
              </div>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Preview only
              </span>
            </div>

            <div className="space-y-space-md">
              {order.items.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-col items-start justify-between gap-space-md rounded-lg bg-surface p-space-sm sm:flex-row sm:items-center sm:p-space-md"
                >
                  <div className="flex min-w-0 items-center gap-space-md">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded bg-surface-container-high shadow-sm sm:h-32 sm:w-28">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-surface-container-lowest/90 px-1.5 py-0.5 text-[10px] text-on-surface backdrop-blur">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-label-sm font-semibold uppercase tracking-wider text-primary">
                          Handcrafted Edition
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-outline-variant"
                        />
                        <span className="text-label-sm text-secondary">
                          {item.flowDescription}
                        </span>
                      </div>
                      <h3 className="font-display text-headline-sm text-on-surface">
                        {item.name}
                      </h3>
                      <p className="text-body-sm text-on-surface-variant">
                        {item.collectionLine}
                      </p>
                      {item.included ? (
                        <span className="mt-2 w-fit rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface">
                          {item.included}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:text-right">
                    <p className="price font-display text-headline-sm font-semibold text-on-surface">
                      {formatPrice(item.lineTotal)}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-space-lg grid grid-cols-1 gap-space-lg rounded-lg bg-surface-container-low/40 p-space-md md:grid-cols-2">
              <div className="flex flex-col justify-between">
                <div>
                  <div className="mb-space-xs flex items-center gap-2">
                    <span className="text-primary">
                      <MapPinIcon size={19} />
                    </span>
                    <h3 className="font-display text-headline-sm text-on-surface">
                      Delivery Destination
                    </h3>
                  </div>
                  <div className="space-y-1 pl-7">
                    <p className="text-body-md font-semibold text-on-surface">
                      {order.customer.fullName}
                    </p>
                    {addressLines.map((line) => (
                      <p key={line} className="text-body-md text-on-surface-variant">
                        {line}
                      </p>
                    ))}
                    <p className="flex items-center gap-2 pt-1 text-body-sm text-on-surface">
                      <PhoneIcon size={14} className="text-secondary" />
                      {order.customer.phone}
                    </p>
                    {order.customer.email ? (
                      <p className="break-words text-body-sm text-on-surface-variant">
                        {order.customer.email}
                      </p>
                    ) : null}
                    {order.customer.instructions ? (
                      <p className="mt-2 rounded bg-surface-container px-2 py-1.5 text-body-sm text-on-surface-variant">
                        <span className="font-semibold text-on-surface">
                          Instructions:
                        </span>{" "}
                        {order.customer.instructions}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-space-md pl-7">
                  <div className="inline-flex items-center gap-2 rounded bg-surface-container px-3 py-1.5 text-label-sm text-on-surface">
                    <WavesIcon size={16} className="text-primary" />
                    Demo order • free nationwide delivery
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
                <h3 className="mb-space-xs font-display text-headline-sm text-on-surface">
                  Payment Summary
                </h3>
                <div className="space-y-space-xs">
                  <div className="flex justify-between gap-3 text-body-sm text-on-surface-variant">
                    <span>
                      Subtotal ({order.quantity} {order.quantity === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-on-surface">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-body-sm text-on-surface-variant">
                    <span>Free nationwide delivery</span>
                    <span className="text-label-sm font-medium uppercase text-secondary">
                      Complimentary
                    </span>
                  </div>
                  <div className="mt-space-xs flex flex-wrap items-baseline justify-between gap-2 border-t border-outline-variant/30 pt-space-xs">
                    <div>
                      <span className="font-display text-headline-sm text-on-surface">
                        Total Payable
                      </span>
                      <p className="text-label-sm text-on-surface-variant">
                        Demo only — nothing to pay
                      </p>
                    </div>
                    <span className="price font-display text-headline-lg font-bold text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print mt-space-lg rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm md:p-space-lg">
          <div className="mb-space-md flex items-center gap-space-xs">
            <span className="text-secondary">
              <ClockIcon size={23} />
            </span>
            <div>
              <h2 className="font-display text-headline-md text-on-surface">
                What Happens Next?
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                A real order would move through these studio steps. This demo stops
                at the confirmation preview.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div className="flex flex-col justify-between rounded-lg bg-surface p-space-md">
              <div>
                <div className="mb-space-xs flex items-center justify-between">
                  <span className="text-label-sm font-bold uppercase tracking-widest text-primary">
                    Step 01
                  </span>
                  <WavesIcon size={18} className="text-secondary" />
                </div>
                <h3 className="mb-space-xs font-display text-headline-sm text-on-surface">
                  Order Confirmation
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  The order details would be verified with you before anything
                  is prepared for dispatch.
                </p>
              </div>
              <p className="mt-space-md text-label-sm text-on-surface-variant">
                Not started in this demo
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-lg bg-surface p-space-md">
              <div>
                <div className="mb-space-xs flex items-center justify-between">
                  <span className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
                    Step 02
                  </span>
                  <PackageIcon size={18} className="text-on-surface-variant" />
                </div>
                <h3 className="mb-space-xs font-display text-headline-sm text-on-surface">
                  Packaging &amp; Dispatch
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  The fountain would be packed securely and handed to a delivery
                  partner for transit.
                </p>
              </div>
              <p className="mt-space-md text-label-sm text-on-surface-variant">
                Not started in this demo
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-lg bg-surface p-space-md">
              <div>
                <div className="mb-space-xs flex items-center justify-between">
                  <span className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
                    Step 03
                  </span>
                  <ShieldIcon size={18} className="text-on-surface-variant" />
                </div>
                <h3 className="mb-space-xs font-display text-headline-sm text-on-surface">
                  Delivery Call
                </h3>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">
                  A delivery partner would call before arrival to arrange a safe
                  handover.
                </p>
              </div>
              <p className="mt-space-md text-label-sm text-on-surface-variant">
                Not scheduled in this demo
              </p>
            </div>
          </div>
        </div>

        <div className="no-print my-space-lg flex flex-col items-center justify-center gap-space-md sm:flex-row">
          <Link
            href="/#collection"
            className="btn btn-primary w-full px-8 sm:w-auto"
          >
            Continue Shopping
            <ArrowRightIcon size={17} />
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-soft w-full px-8 sm:w-auto"
          >
            <PrinterIcon size={18} />
            Print Invoice / Care Summary
          </button>
        </div>

        <div className="no-print rounded-xl bg-surface-container-low p-space-md text-center shadow-sm">
          <p className="font-display text-headline-sm text-on-surface">
            About this demo confirmation
          </p>
          <p className="mx-auto mt-1 max-w-2xl text-body-sm leading-relaxed text-on-surface-variant">
            This demo order is stored in {BRAND_NAME}&apos;s database and appears in
            the admin panel. No payment, courier booking, email, or SMS has been
            created. Support and tracking are not shown because this storefront
            has no live fulfilment destination.
          </p>
        </div>
      </div>
    </div>
  );
}
