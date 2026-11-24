import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import { RelatedProductCard } from "@/components/products/RelatedProductCard";
import {
  InfoIcon,
  LeafIcon,
  PhoneIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { formatPrice, isPriced } from "@/lib/format";
import { getActiveProducts, getProductBySlug } from "@/lib/db/products";
import { DRAFT_NAME_SLUGS } from "@/lib/products";

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
  const purchasable = !archived && isPriced(product.price);
  const draftName = DRAFT_NAME_SLUGS.has(product.slug);
  const related = (await getActiveProducts()).filter(
    (candidate) => candidate.slug !== product.slug,
  );
  const care = product.care;

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
              Our Fountains
            </Link>
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            <span className="font-semibold text-on-surface">{product.shortName}</span>
          </nav>
          <div className="flex items-center gap-2 self-start text-secondary sm:self-auto">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span className="text-label-sm uppercase tracking-wider">
              Original design • Made in-house
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
                        : purchasable
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-primary-fixed text-primary"
                    }`}
                  >
                    {archived
                      ? "Archived • Not orderable"
                      : purchasable
                        ? "Available to order"
                        : "Coming Soon"}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    Edition {product.catalogNumber}
                  </span>
                  {draftName ? (
                    <span
                      className="rounded border border-outline-variant/70 px-2 py-0.5 text-label-sm uppercase tracking-wider text-on-surface-variant"
                      title="This name is a working draft and has not been finally approved."
                    >
                      Draft name
                    </span>
                  ) : null}
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
              {product.nativeName ? (
                <p lang="bn" className="native-name italic">
                  {product.nativeName}
                </p>
              ) : null}
              <div className="flex flex-wrap items-baseline gap-3 pt-space-xs">
                {isPriced(product.price) ? (
                  <>
                    <span className="price text-[2.1rem] leading-none text-on-surface sm:text-display-md">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-label-md text-on-surface-variant">
                      Price in Bangladeshi Taka
                    </span>
                  </>
                ) : (
                  <span className="font-display text-[1.7rem] leading-none text-on-surface-variant sm:text-headline-lg">
                    Price Coming Soon
                  </span>
                )}
              </div>
            </div>

            <p className="text-body-md leading-relaxed text-on-surface-variant">
              {product.longDescription}
            </p>

            <ul className="flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md">
              <li className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Distinctive details
              </li>
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-body-sm leading-relaxed text-on-surface"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <dl className="grid grid-cols-1 gap-space-sm rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-md sm:grid-cols-2">
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
                  This fountain is not available for new orders. Browse the
                  current collection or contact us about an existing order.
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
                    Delivery across Bangladesh is included at no extra cost when
                    ordering opens.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-secondary">
                  <LeafIcon size={21} />
                </span>
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-on-surface">
                    Original design, made by our team
                  </span>
                  <span className="text-body-sm leading-relaxed text-on-surface-variant">
                    This piece is part of our own original collection — designed
                    and produced in-house by Mystical Drop.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-tertiary">
                  <PhoneIcon size={21} />
                </span>
                <div className="flex flex-col">
                  <span className="text-body-sm font-semibold text-on-surface">
                    Questions before ordering?
                  </span>
                  <span className="text-body-sm leading-relaxed text-on-surface-variant">
                    <Link
                      href="/#contact"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      Contact us
                    </Link>{" "}
                    — we are happy to share details, photographs, and updates.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {care?.story ? (
        <section
          className="site-container py-space-lg"
          aria-labelledby="design-notes-heading"
        >
          <div className="rounded-2xl border border-on-surface/[0.05] bg-surface-container-lowest p-space-md shadow-sm sm:p-space-lg lg:p-space-xl">
            <div className="flex flex-col items-baseline justify-between gap-2 pb-space-md sm:flex-row">
              <div>
                <span className="eyebrow text-primary">Design Notes</span>
                <h2
                  id="design-notes-heading"
                  className="mt-1 font-display text-headline-md tracking-tight text-on-surface"
                >
                  Inspiration & Craftsmanship
                </h2>
              </div>
              <p className="text-label-sm text-on-surface-variant">
                Full specifications to be published soon
              </p>
            </div>
            <div className="grid grid-cols-1 gap-space-lg pt-space-xs md:grid-cols-2">
              <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:p-space-lg">
                <div className="flex items-center gap-2 text-label-md font-semibold uppercase tracking-wider text-primary">
                  <SparkleIcon size={19} />
                  <h3>Design inspiration</h3>
                </div>
                <p className="text-body-md leading-relaxed text-on-surface-variant">
                  {care.story}
                </p>
                {care.storyPoints.length > 0 ? (
                  <ul className="space-y-space-xs pt-space-xs text-body-sm text-on-surface">
                    {care.storyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex flex-col gap-space-sm rounded-xl bg-surface-container-low p-space-md sm:p-space-lg">
                <div className="flex items-center gap-2 text-label-md font-semibold uppercase tracking-wider text-secondary">
                  <InfoIcon size={19} />
                  <h3>Specifications & care</h3>
                </div>
                <p className="text-body-md leading-relaxed text-on-surface-variant">
                  Dimensions, materials, pump details, and a full care guide will
                  be published here once they are confirmed. We would rather
                  share verified information than guesswork.
                </p>
                <div className="rounded-lg bg-surface p-3">
                  <span className="block text-label-sm font-semibold uppercase tracking-wider text-on-surface">
                    Care guide
                  </span>
                  <span className="mt-1 block text-body-sm text-on-surface-variant">
                    Coming with the final specifications.
                  </span>
                </div>
                <p className="pt-1 text-label-sm italic leading-relaxed text-on-surface-variant">
                  Looking for details now?{" "}
                  <Link
                    href="/#contact"
                    className="font-medium not-italic text-primary underline underline-offset-2"
                  >
                    Contact us
                  </Link>{" "}
                  and we will share what we can.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section
          className="site-container pb-space-xl pt-space-lg"
          aria-labelledby="related-heading"
        >
          <div className="mb-space-md flex flex-col items-baseline justify-between gap-2 md:flex-row">
            <div>
              <span className="eyebrow text-primary">The Collection</span>
              <h2
                id="related-heading"
                className="mt-1 font-display text-headline-lg tracking-tight text-on-surface"
              >
                More Original Fountains
              </h2>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Explore the rest of our original designs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:gap-space-lg">
            {related.map((relatedProduct) => (
              <RelatedProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
