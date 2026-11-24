# Mystical Drop — Content Overhaul Record

**Date:** 2026-11-24 · Every customer-facing surface reviewed; claims limited to verifiable statements.

---

## 1. Homepage (`app/page.tsx`) — full rewrite, 8 sections

1. **Hero** — "Bring Nature's Beauty Into Your Space." + mandated supporting copy; CTAs "Explore Our Fountains" / "Our Story"; badges: Original Designs · Made In-House · Nature-Inspired; banner overlay: "{n} Original Designs" + "Designed & made in-house" (dB/Studio-Verified/Triptych badges removed).
2. **Collection** — "Little Fountains. Beautiful Details." + mandated description + draft-name/price disclaimer note; dynamic empty state.
3. **Difference** — "Made by Us. Inspired by Nature." + 4 verified differentiator cards (original concepts, nature-inspired design, tabletop format, in-house production).
4. **Concept** — "Nature-Inspired Details for Everyday Spaces." + placement chips (Desks/Shelves/Side tables/Home interiors/Gift displays) per approved copy.
5. **Development Journey** — "From an Idea to Something Real." 5-stage draft section, **unpublished** behind `SHOW_DEVELOPMENT_JOURNEY = false` until evidence supplied.
6. **Craftsmanship** — "Thoughtfully Designed. Made by Our Team." (published; real product photo; no invented methods/workshop photo).
7. **Demonstration** — draft video section, **unpublished** behind `SHOW_DEMONSTRATION = false` (no fake player rendered).
8. **Closing CTA** — "Discover the Details." + "Explore the Collection".

Removed: "Bengal Artisanal Stoneware" eyebrow, "100% Handcrafted/Silent Pump/River Stones" badges, "48h/Lead-Free" stats, "Hand-carved in Dhaka" badge, "No two fountains identical" and "break-free packaging" cards, `#about` block (moved to `/about`).

## 2. Product detail page (`app/products/[slug]/page.tsx`) — rewritten

Breadcrumb + "Original design • Made in-house"; status badge (Available / **Coming Soon** / Archived) + Edition number + **Draft name** badge; price block = price or **"Price Coming Soon"** (VAT claim removed); long description; **Distinctive details** list; honest specs row; purchase area (disabled notice + collection/contact CTAs when unpriced); info panel = free delivery (store config) / in-house design / **Contact us** (replaces 3 false guarantees); Design Notes section (inspiration + honest "Specifications & care coming soon"); related = "More Original Fountains" (no "3-piece" hardcode). Removed: "Hand-finished in Savar", "Made to Order • Small Batch", "decades of quiet resonance", "Artisan Narrative & Maintenance" claim copy.

## 3. Cart (`components/cart/CartView.tsx`)

Headings kept for continuity ("Your Peaceful Cart", "Your Cart is Currently Empty"). New: unpriced notice + **disabled checkout button**; "Original designs, made in-house" info card (replaces Safe Transit Guarantee); summary rows cleaned (removed "Acoustic In-Home Setup", "duties & insurance", acoustic trial note → demo-checkout note); tagline "Original tabletop fountains, made in-house"; empty-state copy no longer hardcodes "three limited-edition hand-carved".

## 4. Checkout (`components/checkout/CheckoutView.tsx`)

Client guard blocks submit while any line is unpriced; removed "digital warranty card" email hint, "Cash-on-delivery processing fee", "Inclusive of all local taxes", acoustic-inspection & shockproof pledges → "Original designs, made in-house" + "Demo checkout" info. Demo banners retained (accurate).

## 5. Order confirmation (`components/checkout/ConfirmationView.tsx`)

Removed "Acoustic calibration setup" and "COD processing fee" line items; steps rewritten: Order Confirmation / Packaging & Dispatch / Delivery Call (all framed "would" + "Not started in this demo"). "Estimated Delivery" now stores "Not scheduled · Demo preview — no delivery is arranged" (`lib/orders.ts::fulfillmentEstimate`) — removes the unverified 24–48h promise. Demo disclaimers kept (accurate).

## 6. Navigation & footer

- Nav (desktop + mobile): **Home · Our Fountains · Our Innovation · Our Story · Contact**; desktop nav breakpoint moved `md → lg` to prevent 768px overflow with 5 items.
- Footer: brand blurb rewritten (no "stoneware/acoustic/hand-carved"); Contact column with phone link + care-guide note (removed "to be confirmed" email row and acoustic guarantee); Checkout column honest demo wording; product list renders Bengali name only when present; bottom links: Our Story · Our Innovation · Privacy Policy (removed dead "Terms & Acoustic Trial"); copyright "Original designs by our team. Demo storefront."

## 7. New pages

- **`/about`** — "Small Creations, Inspired by Nature." with owner-provided narrative, "What we do" cards, unpublished team section (`SHOW_TEAM_SECTION = false`).
- **`/innovation`** — full NPD presentation (see `MYSTICAL_DROP_NPD_PRESENTATION_CONTENT.md`).

## 8. Site-wide sweep results

- Root metadata: honest description/keywords/OG (removed "meditative calm, acoustic stillness, artisanal stoneware").
- Account page: removed MongoDB jargon from customer note.
- Admin product form: "Acoustic description" → "Water flow description" (no dB example); "Provenance / material line" → "Style / provenance line"; price hint documents null behavior.
- Emails (verification/reset): reviewed — already neutral, unchanged.
- Auth pages, login/register/privacy/404: reviewed — no unsupported claims found; privacy draft left intact (flagged for owner).
- Storage keys (`terranova-*`) and order prefix (`TNV-`) intentionally unchanged to preserve existing customer carts/orders.

## 9. Flagged for owner (not changed)

Privacy policy publication approval · support email · Terms page · free-shipping policy confirmation · whether "Artisanal Pieces Ordered" wording on confirmations should change (kept — tests + not a factual claim).
