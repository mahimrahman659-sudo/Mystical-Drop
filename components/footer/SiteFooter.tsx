import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { BRAND_NAME } from "@/lib/brand";
import { getActiveProducts } from "@/lib/db/products";

export async function SiteFooter() {
  let products: CatalogProduct[] = [];
  let catalogUnavailable = false;
  try {
    products = await getActiveProducts();
  } catch {
    catalogUnavailable = true;
  }

  return (
    <footer
      id="contact"
      className="mt-space-xl w-full scroll-mt-28 bg-surface-container-low pb-space-lg pt-space-xl"
    >
      <div className="site-container">
        <div className="grid grid-cols-1 gap-gutter pb-space-xl sm:grid-cols-2 lg:grid-cols-4 lg:gap-space-lg">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-headline-sm text-on-surface">
                {BRAND_NAME}
              </span>
            </div>
            <p className="max-w-xs text-body-sm leading-relaxed text-on-surface-variant">
              Original decorative tabletop water fountains — nature-inspired
              designs developed and made in-house by our team.
            </p>
            <div className="pt-space-xs">
              <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Studio
              </p>
              <p className="mt-1 text-body-sm text-on-surface">
                7/8-A Free School Street, Hatirpool, Dhaka-1205
              </p>
            </div>
          </div>

          <nav aria-labelledby="footer-fountains-heading" className="flex flex-col gap-space-sm">
            <h2
              id="footer-fountains-heading"
              className="text-label-sm uppercase tracking-wider text-on-surface-variant"
            >
              Our Fountains
            </h2>
            <ul className="space-y-space-xs text-body-sm">
              {products.map((product) => (
                <li key={product.slug} className="flex flex-col">
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-on-surface transition-colors hover:text-primary"
                  >
                    {product.catalogNumber}. {product.shortName}
                    {product.nativeName ? (
                      <span lang="bn" className="font-bengali text-primary">
                        {" "}
                        ({product.nativeName})
                      </span>
                    ) : null}
                  </Link>
                  <span className="text-label-sm text-on-surface-variant">
                    {product.collectionLine}
                  </span>
                </li>
              ))}
              {products.length === 0 ? (
                <li className="text-on-surface-variant">
                  {catalogUnavailable
                    ? "The fountain collection is temporarily unavailable."
                    : "No fountains are currently listed."}
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Contact
            </h2>
            <p className="max-w-sm text-body-sm leading-relaxed text-on-surface-variant">
              Questions about the designs, specifications, or availability?
              Reach us by phone — we are happy to help.
            </p>
            <div className="space-y-space-xs pt-space-xs text-body-sm">
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Phone:</span>{" "}
                <a
                  href="tel:01646886795"
                  className="underline-offset-2 transition-colors hover:text-primary hover:underline"
                >
                  01646886795
                </a>
              </p>
              <p className="text-on-surface-variant">
                Care guides will be published with the final product
                specifications.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Checkout
            </h2>
            <p className="max-w-xs text-body-sm leading-relaxed text-on-surface-variant">
              This storefront runs a demo checkout with Cash on Delivery across
              Bangladesh. No payment is collected online, and ordering opens
              once prices are announced.
            </p>
            <div className="pt-space-xs">
              <p className="mb-space-xs text-label-sm uppercase tracking-wider text-on-surface-variant">
                Payment methods
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-surface px-2 py-1 text-label-sm text-on-surface">
                  Cash on Delivery
                </span>
                {["bKash", "Nagad", "Visa", "Mastercard"].map((method) => (
                  <span
                    key={method}
                    className="rounded bg-surface/60 px-2 py-1 text-label-sm text-on-surface-variant"
                    title="Not available in this demo"
                  >
                    {method}
                    <span className="sr-only"> (unavailable in this demo)</span>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-label-sm text-on-surface-variant">
                Demo storefront • Cash on Delivery only
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/30 pt-space-lg sm:flex-row">
          <p className="text-center text-label-sm leading-5 text-on-surface-variant sm:text-left">
            © 2026 {BRAND_NAME}. Original designs by our team. Demo storefront.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-1">
            <Link
              href="/about"
              className="text-label-sm text-on-surface-variant underline-offset-2 transition-colors hover:text-on-surface hover:underline"
            >
              Our Story
            </Link>
            <Link
              href="/innovation"
              className="text-label-sm text-on-surface-variant underline-offset-2 transition-colors hover:text-on-surface hover:underline"
            >
              Our Innovation
            </Link>
            <Link
              href="/privacy"
              className="text-label-sm text-on-surface-variant underline-offset-2 transition-colors hover:text-on-surface hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
