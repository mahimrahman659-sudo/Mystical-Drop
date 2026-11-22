"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { formatPrice } from "@/lib/format";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowRightIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { products, isLoaded, error } = useCatalog();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.name, product.shortName, product.provenance].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [products, query]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy="search-dialog-title"
      panelClassName="sm:max-w-2xl sm:rounded-xl sm:border sm:border-outline-variant/40"
    >
      <div className="sticky top-0 z-10 border-b border-outline-variant/30 bg-surface-container-lowest/95 px-5 pb-4 pt-5 backdrop-blur sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Search the collection</p>
            <h2
              id="search-dialog-title"
              className="mt-1 font-display text-headline-md text-on-surface"
            >
              Find your fountain
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="icon-button -mr-1 -mt-1 shrink-0"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <label htmlFor="site-search-input" className="sr-only">
          Search fountains by name
        </label>
        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <SearchIcon size={19} />
          </span>
          <input
            id="site-search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by fountain name"
            autoComplete="off"
            data-autofocus
            className="field-input h-12 pl-11"
          />
        </div>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Try “Rustic”, “Bamboo”, or “Terracotta”.
        </p>
      </div>

      <div className="px-5 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <p className="font-label-sm uppercase tracking-widest text-on-surface-variant">
            {query.trim() ? "Matching fountains" : "All fountains"}
          </p>
          <span className="text-label-sm text-on-surface-variant" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>

        {!isLoaded ? (
          <p className="mt-4 rounded-lg bg-surface-container-low p-5 text-body-sm text-on-surface-variant">
            Loading the fountain catalog…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-error/25 bg-error-container p-5 text-body-sm text-on-error-container"
          >
            {error}
          </div>
        ) : results.length > 0 ? (
          <ul className="mt-3 divide-y divide-outline-variant/25">
            {results.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-surface-container-low/70"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                    <Image
                      src={product.image.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-sm uppercase tracking-widest text-primary">
                      {product.catalogNumber} • {product.provenance}
                    </p>
                    <p className="mt-0.5 font-display text-[19px] leading-6 text-on-surface">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-body-sm text-on-surface-variant">
                      {product.flowDescription}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="font-display text-[17px] text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-on-surface-variant transition-transform group-hover:translate-x-0.5">
                      <ArrowRightIcon size={17} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg bg-surface-container-low p-6 text-center">
            <p className="font-display text-headline-sm text-on-surface">
              No fountains match “{query.trim()}”
            </p>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Search by the fountain name, or browse the full handcrafted collection.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="btn btn-outline mt-4"
            >
              Show all fountains
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
