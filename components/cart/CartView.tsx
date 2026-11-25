"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BagIcon,
  DropletIcon,
  InfoIcon,
  ShieldIcon,
  TrashIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { FREE_SHIPPING } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

function UnavailableCartNotice({
  count,
  onRemove,
}: {
  count: number;
  onRemove: () => void;
}) {
  if (count === 0) return null;
  return (
    <div
      role="alert"
      className="mt-4 flex flex-col gap-2 rounded border border-error/25 bg-error-container px-4 py-3 text-body-sm text-on-error-container sm:flex-row sm:items-center sm:justify-between"
    >
      <span>
        {count} saved {count === 1 ? "fountain is" : "fountains are"} no longer
        available and {count === 1 ? "has" : "have"} been excluded from checkout.
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-outline min-h-9 self-start px-3 py-1.5 text-label-md sm:self-auto"
      >
        Remove unavailable items
      </button>
    </div>
  );
}

export function CartView() {
  const {
    items,
    quantity,
    subtotal,
    total,
    hasUnpriced,
    isHydrated,
    catalogError,
    unavailableLines,
    changeQuantity,
    removeItem,
    removeUnavailable,
    clearCart,
  } = useCart();
  const { refresh: refreshCatalog } = useCatalog();
  const [clearOpen, setClearOpen] = useState(false);

  const headingCount = quantity;

  if (!isHydrated) {
    return (
      <div className="site-container pb-space-xl pt-space-md" aria-busy="true">
        <p className="text-label-sm uppercase tracking-widest text-primary">
          Home / Shopping Cart
        </p>
        <h1 className="mt-2 font-display text-headline-lg tracking-tight text-on-surface">
          Your Peaceful Cart
        </h1>
        <p className="mt-4 text-body-md text-on-surface-variant">
          Loading your saved cart…
        </p>
        <div className="mt-8 h-40 animate-pulse rounded-lg bg-surface-container-low" />
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="site-container pb-space-xl pt-space-md">
        <h1 className="font-display text-headline-lg tracking-tight text-on-surface">
          Your Peaceful Cart
        </h1>
        <div role="alert" className="mx-auto mt-6 max-w-xl rounded-xl border border-error/25 bg-error-container p-6 text-center">
          <p className="font-display text-headline-sm text-on-error-container">
            The cart catalog is unavailable
          </p>
          <p className="mt-2 text-body-sm leading-relaxed text-on-error-container/85">
            {catalogError} Your saved cart has not been erased.
          </p>
          <button
            type="button"
            onClick={() => void refreshCatalog()}
            className="btn btn-primary mt-4"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="site-container pb-space-xl pt-space-md">
        <nav aria-label="Breadcrumb" className="mb-space-sm flex items-center gap-2">
          <Link
            href="/"
            className="text-label-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
          >
            Home
          </Link>
          <span aria-hidden="true" className="text-label-sm text-outline-variant">
            /
          </span>
          <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">
            Shopping Cart
          </span>
        </nav>
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-baseline gap-space-xs">
            <h1 className="font-display text-headline-lg tracking-tight text-on-surface">
              Your Peaceful Cart
            </h1>
            <span className="font-display text-headline-sm font-normal text-secondary">
              (0 items)
            </span>
          </div>
          <p className="text-body-sm italic text-on-surface-variant">
            Original tabletop fountains, made in-house
          </p>
        </div>

        <UnavailableCartNotice
          count={unavailableLines.length}
          onRemove={removeUnavailable}
        />

        <div className="mx-auto my-space-lg flex max-w-xl flex-col items-center justify-center rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest px-space-md py-space-xl text-center shadow-sm">
          <div className="mb-space-md flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-secondary">
            <DropletIcon size={30} />
          </div>
          <span className="mb-1 text-label-sm uppercase tracking-widest text-tertiary">
            Still Water Awaits
          </span>
          <h2 className="font-display text-headline-md text-on-surface">
            Your Cart is Currently Empty
          </h2>
          <p className="mt-2 max-w-md text-body-md leading-relaxed text-on-surface-variant">
            Browse our original collection of decorative tabletop fountains and
            save the designs you would like to revisit.
          </p>
          <Link href="/#collection" className="btn btn-primary mt-space-lg">
            Explore Our Fountains
            <ArrowRightIcon size={17} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container pb-space-xl pt-space-md">
      <nav aria-label="Breadcrumb" className="mb-space-sm flex items-center gap-2">
        <Link
          href="/"
          className="text-label-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
        >
          Home
        </Link>
        <span aria-hidden="true" className="text-label-sm text-outline-variant">
          /
        </span>
        <span className="text-label-sm font-semibold uppercase tracking-widest text-primary">
          Shopping Cart
        </span>
      </nav>

      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex flex-wrap items-baseline gap-space-xs">
          <h1 className="font-display text-headline-lg tracking-tight text-on-surface">
            Your Peaceful Cart
          </h1>
          <span
            className="font-display text-headline-sm font-normal text-secondary"
            aria-live="polite"
          >
            ({headingCount} {headingCount === 1 ? "item" : "items"})
          </span>
        </div>
        <p className="text-body-sm italic text-on-surface-variant">
          Original tabletop fountains, made in-house
        </p>
      </div>

      <UnavailableCartNotice
        count={unavailableLines.length}
        onRemove={removeUnavailable}
      />

      {hasUnpriced ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2 rounded border border-outline-variant/60 bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant"
        >
          <InfoIcon size={18} className="mt-0.5 shrink-0 text-secondary" />
          <span>
            One or more fountains in your cart does not have a confirmed price
            yet. Checkout opens as soon as every price in the cart is announced.
          </span>
        </div>
      ) : null}

      <div className="mt-space-lg grid grid-cols-1 items-start gap-gutter lg:grid-cols-12 lg:gap-space-lg">
        <div className="flex flex-col gap-space-md lg:col-span-8">
          <div className="hidden grid-cols-12 pb-space-xs text-label-sm uppercase tracking-widest text-on-surface-variant xl:grid">
            <div className="col-span-5">Sculptural Feature</div>
            <div className="col-span-2 text-center">Unit Price</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <ul className="flex flex-col gap-space-md">
            {items.map((line) => (
              <li
                key={line.slug}
                className="rounded-lg border border-on-surface/[0.04] bg-surface-container-lowest p-4 shadow-sm sm:p-5"
              >
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12 xl:items-center xl:gap-space-md">
                  <div className="flex min-w-0 items-start gap-space-md xl:col-span-5">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-surface-container-low shadow-sm sm:h-28 sm:w-24">
                      <Image
                        src={line.product.cartImage}
                        alt={line.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-label-sm uppercase tracking-widest text-tertiary">
                        {line.product.provenance}
                      </span>
                      <h2 className="mt-0.5 font-display text-[19px] leading-tight text-on-surface">
                        <Link
                          href={`/products/${line.slug}`}
                          className="transition-colors hover:text-primary"
                        >
                          {line.product.shortName}
                        </Link>
                      </h2>
                      <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">
                        {line.product.collectionLine} • {line.product.flowDescription}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(line.slug)}
                        className="mt-2 inline-flex min-h-8 items-center gap-1 self-start text-label-sm text-on-surface-variant transition-colors hover:text-error"
                        aria-label={`Remove ${line.product.name} from cart`}
                      >
                        <TrashIcon size={15} />
                        Remove item
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 xl:col-span-2 xl:justify-center xl:border-0 xl:pt-0">
                    <span className="text-body-sm text-on-surface-variant xl:hidden">
                      Unit Price:
                    </span>
                    <span className="font-sans text-body-md font-medium text-on-surface">
                      {formatPrice(line.product.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between xl:col-span-3 xl:justify-center">
                    <span className="text-body-sm text-on-surface-variant xl:hidden">
                      Quantity:
                    </span>
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(next) => changeQuantity(line.slug, next - line.quantity)}
                      label={`Quantity for ${line.product.name}`}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 xl:col-span-2 xl:justify-end xl:border-0 xl:pt-0">
                    <span className="text-body-sm text-on-surface-variant xl:hidden">
                      Line total:
                    </span>
                    <span className="price text-headline-sm text-primary">
                      {formatPrice(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary-container text-on-secondary-container">
              <ShieldIcon size={19} />
            </div>
            <div>
              <p className="text-label-md font-semibold uppercase tracking-wider text-on-surface">
                Original designs, made in-house
              </p>
              <p className="mt-0.5 text-body-sm leading-relaxed text-on-surface-variant">
                Every fountain in our collection is an original Mystical Drop
                design, developed and produced by our own team.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <Link
              href="/#collection"
              className="inline-flex min-h-10 items-center gap-2 text-label-lg text-on-surface transition-colors hover:text-primary"
            >
              <ArrowLeftIcon size={18} />
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              className="min-h-10 text-label-sm uppercase tracking-wider text-on-surface-variant transition-colors hover:text-error"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        <aside className="w-full lg:col-span-4 lg:sticky lg:top-32">
          <div className="flex flex-col gap-space-md rounded-lg border border-on-surface/[0.04] bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-headline-sm text-on-surface">
                Order Summary
              </h2>
              <span className="text-label-sm uppercase tracking-widest text-secondary">
                Bespoke Living
              </span>
            </div>

            <div className="flex flex-col gap-space-sm pt-space-xs text-body-sm">
              <div className="flex items-center justify-between gap-4 text-on-surface-variant">
                <span>Cart Subtotal</span>
                <span className="font-medium text-on-surface">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-on-surface-variant">
                <div className="flex flex-col">
                  <span className="text-on-surface">{FREE_SHIPPING.label}</span>
                  <span className="text-label-sm font-medium text-secondary">
                    {FREE_SHIPPING.detail}
                  </span>
                </div>
                <span className="rounded bg-secondary-container px-2 py-0.5 text-label-sm font-semibold uppercase text-on-secondary-container">
                  {FREE_SHIPPING.valueLabel}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-surface-container" />

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
                  Total
                </span>
                <span className="text-label-sm text-on-surface-variant">
                  Prices in Bangladeshi Taka
                </span>
              </div>
              <span className="price text-headline-md font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>

            {hasUnpriced ? (
              <button
                type="button"
                disabled
                className="btn w-full cursor-not-allowed bg-surface-container-high py-3.5 uppercase tracking-wider text-on-surface-variant opacity-80"
              >
                Checkout unavailable — price pending
              </button>
            ) : (
              <Link
                href="/checkout"
                className="btn btn-primary w-full py-3.5 uppercase tracking-wider"
              >
                Proceed to Checkout
                <ArrowRightIcon size={18} />
              </Link>
            )}

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <span className="text-center text-label-sm uppercase tracking-widest text-on-surface-variant">
                Payment
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="rounded bg-surface-container px-2.5 py-1 text-label-sm font-medium text-on-surface">
                  Cash on Delivery
                </span>
              </div>
              <p className="text-center text-label-sm text-on-surface-variant">
                Pay in cash when your order arrives. Online payments (bKash,
                Nagad, cards) coming later.
              </p>
            </div>

            <div className="flex items-center gap-space-xs rounded bg-surface-container-low p-space-sm">
              <WavesIcon size={19} className="shrink-0 text-secondary" />
              <p className="text-label-sm leading-4 text-on-surface-variant">
                Cash on Delivery — payment is collected when your order arrives.
              </p>
            </div>
          </div>

          <div className="mt-space-sm flex items-center justify-center gap-2 p-2 text-label-sm text-on-surface-variant">
            <BagIcon size={16} />
            {quantity} {quantity === 1 ? "fountain" : "fountains"} in your cart
          </div>
        </aside>
      </div>

      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        labelledBy="clear-cart-title"
        panelClassName="sm:max-w-md rounded-t-xl sm:rounded-xl p-6"
      >
        <h2
          id="clear-cart-title"
          className="font-display text-headline-sm text-on-surface"
        >
          Clear your entire cart?
        </h2>
        <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
          This removes all {quantity} {quantity === 1 ? "fountain" : "fountains"}{" "}
          from this cart. This cannot be undone.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setClearOpen(false)}
            className="btn btn-outline"
            data-autofocus
          >
            Keep my cart
          </button>
          <button
            type="button"
            onClick={() => {
              clearCart();
              setClearOpen(false);
            }}
            className="btn bg-error text-on-error hover:bg-[#9f1616]"
          >
            Clear cart
          </button>
        </div>
      </Dialog>
    </div>
  );
}

