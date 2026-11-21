"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { WavesIcon } from "@/components/ui/icons";

export function ProductGallery({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = product.gallery[activeIndex];

  return (
    <div className="flex flex-col gap-space-md">
      <div className="relative overflow-hidden rounded-xl border border-on-surface/[0.05] bg-surface-container-low shadow-sm">
        <div className="relative min-h-[360px] w-full sm:min-h-[480px] lg:min-h-[560px]">
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            priority={activeIndex === 0}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 sm:left-4 sm:top-4">
            <span className="w-fit rounded bg-surface/90 px-3 py-1 text-label-sm uppercase tracking-widest text-on-surface shadow-sm backdrop-blur">
              Artisan Handcrafted in Savar, Bengal
            </span>
            <span className="flex w-fit items-center gap-1.5 rounded bg-surface-container/90 px-2.5 py-1 text-label-sm text-secondary backdrop-blur">
              <WavesIcon size={13} />
              {product.flowDescription}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-outline-variant/25 px-4 py-3 text-label-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse"
            />
            <span className="uppercase tracking-wider">
              Acoustic Tone: {product.flowDescription}
            </span>
          </div>
          <span className="font-display text-body-sm italic text-tertiary">
            № {product.catalogNumber} in Permanent Catalog
          </span>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {activeImage.label}: {activeImage.caption}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {product.gallery.map((image, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={image.src + image.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={selected}
              aria-label={`Show ${image.label}: ${image.caption}`}
              className={`group rounded-lg p-1.5 text-left transition-all ${
                selected
                  ? "bg-surface-container ring-2 ring-primary"
                  : "bg-surface-container-low ring-0 hover:bg-surface-container"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded bg-surface-container-lowest">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, 30vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-1.5 text-center">
                <p className="text-label-sm font-semibold text-on-surface">
                  {image.label}
                </p>
                <p className="text-[10px] leading-4 text-on-surface-variant">
                  {image.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
