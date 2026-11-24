"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import {
  ArrowRightIcon,
  BagIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@/components/ui/icons";
import { isPriced } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState<number | null>(null);
  const buyingRef = useRef(false);
  const [isBuying, setIsBuying] = useState(false);
  const purchasable = isPriced(product.price);

  function updateQuantity(next: number) {
    setQuantity(Math.min(10, Math.max(1, next)));
    setAddedQuantity(null);
  }

  function handleAddToCart() {
    if (!purchasable) return;
    addItem(product.slug, quantity, { announce: false });
    setAddedQuantity(quantity);
  }

  function handleInstantBuy() {
    if (!purchasable || buyingRef.current) return;
    buyingRef.current = true;
    setIsBuying(true);
    addItem(product.slug, quantity, { announce: false });
    router.push("/checkout");
  }

  if (!purchasable) {
    return (
      <div
        role="status"
        className="flex flex-col gap-space-sm rounded-xl border border-on-surface/[0.06] bg-surface-container-low p-space-md"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-secondary">
            <InfoIcon size={20} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-label-md font-semibold uppercase tracking-wider text-on-surface">
              Price Coming Soon
            </span>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              This fountain is not yet available for purchase. Pricing will be
              announced when it is confirmed — follow the collection to know
              when ordering opens.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link href="/#collection" className="btn btn-outline px-4 py-2.5">
            Explore the collection
          </Link>
          <Link href="/#contact" className="btn btn-soft px-4 py-2.5">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="text-label-md uppercase tracking-wider text-on-surface">
          Quantity
        </span>
        <QuantityStepper value={quantity} onChange={updateQuantity} />
      </div>

      <div className="grid grid-cols-1 gap-space-sm pt-space-xs sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn btn-primary w-full py-3.5 uppercase tracking-wider"
        >
          <BagIcon size={18} />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleInstantBuy}
          disabled={isBuying}
          className="btn btn-dark w-full py-3.5 uppercase tracking-wider disabled:cursor-wait disabled:opacity-70"
        >
          {isBuying ? "Opening checkout…" : "Instant Buy"}
          <ArrowRightIcon size={18} />
        </button>
      </div>

      {addedQuantity !== null ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-2 rounded-lg bg-secondary-container px-4 py-3 text-body-sm text-on-secondary-container sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <CheckCircleIcon size={19} />
            {addedQuantity === 1
              ? `${product.shortName} added to your cart.`
              : `${addedQuantity} × ${product.shortName} added to your cart.`}
          </span>
          <Link
            href="/cart"
            className="min-h-8 self-start text-label-sm font-semibold uppercase tracking-wider underline underline-offset-2 sm:self-auto"
          >
            View Cart
          </Link>
        </div>
      ) : null}
    </div>
  );
}
