const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const PRICE_COMING_SOON = "Price Coming Soon";

export function isPriced(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Formats a BDT price. Unpriced products (`null`) render as
 * "Price Coming Soon" — a missing price is never shown as zero. */
export function formatPrice(value: number | null | undefined): string {
  if (!isPriced(value)) return PRICE_COMING_SOON;
  return `৳${priceFormatter.format(Math.round(value))}`;
}

export function formatCount(value: number, singular: string, plural?: string) {
  return `${value} ${value === 1 ? singular : plural ?? `${singular}s`}`;
}
