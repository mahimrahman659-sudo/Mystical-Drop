import "server-only";

import { getDb } from "@/lib/db/client";
import {
  PRODUCT_STATUSES,
  toCatalogProduct,
  type CatalogProduct,
  type ProductStatus,
  type StoredProduct,
} from "@/lib/catalog";
import type { Product } from "@/lib/products";

export const PRODUCT_COLLECTION = "products";

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  const docs = await getDb()
    .collection<StoredProduct>(PRODUCT_COLLECTION)
    .find({ status: "active" })
    .sort({ catalogNumber: 1 })
    .toArray();
  return docs.map(toCatalogProduct);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const doc = await getDb()
    .collection<StoredProduct>(PRODUCT_COLLECTION)
    .findOne({ slug });
  return doc ? toCatalogProduct(doc) : null;
}

export async function getProductForAdmin(slug: string): Promise<StoredProduct | null> {
  return getDb().collection<StoredProduct>(PRODUCT_COLLECTION).findOne({ slug });
}

export async function getAdminProducts(query = ""): Promise<StoredProduct[]> {
  const trimmed = query.trim();
  const filter = trimmed
    ? {
        $or: [
          { name: { $regex: escapeRegex(trimmed), $options: "i" } },
          { slug: { $regex: escapeRegex(trimmed), $options: "i" } },
          { shortName: { $regex: escapeRegex(trimmed), $options: "i" } },
        ],
      }
    : {};

  return getDb()
    .collection<StoredProduct>(PRODUCT_COLLECTION)
    .find(filter)
    .sort({ catalogNumber: 1, createdAt: 1 })
    .toArray();
}

export async function countActiveProducts(): Promise<number> {
  return getDb().collection(PRODUCT_COLLECTION).countDocuments({ status: "active" });
}

export type ProductWriteInput = {
  name: string;
  shortName: string;
  slug: string;
  catalogNumber: string;
  nativeName: string;
  provenance: string;
  collectionLine: string;
  flowLabel: string;
  flowDescription: string;
  price: number;
  description: string;
  longDescription: string;
  imageSrc: string;
  gallerySources: string[];
  status: ProductStatus;
};

export async function createProduct(input: ProductWriteInput): Promise<StoredProduct> {
  const now = new Date();
  const product: Omit<Product, "gallery"> & {
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    _id?: string;
    seedId?: string;
    gallery: StoredProduct["gallery"];
  } = {
    name: input.name,
    shortName: input.shortName,
    slug: input.slug,
    catalogNumber: input.catalogNumber,
    nativeName: input.nativeName,
    provenance: input.provenance,
    collectionLine: input.collectionLine,
    flowLabel: input.flowLabel,
    flowDescription: input.flowDescription,
    price: input.price,
    description: input.description,
    longDescription: input.longDescription,
    status: input.status,
    createdAt: now,
    updatedAt: now,
    image: {
      src: input.imageSrc,
      alt: `${input.name} — handcrafted TerraNova water fountain`,
    },
    cartImage: input.gallerySources[0] || input.imageSrc,
    gallery: buildGallery(input.name, input.imageSrc, input.gallerySources),
    features: [
      "Hand-finished small-batch piece",
      "Quiet submersible pump",
      "Natural stone and clay detailing",
    ],
    specs: [
      { label: "Dimensions", value: "Contact the studio for sizing" },
      { label: "Acoustic Decibel", value: input.flowDescription },
      { label: "Material Build", value: input.provenance },
      { label: "Acoustic Pump", value: "Low-voltage silent submersible" },
    ],
    included: ["Low-voltage silent submersible pump"],
    care: {
      story:
        "Each TerraNova piece is assembled and finished by hand in the studio. Natural variation in surface, tone, and stone arrangement is part of the work.",
      storyPoints: [
        "Hand-finished details unique to this edition",
        "Quiet pump selected for domestic rooms",
        "Stable base keeps the fountain steady in daily use",
      ],
      setup:
        "Set the fountain on a level, water-resistant surface. Fill the reservoir, submerge the pump, and connect the water line before plugging it into a standard outlet.",
      water:
        "Filtered or RO water is recommended to reduce mineral residue.",
      rinse:
        "Wipe the basin with a soft cloth and rinse the stones every two weeks.",
      note: "Never run the pump dry. Empty and dry the fountain before storage.",
    },
  };

  await getDb()
    .collection(PRODUCT_COLLECTION)
    .insertOne(product as StoredProduct);

  return product as StoredProduct;
}

export async function updateProduct(
  currentSlug: string,
  input: ProductWriteInput,
): Promise<StoredProduct | null> {
  const current = await getProductForAdmin(currentSlug);
  if (!current) return null;

  const updatedAt = new Date();
  const update = {
    name: input.name,
    shortName: input.shortName,
    slug: input.slug,
    catalogNumber: input.catalogNumber,
    nativeName: input.nativeName,
    provenance: input.provenance,
    collectionLine: input.collectionLine,
    flowLabel: input.flowLabel,
    flowDescription: input.flowDescription,
    price: input.price,
    description: input.description,
    longDescription: input.longDescription,
    status: input.status,
    image: {
      ...current.image,
      src: input.imageSrc,
      alt: `${input.name} — handcrafted TerraNova water fountain`,
    },
    cartImage: input.gallerySources[0] || input.imageSrc,
    gallery: buildGallery(input.name, input.imageSrc, input.gallerySources, current.gallery),
    updatedAt,
  };

  await getDb()
    .collection(PRODUCT_COLLECTION)
    .updateOne({ slug: currentSlug }, { $set: update });

  return { ...current, ...update } as StoredProduct;
}

export async function setProductStatus(
  slug: string,
  status: ProductStatus,
): Promise<boolean> {
  if (!PRODUCT_STATUSES.includes(status)) return false;
  const result = await getDb()
    .collection(PRODUCT_COLLECTION)
    .updateOne({ slug }, { $set: { status, updatedAt: new Date() } });
  return result.matchedCount === 1;
}

function buildGallery(
  name: string,
  imageSrc: string,
  sources: string[],
  previous?: StoredProduct["gallery"],
): StoredProduct["gallery"] {
  const unique = Array.from(new Set([imageSrc, ...sources].filter(Boolean))).slice(0, 3);
  return unique.map((src, index) => ({
    src,
    alt: previous?.[index]?.src === src ? previous[index].alt : `${name} — view ${index + 1}`,
    label: previous?.[index]?.src === src ? previous[index].label : `View ${String(index + 1).padStart(2, "0")}`,
    caption:
      previous?.[index]?.src === src
        ? previous[index].caption
        : index === 0
          ? "Main View"
          : "Studio View",
  }));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
