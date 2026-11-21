"use client";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2200;

export async function uploadAdminImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a JPEG, PNG, WebP, or AVIF image.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("The original image is too large. Choose a smaller file.");
  }

  const prepared = await prepareImage(file);
  if (prepared.size > MAX_UPLOAD_BYTES) {
    throw new Error("The image is still too large. Choose a smaller image.");
  }

  const body = new FormData();
  body.append("file", prepared, prepared.name || "image.webp");

  let response: Response;
  try {
    response = await fetch("/api/admin/media", { method: "POST", body });
  } catch {
    throw new Error("The image could not be uploaded. Check your connection.");
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: unknown;
    } | null;
    throw new Error(
      typeof payload?.message === "string"
        ? payload.message
        : "The image could not be uploaded. Please try again.",
    );
  }

  const payload = (await response.json()) as { url?: unknown };
  if (typeof payload.url !== "string" || !payload.url.startsWith("/api/media/")) {
    throw new Error("The upload service returned an invalid image.");
  }
  return payload.url;
}

async function prepareImage(file: File): Promise<File> {
  if (
    file.size <= 1_500_000 &&
    (file.type === "image/webp" ||
      file.type === "image/jpeg" ||
      file.type === "image/png")
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", 0.86);
    });
    if (!blob) return file;
    return new File([blob], "image.webp", { type: "image/webp" });
  } catch {
    return file;
  }
}
