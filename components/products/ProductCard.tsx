"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { BagIcon, WavesIcon } from "@/components/ui/icons";
import { formatPrice, isPriced } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest shadow-card transition-shadow duration-300 hover:shadow-soft">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-0"
        >
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            style={product.image.position ? { objectPosition: product.image.position } : undefined}
          />
        </Link>
        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded bg-surface-container-lowest/90 px-2.5 py-1 text-label-sm font-medium uppercase tracking-widest text-on-surface backdrop-blur sm:left-4 sm:top-4">
          {product.catalogNumber} • {product.provenance}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-surface-container-lowest/90 px-2 py-1 text-[10px] text-secondary backdrop-blur sm:right-4 sm:top-4">
          <WavesIcon size={13} />
          {product.flowLabel}
        </span>
        <FavoriteButton
          slug={product.slug}
          name={product.name}
          className="absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="min-w-0 font-display text-headline-sm leading-7 text-on-surface">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          {isPriced(product.price) ? (
            <span className="price shrink-0 whitespace-nowrap text-headline-sm font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
          ) : (
            <span className="shrink-0 whitespace-nowrap text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Price Coming Soon
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-body-sm leading-relaxed text-on-surface-variant">
          {product.description}
        </p>

        <ul className="mt-4 space-y-1.5 rounded bg-surface-container-low px-3.5 py-3">
          {product.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-body-sm leading-5 text-on-surface-variant"
            >
              <span
                aria-hidden="true"
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-stretch gap-2.5 pt-5">
          <button
            type="button"
            onClick={() => addItem(product.slug, 1)}
            disabled={!isPriced(product.price)}
            className="btn btn-primary min-w-[9.5rem] flex-1 px-4 disabled:cursor-not-allowed disabled:opacity-45"
            title={
              isPriced(product.price)
                ? undefined
                : "This fountain becomes available for purchase when its price is announced."
            }
          >
            <BagIcon size={17} />
            Add to Cart
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="btn btn-outline px-4"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

