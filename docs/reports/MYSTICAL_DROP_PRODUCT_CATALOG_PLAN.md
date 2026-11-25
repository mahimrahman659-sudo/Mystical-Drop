# Mystical Drop — Product Catalog Plan

**Updated:** 2026-11-25 · Prices set and P01/P02 photos delivered by owner via admin · Names still pending

---

## 1. The three original products

| Internal ID (slug) | Draft customer name (⚠ not final) | Short name | Catalog no. | Price | Photo status |
|---|---|---|---|---|---|
| `fountain-01` | Rustic Miniature Well Fountain | Miniature Well | 01 | **৳399** (owner-set via admin, 2026-11-25) | **Original uploaded via admin** → also mirrored as `public/images/fountain-01.jpg` (1650×2200). Verified: not a logo, not a duplicate of any existing asset. |
| `fountain-02` | Twin-Bowl Cascade Fountain | Twin-Bowl Cascade | 02 | **৳399** (owner-set via admin, 2026-11-25) | **Original uploaded via admin** → mirrored as `public/images/fountain-02.jpg` (1254×1254). Placeholder retired. Verified: not a logo, not a duplicate. |
| `fountain-03` | Woodland Tree & Well Fountain | Woodland Tree & Well | 03 | **৳399** (owner-set via admin, 2026-11-25) | `rustic-well.jpg` + `rustic-wellhead.jpg` — real photos matching the owner's visual description. No new upload needed. |

**Naming rule:** draft names are still in force — a visible **"Draft name"** badge renders on product pages (`DRAFT_NAME_SLUGS` in `lib/products.ts`). Clear the set when final names are approved.

**Seed policy:** `lib/products.ts` now mirrors production (৳399 + confirmed photos) so fresh installs match reality. A disaster-recovery `setup:db` therefore restores a sellable catalog at the confirmed price. E2E price-hiding tests explicitly unprice via `unpriceTestProducts()`; commerce tests keep their own test prices via `priceTestProducts()`.

## 2. Price & purchase policy (implemented)

- `Product.price` type is now `number | null`. **`null` = price not confirmed.**
- Public surfaces render **"Price Coming Soon"** (`formatPrice(null)` never renders ৳0): product cards, product page, search, favorites, cart lines, order summary, related cards, admin list.
- **Add to Cart / Instant Buy disabled** for unpriced products; `CartProvider.addItem` refuses unpriced slugs (defense in depth).
- Cart with any unpriced line: notice shown, **checkout button replaced with disabled "Checkout unavailable — price pending"**; CheckoutView client-guards submit.
- Server enforcement: `createOrder` throws `409 PRICE_UNAVAILABLE` for any active product whose price is not a positive integer — forged totals, `expectedTotal: 0`, and mixed carts are all rejected (covered by `tests/price-hiding.spec.ts`).
- Admin: price field accepts **empty → null**; `0` still rejected with "Price must be greater than zero." Setting a price alone does not make a product purchasable — purchase also requires `status: "active"` (publication) and integer > 0 (validation) via `isPurchasable()` in `lib/catalog.ts`.
- Historical orders untouched: snapshots keep their stored `unitPrice`/`lineTotal`; order reads are unaffected by null prices.

## 3. Copy rules applied to catalog records

- **Observable characteristics only** — no inferred materials ("stone-textured", "coconut-shell-style", "woodland-inspired" per owner descriptions; never "made of resin/clay/stone").
- Removed from all records: dB ratings, material lists, pump voltage claims, "hand-thrown", Savar/Kiln claims, triptych gallery entry.
- `specs` = single honest row: "Dimensions, materials, and pump details to be confirmed".
- `care.setup/water/rinse/note` = empty (page hides the block); `care.story/storyPoints` = verified design-inspiration notes.
- `nativeName` = "" (Bengali names dropped — inventing them would be fabricated branding; UI renders conditionally).
- `provenance` = "Original Design"; `flowDescription` = neutral water-path descriptions (no acoustics).

## 4. Image handling rules (applied)

- Only real photographs of the actual products; **no AI/stock substitutes** (`bamboo-*`, `terracotta-*`, `triptych-study`, `artisan-workshop` no longer referenced by the catalog or new pages; files preserved).
- Placeholder for fountain-02 is a **clearly labeled UI graphic**, not a simulated product photo.
- Homepage default banner switched from AI triptych to `rustic-well.jpg` (admin can still override via Site banner).
- Gallery thumbnails hidden when a product has a single image; placeholder images use `object-contain`.

## 5. What the owner must supply (blocks full Phase 2)

1. `1000014235.jpg`, `1000014236.jpg`, `1000013855.jpg` (or any copies of the three originals).
2. Confirmation whether `rustic-lifestyle.jpg` **is** the Product 01 original.
3. Final product names → then clear `DRAFT_NAME_SLUGS`.
4. Verified prices → then set per product in admin (product becomes purchasable only when active + priced).

## 6. Admin capabilities confirmed

Product name/short name/slug/catalog number/style line/collection line/flow labels/descriptions/price (nullable)/images (file or upload)/status — all editable; archive/restore only (no delete); new-product form defaults price empty and catalog number `04`.
