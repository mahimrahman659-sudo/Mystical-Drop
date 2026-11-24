# Mystical Drop — Implementation Summary

**Date:** 2026-11-24 · Branch `review/mystical-drop-audit-rebrand` · Local changes only — **nothing committed, pushed, or deployed.**

**Scale:** 33 files modified (+1,177 / −692 lines), 4 new paths added.

---

## 1. Data & price safety (Phase 1)

| File | Change |
|---|---|
| `lib/products.ts` | **Full rewrite** — three original products (`fountain-01..03`), `price: number \| null`, `DRAFT_NAME_SLUGS`, observable-only copy, honest specs/care, `care` now optional |
| `lib/format.ts` | `formatPrice(null)` → "Price Coming Soon"; `isPriced()`; `PRICE_COMING_SOON` const — **every price call site became null-safe for free** |
| `lib/catalog.ts` | Added `isPurchasable()` (active ∧ integer price > 0) |
| `lib/cart.ts` | `DetailedCartLine.lineTotal: number \| null`; `cartTotals` returns nullable subtotal/total + `hasUnpriced` — missing price never summed as zero |
| `lib/db/orders.ts` | `createOrder` rejects unpriced products with `409 PRICE_UNAVAILABLE` (server-side enforcement) |
| `lib/db/products.ts` | `ProductWriteInput.price: number \| null`; auto-generated features/specs/care de-claimed (no dB/pump/material assertions) |
| `app/admin/products/actions.ts` | Zod `price` preprocess: `"" → null`, `0 → "Price must be greater than zero."` |
| `app/admin/products/[slug]/edit/page.tsx` | Null price → empty form value (was `"null"`) |
| `components/admin/ProductForm.tsx` | Field labels/hints updated (flow description, nullable price guidance) |

## 2. UI price gating (Phase 1/4)

`ProductCard`, `RelatedProductCard` (price label + disabled Add), `ProductPurchase` (full unpriced panel with collection/contact CTAs), `CartProvider.addItem` (refuses unpriced), `CartView` (per-line Coming Soon, unpriced notice, disabled checkout button), `CheckoutView` (submit guard). Search/favorites/admin list inherit null-safe `formatPrice`.

## 3. Product showcase (Phase 2/4)

- Images: added `public/images/photograph-pending.png` (generated placeholder, 800×1000); **removed** mis-copied `woodland-well-angle.jpg` after screenshot review caught it was an unrelated desk scene; gallery for fountain-03 = two verified photos.
- `ProductGallery`: removed "Artisanal Handcrafted in Savar"/"Acoustic Tone"/"Permanent Catalog" copy; thumbnails hidden for single-image galleries; `object-contain` for placeholder.
- Product page: full rewrite (see content report §2).

## 4. Pages & navigation (Phase 3/5/6)

- `app/page.tsx` — full 8-section rewrite (+2 unpublished draft sections behind flags).
- `app/about/page.tsx` — **new** ("Our Story").
- `app/innovation/page.tsx` — **new** (NPD presentation).
- `SiteHeader` / `MobileMenu` — 5-item nav; desktop nav breakpoint `md → lg` (768px overflow prevention).
- `SiteFooter` — rewritten (contact/checkout columns, conditional Bengali name, working links).
- `app/layout.tsx` — honest metadata; `lib/db/site-settings.ts` — default banner → real product photo.
- `lib/orders.ts` — demo delivery estimate ("Not scheduled") replacing 24–48h promise.
- `app/account/page.tsx`, `ConfirmationView`, `CheckoutView`, `CartView` — claim removal + copy rewrite.
- `app/globals.css` — `rise-in` entrance animation (auto-disabled by existing `prefers-reduced-motion` block).

## 5. Tests (Phase 8)

- **Migration:** all specs mapped to new slugs/names (`fountain-01↔4200`, `fountain-02↔3850`, `fountain-03↔3450` — totals unchanged); `priceTestProducts()` helper makes commerce tests opt into a priced catalog (seed is unpriced, matching production intent); `getProductPrice`/`createGuestOrderViaApi` now fail loudly on unpriced products.
- **New:** `tests/price-hiding.spec.ts` (2 tests — catalog null prices, disabled buttons, no ৳ on pages, cart/checkout blocking, forged-total/zero/mixed-cart API rejection).
- **New:** `tests/visual-screenshots.spec.ts` (16 full-page screenshots at 390px/1440px into `test-results/screenshots/`).
- **Robustness:** homepage `networkidle` waits → `load` + `waitForAppReady` (Playwright-recommended; eliminates load-induced flakes); `waitForImages` now scrolls + reports exact failing sources; SMTP test gained a loopback retry.

## 6. Deliberately NOT changed

Order documents/history, order references (`TNV-`), localStorage keys (`terranova-*`), HMAC prefix, auth flow, payment/demo flags, admin promotion flow, privacy draft, `.env*`, dependencies, lockfile, deploy config. No commits.
