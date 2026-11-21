import type { Metadata } from "next";
import Link from "next/link";
import { createProductAction } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminViewer } from "@/lib/admin/auth";
import { listImageAssets } from "@/lib/admin/images";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  const viewer = await getAdminViewer();
  if (viewer.status !== "admin") return null;
  const images = await listImageAssets();

  return (
    <div>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
        <Link href="/admin/products" className="hover:text-primary">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-on-surface">New product</span>
      </nav>
      <h1 className="mt-2 font-display text-display-sm tracking-tight text-on-surface">
        New product
      </h1>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Product details are stored in MongoDB and appear on the storefront immediately.
      </p>
      <div className="mt-5">
        <ProductForm
          action={createProductAction}
          mode="create"
          images={images}
          initial={{
            name: "",
            shortName: "",
            slug: "",
            catalogNumber: "04",
            nativeName: "",
            provenance: "Handcrafted Stoneware",
            collectionLine: "Handcrafted • Gentle Flow",
            flowLabel: "Trickle",
            flowDescription: "Gentle domestic trickle",
            price: "",
            description: "",
            longDescription: "",
            imageSrc: images[0]?.value ?? "",
            gallery1: "",
            gallery2: "",
            gallery3: "",
            status: "active",
          }}
        />
      </div>
    </div>
  );
}
