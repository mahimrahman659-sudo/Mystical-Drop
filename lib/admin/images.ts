import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/client";
import { MEDIA_COLLECTION, type StoredMedia } from "@/lib/admin/media";

export type ImageAsset = {
  value: string;
  label: string;
};

export async function listImageAssets(): Promise<ImageAsset[]> {
  const folder = path.join(process.cwd(), "public", "images");
  const files = await readdir(folder);
  return files
    .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({ value: `/images/${file}`, label: file }));
}

export async function isAllowedImageAsset(value: string): Promise<boolean> {
  if (!/^\/images\/[a-z0-9._-]+$/i.test(value)) return false;
  const assets = await listImageAssets();
  return assets.some((asset) => asset.value === value);
}

export async function isAllowedImageSource(value: string): Promise<boolean> {
  if (await isAllowedImageAsset(value)) return true;

  const match = /^\/api\/media\/([a-f0-9]{24})$/i.exec(value);
  if (!match) return false;

  const media = await getDb()
    .collection<StoredMedia>(MEDIA_COLLECTION)
    .findOne({ _id: new ObjectId(match[1]) }, { projection: { _id: 1 } });
  return Boolean(media);
}
