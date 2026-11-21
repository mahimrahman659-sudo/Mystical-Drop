import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import {
  DropletIcon,
  LeafIcon,
  SparkleIcon,
  TruckIcon,
  WavesIcon,
} from "@/components/ui/icons";
import { getActiveProducts } from "@/lib/db/products";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <>
      <section className="site-container pb-space-xl pt-space-md lg:pt-space-lg">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="flex flex-col gap-space-md lg:col-span-6 lg:pr-space-md">
            <div className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-secondary" />
              <p className="eyebrow text-secondary">
                Bengal Artisanal Stoneware • Limited Release
              </p>
            </div>
            <h1 className="max-w-xl font-display text-display-sm tracking-tight text-on-surface sm:text-display-md lg:text-display-lg lg:leading-[1.08]">
              Bring the Beauty of Flowing Water Into Your Home.
            </h1>
            <p className="max-w-xl text-body-lg leading-relaxed text-on-surface-variant">
              Discover beautifully handcrafted water fountains that bring nature,
              tranquility, and elegance to your living space. Hand-shaped in small
              batches and tuned for quiet domestic sanctuary.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
              <Link href="#collection" className="btn btn-primary px-6">
                Explore Our Products
              </Link>
              <Link href="#collection" className="btn btn-outline px-6">
                Shop Now
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-space-sm pt-space-md sm:grid-cols-3">
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-primary">
                  <SparkleIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  100% Handcrafted
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-secondary">
                  <WavesIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  Silent Submersible Pump
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded bg-surface-container-low p-3">
                <span className="text-tertiary">
                  <LeafIcon size={19} />
                </span>
                <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                  River Stones & Botanicals
                </span>
              </div>
            </div>
          </div>

          <div className="mt-space-md lg:col-span-6 lg:mt-0">
            <div className="group relative h-[360px] overflow-hidden rounded-xl bg-surface-container-low shadow-soft sm:h-[460px] lg:h-[560px]">
              <Image
                src="/images/triptych-study.jpg"
                alt="The three TerraNova handcrafted fountains arranged on a warm wooden study desk with plants, notebooks, and a reading lamp"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-inverse-surface/65 via-transparent to-transparent"
              />
              <span className="absolute right-4 top-4 rounded bg-surface-container-lowest/90 px-3 py-1.5 text-label-sm uppercase tracking-widest text-on-surface backdrop-blur">
                The Triptych • 3 Editions
              </span>
              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 rounded bg-surface-container-lowest/95 p-3.5 shadow-sm backdrop-blur sm:bottom-6 sm:left-6 sm:right-6 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
                    <WavesIcon size={20} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Acoustic Calibration
                    </span>
                    <span className="font-sans text-label-lg font-medium text-on-surface">
                      24–28 dB • Gentle Trickle
                    </span>
                  </div>
                </div>
                <div className="hidden items-center gap-1.5 rounded bg-surface-container px-3 py-1 text-label-sm font-semibold uppercase tracking-widest text-secondary xs:flex">
                  <span>Studio Verified</span>
                  <DropletIcon size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="scroll-mt-28 bg-surface-container-low py-space-xl"
      >
        <div className="site-container">
          <div className="mx-auto mb-space-xl flex max-w-2xl flex-col items-center text-center">
            <span className="eyebrow mb-2 text-primary">Exclusive Triptych</span>
            <h2 className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md">
              Our Three Handcrafted Fountains
            </h2>
            <p className="mt-3 max-w-lg text-body-md leading-relaxed text-on-surface-variant">
              Meticulously sculpted by local Bengal artisans. Each piece is tested
              for 48 hours for soothing acoustic resonance and gentle domestic
              moisture.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="site-container scroll-mt-28 py-space-xl"
        aria-labelledby="about-heading"
      >
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12 lg:gap-space-lg">
          <div className="order-2 lg:order-1 lg:col-span-6">
            <div className="relative h-[300px] overflow-hidden rounded-lg bg-surface-container shadow-sm sm:h-[400px]">
              <Image
                src="/images/artisan-workshop.jpg"
                alt="An artisan in a Dhaka workshop shaping a clay fountain base by hand, surrounded by terracotta vessels"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded bg-surface-container-lowest/90 p-3 backdrop-blur">
                <span className="text-primary">
                  <SparkleIcon size={21} />
                </span>
                <p className="text-label-sm font-semibold uppercase leading-4 tracking-wider text-on-surface">
                  Hand-carved in Dhaka, Bangladesh
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 flex flex-col gap-space-sm lg:order-2 lg:col-span-6 lg:pl-space-md">
            <span className="eyebrow text-primary">Artisanal Ethos</span>
            <h2
              id="about-heading"
              className="font-display text-[2rem] leading-tight tracking-tight text-on-surface sm:text-display-md"
            >
              Designed to Bring Peace Into Your Space.
            </h2>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              TerraNova was born from a singular obsession: to counteract the hurried
              cadence of modern city life through the restorative presence of
              running water. Rather than mass-manufacturing plastic decor, we
              produce only three distinct water fountain designs.
            </p>
            <p className="text-body-md leading-relaxed text-on-surface-variant">
              Each fountain merges handcrafted Bengal clay craft, natural river
              stone acoustic dissipation, and quiet pumps to bring pure kinetic
              stillness into your home, reading nook, or workspace.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pt-space-xs">
              <div className="flex flex-col">
                <span className="font-display text-headline-md font-semibold text-on-surface">
                  48h
                </span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Acoustic Testing
                </span>
              </div>
              <div aria-hidden="true" className="hidden h-10 w-px bg-outline/20 sm:block" />
              <div className="flex flex-col">
                <span className="font-display text-headline-md font-semibold text-on-surface">
                  100%
                </span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Lead-Free Materials
                </span>
              </div>
              <div aria-hidden="true" className="hidden h-10 w-px bg-outline/20 sm:block" />
              <div className="flex flex-col">
                <span className="font-display text-headline-md font-semibold text-on-surface">
                  3 Only
                </span>
                <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Bespoke Editions
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-space-xl">
        <div className="site-container grid grid-cols-1 gap-gutter md:grid-cols-3">
          <div className="flex flex-col items-start rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
            <div className="mb-space-sm flex h-12 w-12 items-center justify-center rounded bg-surface-container text-primary">
              <SparkleIcon size={25} />
            </div>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">
              Unique Handcrafted Designs
            </h3>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              Every piece carries unique hand-sculpted organic textures, kiln
              marks, and individual stone arrangements. No two fountains are
              identical.
            </p>
          </div>
          <div className="flex flex-col items-start rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
            <div className="mb-space-sm flex h-12 w-12 items-center justify-center rounded bg-secondary-container text-secondary">
              <LeafIcon size={25} />
            </div>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">
              Nature-Inspired Decoration
            </h3>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              Crafted with seasoned bamboo, tumbled river stones, live green
              plantings, and authentic unglazed clay that harmonizes with any
              interior.
            </p>
          </div>
          <div className="flex flex-col items-start rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
            <div className="mb-space-sm flex h-12 w-12 items-center justify-center rounded bg-surface-container text-tertiary">
              <TruckIcon size={25} />
            </div>
            <h3 className="mb-2 font-display text-headline-sm text-on-surface">
              Easy Ordering & Support
            </h3>
            <p className="text-body-sm leading-relaxed text-on-surface-variant">
              Nationwide delivery with reinforced break-free packaging and
              personal guidance for setup and care.
            </p>
          </div>
        </div>
      </section>

    </>
  );
}
