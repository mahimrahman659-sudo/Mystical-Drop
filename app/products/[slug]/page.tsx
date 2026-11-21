import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import { RelatedProductCard } from "@/components/products/RelatedProductCard";
import {
  DropletIcon,
  LeafIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { getActiveProducts, getProductBySlug } from "@/lib/db/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Fountain not found" };
  return {
    title: product.name,
    description: product.longDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const archived = product.status === "archived";
  const related = (await getActiveProducts()).filter(
    (candidate) => candidate.slug !== product.slug,
  );

  return (
    <div>
      <section className="site-container pb-space-xs pt-space-md">
        <div className="flex flex-col justify-between gap-space-xs text-label-md uppercase tracking-wider text-on-surface-variant sm:flex-row sm:items-center">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <Link href="/#collection" className="transition-colors hover:text-primary">
              Fountains
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <span className="font-semibold text-on-surface">{product.shortName}</span>
          </nav>
          <div className="flex items-center gap-2 self-start text-secondary sm:self-auto">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="text-label-sm uppercase tracking-wider">
              Hand-finished in Savar • Limited batch
            </span>
          </div>
        </div>
      </section>

      <section className="site-container py-space-md lg:py-space-lg">
        <div className="grid grid-cols-1 items-start gap-gutter lg:grid-cols-12 lg:gap-space-xl">
          <div className="lg:col-span-7">
            <ProductGallery product={product} />
          </div>

          <div className="flex flex-col gap-space-md lg:col-span-5 lg:pl-space-sm">
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-label-sm font-semibold uppercase tracking-wider ${
                      archived
                        ? "bg-surface-container-high text-on-surface-variant"
                        : "bg-secondary-container text-on-secondary-container"
                    }`}
                  >
                    {archived ? "Archived • Not orderable" : "In Stock • Small Batch"}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    Edition {product.catalogNumber} / 03
                  </span>
                </div>
                {!archived ? (
                  <FavoriteButton
                    slug={product.slug}
                    name={product.name}
                    variant="text"
                    className="min-h-9 px-3 py-1.5"
                  />
                ) : null}
              </div>
              <h1 className="pt-1 font-display text-headline-lg leading-tight tracking-tight text-on-surface">
                {product.name}
              </h1>
              <p lang="bn" className="native-name italic">
                {product.nativeName}
              </p>
              <div className="flex flex-wrap items-baseline gap-3 pt-space-xs">
                <span className="price text-[2.1rem] leading-none text-on-surface sm:text-display-md">
                  {formatPrice(product.price)}
                </span>
                <span className="text-label-md text-on-surface-variant">
                  (All local VAT & taxes included)
                </span>
              </div>
            </div>

            <p className="text-body-md leading-relaxed text-on-surface-variant">
              {product.longDescription}
            </p>

            <dl className="grid grid-cols-1 gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:grid-cols-2">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex min-w-0 flex-col">
                  <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                    {spec.label}
                  </dt>
                  <dd className="mt-0.5 text-body-sm font-semibold text-on-surface">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            {archived ? (
              <div className="rounded-xl bg-surface-container-low p-space-md">
                <p className="text-label-sm font-semibold uppercase tracking-wider text-primary">
                  Archived edition
                </p>
                <p className="mt-1 text-body-md leading-relaxed text-on-surface-variant">
                  This fountain is no longer available for new orders. Browse the
                  current collection or contact the studio about an existing order.
                </p>
                <Link href="/#collection" className="btn btn-outline mt-3">
                  Browse the collection
                </Link>
              </div>
            ) : (
              <ProductPurchase product={product} />
            )}

            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low/70 p-space-md">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-primary">
                  <TruckIcon size={21} />
                </span>
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-on-surface">
                    Free nationwide delivery
                  </span>
                  <span className="text-body-sm leading-relaxed text-on-surface-variant">
                    Complimentary insured courier delivery across Bangladesh.
                    Dhaka orders typically arrive within 24–48 hours; other
                    divisions in 3–4 working days.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-secondary">
                  <ShieldIcon size={21} />
                </span>
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-on-surface">
                    48-Hour In-Home Acoustic Testing Guarantee
                  </span>
                  <span className="text-body-sm leading-relaxed text-on-surface-variant">
                    Every unit undergoes acoustic testing in our atelier before
                    packaging. Enjoy a relaxed 48-hour acoustic return guarantee.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-tertiary">
                  <DropletIcon size={21} />
                </span>
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-on-surface">
                    1-Year Silent Pump Warranty
                  </span>
                  <span className="text-body-sm leading-relaxed text-on-surface-variant">
                    Complimentary motor replacement for electronic pump components
                    throughout Bangladesh.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-space-lg" aria-labelledby="care-heading">
        <div className="rounded-2xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg lg:p-space-xl">
          <div className="flex flex-col items-baseline justify-between gap-2 pb-space-md sm:flex-row">
            <div>
              <span className="eyebrow text-primary">Origins & Assembly</span>
              <h2
                id="care-heading"
                className="mt-1 font-display text-headline-md tracking-tight text-on-surface"
              >
                Artisan Narrative & Maintenance
              </h2>
            </div>
            <p className="text-label-sm text-on-surface-variant">
              Designed for decades of quiet resonance
            </p>
          </div>
          <div className="grid grid-cols-1 gap-space-lg pt-space-xs md:grid-cols-2">
            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:p-space-lg">
              <div className="flex items-center gap-2 text-label-md font-semibold uppercase tracking-wider text-primary">
                <SparkleIcon size={19} />
                <h3>1. Story & Organic Craftsmanship</h3>
              </div>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                {product.care.story}
              </p>
              <ul className="space-y-space-xs pt-space-xs text-body-sm text-on-surface">
                {product.care.storyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:p-space-lg">
              <div className="flex items-center gap-2 text-label-md font-semibold uppercase tracking-wider text-secondary">
                <LeafIcon size={19} />
                <h3>2. Quick Setup &amp; Bi-Weekly Care</h3>
              </div>
              <p className="text-body-md leading-relaxed text-on-surface-variant">
                {product.care.setup}
              </p>
              <div className="grid grid-cols-1 gap-space-sm pt-space-xs sm:grid-cols-2">
                <div className="rounded-lg bg-surface p-3">
                  <span className="block text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                    Water Type
                  </span>
                  <span className="mt-1 block text-body-sm text-on-surface-variant">
                    {product.care.water}
                  </span>
                </div>
                <div className="rounded-lg bg-surface p-3">
                  <span className="block text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                    Rinse Cycle
                  </span>
                  <span className="mt-1 block text-body-sm text-on-surface-variant">
                    {product.care.rinse}
                  </span>
                </div>
              </div>
              <p className="pt-1 text-label-sm italic leading-relaxed text-on-surface-variant">
                * {product.care.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="site-container pb-space-xl pt-space-lg"
        aria-labelledby="related-heading"
      >
        <div className="mb-space-md flex flex-col items-baseline justify-between gap-2 md:flex-row">
          <div>
            <span className="eyebrow text-primary">Limited Catalog</span>
            <h2
              id="related-heading"
              className="mt-1 font-display text-headline-lg tracking-tight text-on-surface"
            >
              Other Handcrafted Fountains
            </h2>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Complete the 3-piece artisanal indoor collection
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:gap-space-lg">
          {related.map((relatedProduct) => (
            <RelatedProductCard key={relatedProduct.slug} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
