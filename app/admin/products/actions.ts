"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminAction } from "@/lib/admin/auth";
import type { ProductFormState } from "@/lib/admin/product-form";
import { isAllowedImageAsset } from "@/lib/admin/images";
import { getDb } from "@/lib/db/client";
import {
  createProduct,
  PRODUCT_COLLECTION,
  setProductStatus,
  updateProduct,
} from "@/lib/db/products";
import { PRODUCT_STATUSES } from "@/lib/catalog";

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  shortName: z.string().trim().min(2, "Enter a short name.").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug.")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  catalogNumber: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Use a short numeric catalog code."),
  nativeName: z.string().trim().max(120),
  provenance: z.string().trim().min(2, "Enter a material or provenance line.").max(120),
  collectionLine: z.string().trim().min(2, "Enter the collection line.").max(160),
  flowLabel: z.string().trim().min(2, "Enter a flow label.").max(50),
  flowDescription: z.string().trim().min(2, "Enter the acoustic description.").max(120),
  price: z.coerce
    .number()
    .int("Use a whole BDT amount.")
    .min(1, "Price must be greater than zero.")
    .max(10_000_000),
  description: z.string().trim().min(20, "Add a short storefront description.").max(1000),
  longDescription: z.string().trim().min(20, "Add a longer description.").max(3000),
  imageSrc: z.string().trim().min(1, "Choose a main image."),
  gallery1: z.string().trim().optional(),
  gallery2: z.string().trim().optional(),
  gallery3: z.string().trim().optional(),
  status: z.enum(PRODUCT_STATUSES),
});

function readForm(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ]),
  );
}

async function parseProductForm(formData: FormData): Promise<
  | { ok: true; data: z.infer<typeof productSchema>; values: Record<string, string> }
  | { ok: false; state: ProductFormState }
> {
  const values = readForm(formData);
  const parsed = productSchema.safeParse(values);
  const fieldErrors: Record<string, string> = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      state: {
        error: "Review the highlighted product fields.",
        fieldErrors,
        values,
      },
    };
  }

  const imageFields = [
    parsed.data.imageSrc,
    parsed.data.gallery1,
    parsed.data.gallery2,
    parsed.data.gallery3,
  ].filter((value): value is string => Boolean(value));

  for (const source of imageFields) {
    if (!(await isAllowedImageAsset(source))) {
      return {
        ok: false,
        state: {
          error: "Choose image files from the TerraNova asset library.",
          fieldErrors: { imageSrc: "Use an existing TerraNova image asset." },
          values,
        },
      };
    }
  }

  return { ok: true, data: parsed.data, values };
}

function gallerySources(data: z.infer<typeof productSchema>): string[] {
  return [data.gallery1, data.gallery2, data.gallery3].filter(
    (value): value is string => Boolean(value),
  );
}

function revalidateCatalog(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
}

export async function createProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminAction();
  const parsed = await parseProductForm(formData);
  if (!parsed.ok) return parsed.state;

  const existing = await getDb()
    .collection(PRODUCT_COLLECTION)
    .findOne({ slug: parsed.data.slug });
  if (existing) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Choose a unique slug." },
      values: parsed.values,
    };
  }

  try {
    await createProduct({
      name: parsed.data.name,
      shortName: parsed.data.shortName,
      slug: parsed.data.slug,
      catalogNumber: parsed.data.catalogNumber,
      nativeName: parsed.data.nativeName,
      provenance: parsed.data.provenance,
      collectionLine: parsed.data.collectionLine,
      flowLabel: parsed.data.flowLabel,
      flowDescription: parsed.data.flowDescription,
      price: parsed.data.price,
      description: parsed.data.description,
      longDescription: parsed.data.longDescription,
      imageSrc: parsed.data.imageSrc,
      gallerySources: gallerySources(parsed.data),
      status: parsed.data.status,
    });
  } catch {
    return {
      error:
        "The product could not be created. Check the slug and image choices, then try again.",
      fieldErrors: {},
      values: parsed.values,
    };
  }

  revalidateCatalog(parsed.data.slug);
  redirect("/admin/products?saved=created");
}

export async function updateProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminAction();
  const currentSlug = String(formData.get("currentSlug") || "");
  if (!currentSlug) {
    return { error: "The product identifier is missing." };
  }

  const parsed = await parseProductForm(formData);
  if (!parsed.ok) return parsed.state;

  const conflict = await getDb()
    .collection(PRODUCT_COLLECTION)
    .findOne({ slug: parsed.data.slug });
  if (conflict && conflict.slug !== currentSlug) {
    return {
      error: "That slug is already in use.",
      fieldErrors: { slug: "Choose a unique slug." },
      values: parsed.values,
    };
  }

  const updated = await updateProduct(currentSlug, {
    name: parsed.data.name,
    shortName: parsed.data.shortName,
    slug: parsed.data.slug,
    catalogNumber: parsed.data.catalogNumber,
    nativeName: parsed.data.nativeName,
    provenance: parsed.data.provenance,
    collectionLine: parsed.data.collectionLine,
    flowLabel: parsed.data.flowLabel,
    flowDescription: parsed.data.flowDescription,
    price: parsed.data.price,
    description: parsed.data.description,
    longDescription: parsed.data.longDescription,
    imageSrc: parsed.data.imageSrc,
    gallerySources: gallerySources(parsed.data),
    status: parsed.data.status,
  });

  if (!updated) {
    return { error: "The product could not be found.", values: parsed.values };
  }

  revalidateCatalog(currentSlug);
  if (parsed.data.slug !== currentSlug) revalidateCatalog(parsed.data.slug);
  redirect("/admin/products?saved=updated");
}

export async function setProductStatusAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const slug = String(formData.get("slug") || "");
  const status = String(formData.get("status") || "");
  if (!slug || (status !== "active" && status !== "archived")) {
    redirect("/admin/products?error=invalid");
  }

  const updated = await setProductStatus(slug, status);
  revalidateCatalog(slug);
  redirect(
    `/admin/products?${updated ? "saved=status" : "error=missing"}`,
  );
}
