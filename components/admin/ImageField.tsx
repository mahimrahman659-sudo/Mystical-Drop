"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import type { ImageAsset } from "@/lib/admin/images";
import { uploadAdminImage } from "@/lib/admin/upload-client";

type ImageFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  images: ImageAsset[];
  error?: string;
  optional?: boolean;
};

export function ImageField({
  name,
  label,
  defaultValue,
  images,
  error,
  optional = false,
}: ImageFieldProps) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const options = images.some((image) => image.value === value)
    ? images
    : value
      ? [{ value, label: "Uploaded image" }, ...images]
      : images;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      setValue(url);
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "The image could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}{" "}
        {optional ? (
          <span className="font-normal normal-case tracking-normal text-on-surface-variant">
            (Optional)
          </span>
        ) : (
          <span className="text-primary">*</span>
        )}
      </label>

      <input type="hidden" name={name} value={value} />

      <div className="flex flex-wrap items-center gap-2">
        <select
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="field-input min-w-0 flex-1"
        >
          {optional ? <option value="">No image</option> : null}
          {!value && !optional ? <option value="">Choose an image</option> : null}
          {options.map((image) => (
            <option key={image.value} value={image.value}>
              {image.label}
            </option>
          ))}
        </select>
        <label className="btn btn-outline cursor-pointer whitespace-nowrap">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            aria-label={`Upload ${label}`}
            className="sr-only"
            disabled={uploading}
            onChange={handleFile}
          />
          {uploading ? "Uploading…" : "Upload image"}
        </label>
      </div>

      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
      {uploadError ? (
        <p className="field-error" role="alert">
          {uploadError}
        </p>
      ) : null}
      {uploading ? (
        <p className="mt-1 text-label-sm text-on-surface-variant" role="status">
          Processing and uploading the image…
        </p>
      ) : null}

      {value ? (
        <div className="mt-2 overflow-hidden rounded-lg border border-outline-variant/35 bg-surface-container-low">
          <Image
            src={value}
            alt={`${label} preview`}
            width={480}
            height={300}
            unoptimized
            className="h-36 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
