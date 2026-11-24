# Mystical Drop — Product Catalog Plan

**Date:** 2026-11-24 · Status: **implemented locally** (owner confirmation pending on names/prices/photos)

---

## 1. The three original products

| Internal ID (slug) | Draft customer name (⚠ not final) | Short name | Catalog no. | Price | Photo status |
|---|---|---|---|---|---|
| `fountain-01` | Rustic Miniature Well Fountain | Miniature Well | 01 | **null** (Coming Soon) | `public/images/rustic-lifestyle.jpg` — **matches the owner's visual description** (stone-textured well, hanging bucket, wooden crossbar, blue illumination). Provenance vs. `1000014235.jpg` **UNCONFIRMED** — owner to verify. |
| `fountain-02` | Twin-Bowl Cascade Fountain | Twin-Bowl Cascade | 02 | **null** (Coming Soon) | **MISSING** — honest placeholder `public/images/photograph-pending.png` ("Original photograph coming soon"). No real photo exists anywhere on the machine. |
| `fountain-03` | Woodland Tree & Well Fountain | Woodland Tree & Well | 03 | **null** (Coming Soon) | `rustic-well.jpg` (main) + `rustic-wellhead.jpg` (detail) — real photos matching the owner's visual description (tree trunk, roots, miniature stone well, elevated bowl). |

**Naming rule:** draft names are descriptive labels derived from the owner's visual descriptions. A visible **"Draft name"** badge renders on product pages for all three (`DRAFT_NAME_SLUGS` in `lib/products.ts`). Clear the set when final names are approved. Names are also flagged on the homepage collection section ("Product names shown are working drafts").

**Do not treat draft names as finalized branding.**

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
