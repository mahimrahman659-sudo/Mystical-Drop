import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

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
