export const BRAND_NAME = "Mystical Drop";
export const BRAND_SLUG = "mystical-drop";
export const BRAND_TAGLINE = "Artisanal Water Features";

const LEGACY_BRAND_NAME = "TerraNova";

export function rebrandLegacyText(value: string): string {
  return value.replaceAll(LEGACY_BRAND_NAME, BRAND_NAME);
}
