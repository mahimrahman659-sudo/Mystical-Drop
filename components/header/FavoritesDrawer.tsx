"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { formatPrice } from "@/lib/format";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowRightIcon,
  CloseIcon,
  HeartIcon,
  TrashIcon,
} from "@/components/ui/icons";

type FavoritesDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function FavoritesDrawer({ open, onClose }: FavoritesDrawerProps) {
  const { favoriteProducts, removeFavorite, count } = useFavorites();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="favorites-dialog-title"
      panelClassName="sm:max-w-lg sm:rounded-xl sm:border sm:border-outline-variant/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 px-5 py-5 sm:px-7">
        <div>
          <p className="eyebrow text-primary">Saved for quiet moments</p>
          <h2
            id="favorites-dialog-title"
            className="mt-1 flex items-baseline gap-2 font-display text-headline-md text-on-surface"
          >
            Your Favorites
            <span className="font-sans text-body-sm font-normal text-secondary">
              ({count})
            </span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close favorites"
          className="icon-button -mr-1 -mt-1 shrink-0"
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="px-5 py-5 sm:px-7">
        {favoriteProducts.length > 0 ? (
          <ul className="divide-y divide-outline-variant/25">
            {favoriteProducts.map((product) => (
              <li key={product.slug} className="flex items-center gap-4 py-4">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-surface-container"
                >
                  <Image
                    src={product.image.src}
                    alt={product.image.alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="font-label-sm uppercase tracking-widest text-primary">
                    {product.provenance}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="mt-0.5 block font-display text-[19px] leading-6 text-on-surface hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 font-display text-[16px] text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="inline-flex min-h-9 items-center gap-1.5 text-label-sm uppercase tracking-wider text-on-surface transition-colors hover:text-primary"
                    >
                      View details
                      <ArrowRightIcon size={14} />
                    </Link>
                    <span className="h-3 w-px bg-outline-variant" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => removeFavorite(product.slug)}
                      className="inline-flex min-h-9 items-center gap-1.5 text-label-sm uppercase tracking-wider text-outline transition-colors hover:text-error"
                      aria-label={`Remove ${product.name} from favorites`}
                    >
                      <TrashIcon size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg bg-surface-container-low px-6 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-secondary">
              <HeartIcon size={24} />
            </span>
            <p className="mt-4 font-display text-headline-sm text-on-surface">
              Nothing saved yet
            </p>
            <p className="mx-auto mt-2 max-w-xs text-body-sm leading-6 text-on-surface-variant">
              Tap the heart on any fountain to keep it close while you decide.
            </p>
            <Link href="/#collection" onClick={onClose} className="btn btn-primary mt-5">
              Browse the collection
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        )}

        {favoriteProducts.length > 0 ? (
          <div className="mt-5 border-t border-outline-variant/30 pt-4">
            <Link
              href="/#collection"
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-2 text-label-lg font-medium text-on-surface transition-colors hover:text-primary"
            >
              Keep browsing the collection
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
