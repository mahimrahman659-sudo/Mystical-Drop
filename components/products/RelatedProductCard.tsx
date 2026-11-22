"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import {
  ArrowUpRightIcon,
  BagIcon,
} from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";

export function RelatedProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-soft sm:p-5">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-container"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 768px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded bg-surface/90 px-2.5 py-1 text-label-sm uppercase tracking-wider text-on-surface backdrop-blur">
          {product.collectionLine}
        </span>
      </Link>
      <div className="flex flex-1 flex-col pt-space-md">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
            {product.catalogNumber}. {product.shortName}
          </span>
          <span className="text-label-sm text-on-surface-variant">
            Small Batch
          </span>
        </div>
        <h3 className="mt-1 font-display text-headline-sm text-on-surface transition-colors group-hover:text-primary">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-body-sm leading-relaxed text-on-surface-variant">
          {product.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-space-md">
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Price
            </span>
            <span className="price text-headline-sm text-on-surface">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addItem(product.slug, 1)}
              className="btn btn-primary min-h-10 px-3.5 py-2 text-label-md uppercase"
            >
              <BagIcon size={15} />
              Add
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="btn btn-soft min-h-10 px-3.5 py-2 text-label-md uppercase"
            >
              View Fountain
              <ArrowUpRightIcon size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
