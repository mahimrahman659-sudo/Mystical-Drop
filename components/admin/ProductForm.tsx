"use client";

import { useActionState, useId } from "react";
import type { ImageAsset } from "@/lib/admin/images";
import type { ProductFormState } from "@/lib/admin/product-form";
import { FormMessage } from "@/components/auth/AuthFields";
import { ImageField } from "@/components/admin/ImageField";
import { BRAND_NAME } from "@/lib/brand";

type ProductFormValues = {
  name: string;
  shortName: string;
  slug: string;
  catalogNumber: string;
  nativeName: string;
  provenance: string;
  collectionLine: string;
  flowLabel: string;
  flowDescription: string;
  price: string;
  description: string;
  longDescription: string;
  imageSrc: string;
  gallery1: string;
  gallery2: string;
  gallery3: string;
  status: string;
};

type ProductFormProps = {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  mode: "create" | "edit";
  currentSlug?: string;
  initial: ProductFormValues;
  images: ImageAsset[];
};

function Field({
  name,
  label,
  defaultValue,
  error,
  hint,
  type = "text",
  rows,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  type?: string;
  rows?: number;
}) {
  const id = useId();
  const shared = {
    id,
    name,
    defaultValue,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: "field-input",
  };

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label} <span className="text-primary">*</span>
      </label>
      {rows ? (
        <textarea {...shared} rows={rows} />
      ) : (
        <input {...shared} type={type} />
      )}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-label-sm text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function ProductForm({
  action,
  mode,
  currentSlug,
  initial,
  images,
}: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const errors = state.fieldErrors ?? {};
  const v = (name: keyof ProductFormValues, fallback: string) =>
    state.values?.[name] ?? fallback;
  const formKey = state.values ? JSON.stringify(state.values) : "initial";

  return (
    <form key={formKey} action={formAction} className="space-y-5">
      {mode === "edit" && currentSlug ? (
        <input type="hidden" name="currentSlug" value={currentSlug} />
      ) : null}

      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <h2 className="font-display text-headline-sm text-on-surface">
          Identity
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            name="name"
            label="Product name"
            defaultValue={v("name", initial.name)}
            error={errors.name}
          />
          <Field
            name="shortName"
            label="Short name"
            defaultValue={v("shortName", initial.shortName)}
            error={errors.shortName}
            hint="Used in cart rows and account order lists."
          />
          <Field
            name="slug"
            label="URL slug"
            defaultValue={v("slug", initial.slug)}
            error={errors.slug}
            hint="Lowercase letters, numbers, and hyphens. Changing it breaks old links."
          />
          <Field
            name="catalogNumber"
            label="Catalog number"
            defaultValue={v("catalogNumber", initial.catalogNumber)}
            error={errors.catalogNumber}
            hint="Numeric code used for ordering, such as 04."
          />
          <Field
            name="nativeName"
            label="Bengali / native name"
            defaultValue={v("nativeName", initial.nativeName)}
            error={errors.nativeName}
          />
          <div>
            <label className="field-label" htmlFor="product-status">
              Availability <span className="text-primary">*</span>
            </label>
            <select
              id="product-status"
              name="status"
              defaultValue={v("status", initial.status)}
              className="field-input"
            >
              <option value="active">Active — purchasable</option>
              <option value="archived">Archived — not purchasable</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <h2 className="font-display text-headline-sm text-on-surface">
          Storefront copy
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            name="provenance"
            label="Provenance / material line"
            defaultValue={v("provenance", initial.provenance)}
            error={errors.provenance}
          />
          <Field
            name="collectionLine"
            label="Collection line"
            defaultValue={v("collectionLine", initial.collectionLine)}
            error={errors.collectionLine}
          />
          <Field
            name="flowLabel"
            label="Flow badge"
            defaultValue={v("flowLabel", initial.flowLabel)}
            error={errors.flowLabel}
            hint="Short label such as “Trickle”."
          />
          <Field
            name="flowDescription"
            label="Acoustic description"
            defaultValue={v("flowDescription", initial.flowDescription)}
            error={errors.flowDescription}
            hint="Example: 24 dB Gentle Trickle."
          />
          <div className="sm:col-span-2">
            <Field
              name="description"
              label="Card description"
              defaultValue={v("description", initial.description)}
              error={errors.description}
              rows={3}
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              name="longDescription"
              label="Product page description"
              defaultValue={v("longDescription", initial.longDescription)}
              error={errors.longDescription}
              rows={4}
            />
          </div>
          <Field
            name="price"
            label="Price (BDT)"
            type="number"
            defaultValue={v("price", initial.price)}
            error={errors.price}
            hint="Whole Taka. The ৳ symbol is rendered by the storefront."
          />
        </div>
      </div>

      <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <h2 className="font-display text-headline-sm text-on-surface">
          Images
        </h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Choose an existing {BRAND_NAME} asset or upload a new image. The main
          image is shown on storefront product cards.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageField
            name="imageSrc"
            label="Main image"
            defaultValue={v("imageSrc", initial.imageSrc)}
            images={images}
            error={errors.imageSrc}
          />
          <ImageField
            name="gallery1"
            label="Gallery image 1"
            defaultValue={v("gallery1", initial.gallery1)}
            images={images}
            error={errors.gallery1}
            optional
          />
          <ImageField
            name="gallery2"
            label="Gallery image 2"
            defaultValue={v("gallery2", initial.gallery2)}
            images={images}
            error={errors.gallery2}
            optional
          />
          <ImageField
            name="gallery3"
            label="Gallery image 3"
            defaultValue={v("gallery3", initial.gallery3)}
            images={images}
            error={errors.gallery3}
            optional
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save product"}
        </button>
        <a href="/admin/products" className="btn btn-outline">
          Cancel
        </a>
      </div>
    </form>
  );
}
