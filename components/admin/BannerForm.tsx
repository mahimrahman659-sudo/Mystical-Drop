"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import type { ImageAsset } from "@/lib/admin/images";
import type { BannerFormState } from "@/lib/admin/banner-form";
import { FormMessage } from "@/components/auth/AuthFields";
import { ImageField } from "@/components/admin/ImageField";

type BannerFormProps = {
  action: (
    state: BannerFormState,
    formData: FormData,
  ) => Promise<BannerFormState>;
  initialImageSrc: string;
  initialImageAlt: string;
  images: ImageAsset[];
};

export function BannerForm({
  action,
  initialImageSrc,
  initialImageAlt,
  images,
}: BannerFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const id = useId();

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      {state.success ? (
        <FormMessage tone="success">{state.success}</FormMessage>
      ) : null}

      <div className="rounded-xl border border-on-surface/[0.05] bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <h2 className="font-display text-headline-sm text-on-surface">
          Homepage banner
        </h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          This image appears in the main storefront banner. Upload a new image
          or choose one from the existing asset library.
        </p>

        <div className="mt-4 space-y-4">
          <ImageField
            name="imageSrc"
            label="Banner image"
            defaultValue={initialImageSrc}
            images={images}
          />

          <div>
            <label className="field-label" htmlFor={id}>
              Banner image description <span className="text-primary">*</span>
            </label>
            <input
              id={id}
              name="imageAlt"
              defaultValue={initialImageAlt}
              className="field-input"
              maxLength={180}
              required
            />
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Used by screen readers and search engines. Describe what is
              visible in the image.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Saving…" : "Save banner"}
        </button>
        <Link href="/" className="btn btn-outline">
          View storefront
        </Link>
      </div>
    </form>
  );
}
