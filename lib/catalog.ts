import { rebrandLegacyText } from "./brand";
import type { Product } from "@/lib/products";

export const PRODUCT_STATUSES = ["active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type StoredProduct = Product & {
  seedId?: string;
  status: ProductStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CatalogProduct = Product & {
  status: ProductStatus;
};

export function toCatalogProduct(product: StoredProduct): CatalogProduct {
  return {
    slug: product.slug,
    name: product.name,
    shortName: product.shortName,
    price: product.price,
    catalogNumber: product.catalogNumber,
    provenance: product.provenance,
    flowLabel: product.flowLabel,
    flowDescription: product.flowDescription,
    collectionLine: product.collectionLine,
    nativeName: product.nativeName,
    description: product.description,
    longDescription: product.longDescription,
    features: product.features,
    image: {
      ...product.image,
      alt: rebrandLegacyText(product.image.alt),
    },
    cartImage: product.cartImage,
    gallery: product.gallery.map((image) => ({
      ...image,
      alt: rebrandLegacyText(image.alt),
    })),
    specs: product.specs,
    included: product.included,
    care: product.care,
    status: product.status,
  };
}
