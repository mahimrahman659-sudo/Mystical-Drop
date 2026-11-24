import type { CatalogProduct } from "@/lib/catalog";

export const MAX_QUANTITY_PER_ITEM = 10;
export const CART_STORAGE_KEY = "terranova-cart-v1";

export const FREE_SHIPPING = {
  amount: 0,
  label: "Free nationwide delivery",
  valueLabel: "Free",
  detail: "Complimentary on every order across Bangladesh",
} as const;

export type CartLine = {
  slug: string;
  quantity: number;
};

export type DetailedCartLine = CartLine & {
  product: CatalogProduct;
  /** `null` while the product has no confirmed price yet. */
  lineTotal: number | null;
};

export function normalizeQuantity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value <= 0) return null;
  return Math.min(MAX_QUANTITY_PER_ITEM, Math.max(1, Math.floor(value)));
}

export function sanitizeCart(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];

  const merged = new Map<string, number>();

  for (const rawLine of input) {
    if (!rawLine || typeof rawLine !== "object") continue;
    const { slug, quantity } = rawLine as Record<string, unknown>;
    if (typeof slug !== "string" || !slug.trim()) continue;
    const normalized = normalizeQuantity(quantity);
    if (normalized === null) continue;
    const existing = merged.get(slug) ?? 0;
    merged.set(slug, Math.min(MAX_QUANTITY_PER_ITEM, existing + normalized));
  }

  return Array.from(merged, ([slug, quantity]) => ({ slug, quantity }));
}

export function readStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    return sanitizeCart(JSON.parse(raw));
  } catch {
    return [];
  }
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadCart(): CartLine[] {
  return readStoredCart(safeStorage()?.getItem(CART_STORAGE_KEY) ?? null);
}

export function persistCart(lines: CartLine[]): void {
  try {
    safeStorage()?.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be unavailable in private or restricted contexts.
  }
}

export function clearPersistedCart(): void {
  try {
    safeStorage()?.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore storage access failures.
  }
}

export function addLine(lines: CartLine[], slug: string, quantity: number): CartLine[] {
  const amount = normalizeQuantity(quantity);
  if (amount === null) return lines;

  const current = lines.find((line) => line.slug === slug);
  const nextQuantity = Math.min(
    MAX_QUANTITY_PER_ITEM,
    (current?.quantity ?? 0) + amount,
  );

  if (!current) return [...lines, { slug, quantity: nextQuantity }];
  return lines.map((line) =>
    line.slug === slug ? { ...line, quantity: nextQuantity } : line,
  );
}

export function setLineQuantity(
  lines: CartLine[],
  slug: string,
  quantity: number,
): CartLine[] {
  const normalized = normalizeQuantity(quantity);
  if (normalized === null) {
    return lines.filter((line) => line.slug !== slug);
  }
  return lines.map((line) =>
    line.slug === slug ? { ...line, quantity: normalized } : line,
  );
}

export function detailedLines(
  lines: CartLine[],
  products: CatalogProduct[],
): DetailedCartLine[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  return lines.flatMap((line) => {
    const product = bySlug.get(line.slug);
    if (!product) return [];
    const unitPrice =
      typeof product.price === "number" && product.price > 0
        ? product.price
        : null;
    return [
      {
        ...line,
        product,
        lineTotal: unitPrice === null ? null : unitPrice * line.quantity,
      },
    ];
  });
}

export type CartTotals = {
  items: DetailedCartLine[];
  quantity: number;
  /** `null` when any line is unpriced — never displayed as zero. */
  subtotal: number | null;
  shipping: number;
  /** `null` when any line is unpriced — never displayed as zero. */
  total: number | null;
  /** True when the cart holds at least one product without a confirmed price. */
  hasUnpriced: boolean;
};

export function cartTotals(lines: CartLine[], products: CatalogProduct[]): CartTotals {
  const items = detailedLines(lines, products);
  const hasUnpriced = items.some((line) => line.lineTotal === null);
  const subtotal = hasUnpriced
    ? null
    : items.reduce<number>((sum, line) => sum + (line.lineTotal ?? 0), 0);
  const quantity = items.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = FREE_SHIPPING.amount;
  return {
    items,
    quantity,
    subtotal,
    shipping,
    total: subtotal === null ? null : subtotal + shipping,
    hasUnpriced,
  };
}

export function filterAvailableLines(
  lines: CartLine[],
  products: CatalogProduct[],
): CartLine[] {
  const slugs = new Set(products.map((product) => product.slug));
  return lines.filter((line) => slugs.has(line.slug));
}
