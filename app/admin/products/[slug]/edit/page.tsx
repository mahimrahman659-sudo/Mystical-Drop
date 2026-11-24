import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminViewer } from "@/lib/admin/auth";
import { listImageAssets } from "@/lib/admin/images";
import { getProductForAdmin } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Edit product",
};

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;

  const { slug } = await params;
  const product = await getProductForAdmin(slug);
  if (!product) notFound();

  const images = await listImageAssets();
  const gallery = product.gallery
    .map((image) => image.src)
    .filter((src) => src !== product.image.src)
    .slice(0, 3);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
        <Link href="/admin/products" className="hover:text-primary">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span className="break-all text-on-surface">{product.name}</span>
      </nav>
      <h1 className="mt-2 font-display text-display-sm tracking-tight text-on-surface">
        Edit product
      </h1>
      <p className="mt-1 break-all text-body-sm text-on-surface-variant">
        /products/{product.slug} • {product.status}
      </p>
      <div className="mt-5">
        <ProductForm
          action={updateProductAction}
          mode="edit"
          currentSlug={product.slug}
          images={images}
          initial={{
            name: product.name,
            shortName: product.shortName,
            slug: product.slug,
            catalogNumber: product.catalogNumber,
            nativeName: product.nativeName,
            provenance: product.provenance,
            collectionLine: product.collectionLine,
            flowLabel: product.flowLabel,
            flowDescription: product.flowDescription,
            price: product.price === null ? "" : String(product.price),
            description: product.description,
            longDescription: product.longDescription,
            imageSrc: product.image.src,
            gallery1: gallery[0] ?? "",
            gallery2: gallery[1] ?? "",
            gallery3: gallery[2] ?? "",
            status: product.status,
          }}
        />
      </div>
    </div>
  );
}
