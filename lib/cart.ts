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
  lineTotal: number;
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
    return [
      {
        ...line,
        product,
        lineTotal: product.price * line.quantity,
      },
    ];
  });
}

export function cartTotals(lines: CartLine[], products: CatalogProduct[]) {
  const items = detailedLines(lines, products);
  const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
  const quantity = items.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = FREE_SHIPPING.amount;
  return {
    items,
    quantity,
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}

export function filterAvailableLines(
  lines: CartLine[],
  products: CatalogProduct[],
): CartLine[] {
  const slugs = new Set(products.map((product) => product.slug));
  return lines.filter((line) => slugs.has(line.slug));
}
