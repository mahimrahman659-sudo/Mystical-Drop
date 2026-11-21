import "server-only";

import { Binary, ObjectId } from "mongodb";
import sharp from "sharp";
import { getDb } from "@/lib/db/client";

export const MEDIA_COLLECTION = "media";

const MAX_RAW_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;
const SUPPORTED_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

type SharpImage = ReturnType<typeof sharp>;
type SharpMetadata = Awaited<ReturnType<SharpImage["metadata"]>>;

export type StoredMedia = {
  _id: ObjectId;
  data: Binary;
  contentType: "image/webp";
  filename: string;
  width: number;
  height: number;
  size: number;
  createdAt: Date;
  createdBy: string;
};

export type SavedImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export class MediaUploadError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MediaUploadError";
    this.status = status;
  }
}

export async function saveUploadedImage(input: {
  buffer: Buffer;
  filename: string;
  uploadedBy: string;
}): Promise<SavedImage> {
  if (input.buffer.length === 0) {
    throw new MediaUploadError(400, "Choose an image file to upload.");
  }
  if (input.buffer.length > MAX_RAW_BYTES) {
    throw new MediaUploadError(
      413,
      "The original image is too large. Choose an image under 8 MB.",
    );
  }

  let image: SharpImage;
  try {
    image = sharp(input.buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000,
      animated: false,
    });
  } catch {
    throw new MediaUploadError(415, "Choose a supported image file.");
  }

  let metadata: SharpMetadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new MediaUploadError(415, "Choose a supported image file.");
  }

  if (
    !metadata.format ||
    !SUPPORTED_FORMATS.has(metadata.format) ||
    !metadata.width ||
    !metadata.height
  ) {
    throw new MediaUploadError(
      415,
      "Use a JPEG, PNG, WebP, or AVIF image.",
    );
  }

  let quality = 86;
  let output = await image
    .rotate()
    .resize({
      width: 2200,
      height: 2200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  while (output.data.length > MAX_OUTPUT_BYTES && quality > 68) {
    quality -= 6;
    output = await sharp(input.buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000,
      animated: false,
    })
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toBuffer({ resolveWithObject: true });
  }

  if (output.data.length > MAX_OUTPUT_BYTES) {
    throw new MediaUploadError(
      413,
      "The processed image is too large. Choose a smaller image.",
    );
  }

  const _id = new ObjectId();
  const filename = `${sanitizeFilename(input.filename)}.webp`;
  const document: StoredMedia = {
    _id,
    data: new Binary(output.data),
    contentType: "image/webp",
    filename,
    width: output.info.width,
    height: output.info.height,
    size: output.data.length,
    createdAt: new Date(),
    createdBy: input.uploadedBy,
  };

  await getDb().collection<StoredMedia>(MEDIA_COLLECTION).insertOne(document);

  return {
    id: _id.toHexString(),
    url: `/api/media/${_id.toHexString()}`,
    width: output.info.width,
    height: output.info.height,
  };
}

function sanitizeFilename(value: string): string {
  const base = value.replace(/\.[^.]+$/, "").toLowerCase();
  const cleaned = base.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 60) || "image";
}
