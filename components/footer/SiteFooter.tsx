import Link from "next/link";
import { getActiveProducts } from "@/lib/db/products";

export async function SiteFooter() {
  const products = await getActiveProducts();

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
                TerraNova
              </span>
            </div>
            <p className="max-w-xs text-body-sm leading-relaxed text-on-surface-variant">
              Artisanal stoneware indoor fountains designed for meditative calm,
              acoustic stillness, and mindful spaces. Hand-carved in limited
              batches.
            </p>
            <div className="pt-space-xs">
              <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Dhaka Studio
              </p>
              <p className="mt-1 text-body-sm text-on-surface">
                House 24, Road 11, Banani, Dhaka 1213
              </p>
            </div>
          </div>

          <nav aria-labelledby="footer-fountains-heading" className="flex flex-col gap-space-sm">
            <h2
              id="footer-fountains-heading"
              className="text-label-sm uppercase tracking-wider text-on-surface-variant"
            >
              The 3 Fountains
            </h2>
            <ul className="space-y-space-xs text-body-sm">
              {products.map((product) => (
                <li key={product.slug} className="flex flex-col">
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-on-surface transition-colors hover:text-primary"
                  >
                    {product.catalogNumber}. {product.shortName}{" "}
                    <span lang="bn" className="font-bengali text-primary">
                      ({product.nativeName})
                    </span>
                  </Link>
                  <span className="text-label-sm text-on-surface-variant">
                    {product.collectionLine}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Care & Guarantee
            </h2>
            <p className="max-w-sm text-body-sm leading-relaxed text-on-surface-variant">
              Experience water resonance in your home. Every TerraNova fountain
              includes our complimentary 48-Hour In-Home Acoustic Testing
              Guarantee and artisan setup guidance.
            </p>
            <div className="space-y-space-xs pt-space-xs text-body-sm">
              <p className="break-words text-on-surface">
                <span className="text-on-surface-variant">Support:</span>{" "}
                care@terranova.example
              </p>
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Concierge:</span> +880
                1711 000000
              </p>
              <p className="text-label-sm text-on-surface-variant">
                Placeholder contact details from the demo design.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Artisanal Checkout
            </h2>
            <p className="max-w-xs text-body-sm leading-relaxed text-on-surface-variant">
              Cash on Delivery demo with doorstep delivery throughout Bangladesh.
              Online payments are not connected in this demo.
            </p>
            <div className="pt-space-xs">
              <p className="mb-space-xs text-label-sm uppercase tracking-wider text-on-surface-variant">
                Payment Partners
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
            © 2026 TerraNova. Handcrafted with reverence in Dhaka. Demo
            storefront.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-1">
            <span className="text-label-sm text-on-surface-variant">
              Terms & Acoustic Trial
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
