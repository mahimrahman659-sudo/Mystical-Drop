import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAdminViewer } from "@/lib/admin/auth";
import { listImageAssets } from "@/lib/admin/images";
import { countActiveProducts, getAdminProducts } from "@/lib/db/products";
import { formatPrice } from "@/lib/format";
import { formatOrderDate } from "@/lib/orders";
import { setProductStatusAction } from "@/app/admin/products/actions";
import { ArrowRightIcon, PlusIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Products",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(input: string | string[] | undefined): string {
  return Array.isArray(input) ? input[0] ?? "" : input ?? "";
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const params = await searchParams;
  const query = value(params.q);
  const products = await getAdminProducts(query);
  const assets = await listImageAssets();
  const activeProducts = await countActiveProducts();
  const saved = value(params.saved);
  const error = value(params.error);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-primary">Catalog</p>
          <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface">
            Products
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {products.length} matching {products.length === 1 ? "product" : "products"} •{" "}
            {activeProducts} active in storefront
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          <PlusIcon size={16} />
          New product
        </Link>
      </div>

      {saved ? (
        <div role="status" className="mt-4 rounded border border-secondary/20 bg-secondary-container px-4 py-3 text-body-sm text-on-secondary-container">
          Product {saved === "created" ? "created" : saved === "updated" ? "updated" : "status changed"}.
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="mt-4 rounded border border-error/25 bg-error-container px-4 py-3 text-body-sm text-on-error-container">
          The product change could not be completed. Try again.
        </div>
      ) : null}

      <form className="mt-5 flex flex-col gap-2 rounded-lg border border-on-surface/[0.05] bg-surface-container-low p-3 sm:flex-row sm:items-end" method="get">
        <div className="flex-1">
          <label className="field-label" htmlFor="admin-product-search">
            Search products
          </label>
          <input
            id="admin-product-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Name, short name, or slug"
            className="field-input"
          />
        </div>
        <button type="submit" className="btn btn-outline">
          Search
        </button>
        {query ? (
          <Link href="/admin/products" className="btn btn-soft">
            Clear
          </Link>
        ) : null}
      </form>

      {products.length === 0 ? (
        <div className="mt-5 rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-8 text-center shadow-sm">
          <p className="font-display text-headline-sm text-on-surface">
            No products found
          </p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Try a different search or create a new product.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {products.map((product) => {
            const currentImage = assets.find((asset) => asset.value === product.image.src);
            return (
              <li
                key={product.slug}
                className="flex flex-col gap-4 rounded-lg border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-surface-container">
                  <Image
                    src={product.image.src}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-headline-sm text-on-surface">
                      {product.name}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        product.status === "active"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <p className="mt-0.5 break-all text-label-sm text-on-surface-variant">
                    /products/{product.slug} • {product.catalogNumber} •{" "}
                    {currentImage?.label ?? product.image.src}
                  </p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {formatPrice(product.price)} • Updated{" "}
                    {formatOrderDate(
                      new Date(product.updatedAt).toISOString(),
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/products/${product.slug}/edit`}
                    className="btn btn-outline min-h-10 px-3 py-2 text-label-md"
                  >
                    Edit
                  </Link>
                  <form action={setProductStatusAction}>
                    <input type="hidden" name="slug" value={product.slug} />
                    <input
                      type="hidden"
                      name="status"
                      value={product.status === "active" ? "archived" : "active"}
                    />
                    <button
                      type="submit"
                      className={`btn min-h-10 px-3 py-2 text-label-md ${
                        product.status === "active"
                          ? "border-error/30 bg-transparent text-error hover:bg-error-container"
                          : "btn-soft"
                      }`}
                    >
                      {product.status === "active" ? "Archive" : "Restore"}
                    </button>
                  </form>
                  <Link
                    href={`/products/${product.slug}`}
                    className="btn btn-soft min-h-10 px-3 py-2 text-label-md"
                  >
                    View
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
