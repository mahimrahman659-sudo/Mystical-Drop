const priceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return `৳${priceFormatter.format(Math.round(value))}`;
}

export function formatCount(value: number, singular: string, plural?: string) {
  return `${value} ${value === 1 ? singular : plural ?? `${singular}s`}`;
}
