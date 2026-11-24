# Mystical Drop — Owner Decisions Required

**Date:** 2026-11-24 · Nothing below was invented or decided on your behalf. Items are ordered by blocking severity.

---

## A. Blocking (needed before this work is "complete")

| # | Decision / asset | Why it blocks | What happens meanwhile |
|---|---|---|---|
| A1 | **Supply the three original photos** `1000014235.jpg`, `1000014236.jpg`, `1000013855.jpg` (or copies) | Phase 2 image integration was stopped per instructions — files not found anywhere on this machine | fountain-02 shows an honest "photograph coming soon" placeholder; P01/P03 use best-available real photos |
| A2 | **Confirm whether `public/images/rustic-lifestyle.jpg` is the Product 01 original** (well + bucket + crossbar + blue glow — matches your description exactly, provenance unverified) | If it's an AI/stock render, it must be swapped for the true original | Currently displayed as fountain-01's photo |
| A3 | **Final product names** for fountain-01/02/03 | Draft names are labelled as drafts everywhere; must not ship as final branding | Draft names + "Draft name" badges; clear `DRAFT_NAME_SLUGS` after approval |
| A4 | **Confirmed prices** (or explicit "keep Coming Soon") | Prices drive purchase availability | All prices null → storefront fully non-purchasable (by design); admin can set price + keep status Active to open ordering |

## B. High — trust & legal

| # | Decision | Notes |
|---|---|---|
| B1 | **Privacy policy approval** | Page is an explicit draft ("owner approval required") — kept unpublished-looking per its own text; needed for Google OAuth verification |
| B2 | **Support email address** | Removed the "to be confirmed" footer row; add a real address when you have one (footer Contact column is ready) |
| B3 | **Terms page** | Dead "Terms & Acoustic Trial" footer text removed; no Terms exist — create one before any real selling |
| B4 | **Free nationwide delivery policy** | Store config says free/৳0 and the UI states it; confirm this is your intended policy (it also feeds the checkout math) |
| B5 | **Studio address** | Footer shows `7/8-A Free School Street, Hatirpool, Dhaka-1205` (from your earlier commit). Confirm it's public-safe; it's the only location claim left on the site |

## C. Medium — presentation polish

| # | Decision | Notes |
|---|---|---|
| C1 | **Development journey section** | Fully built but unpublished (`SHOW_DEVELOPMENT_JOURNEY=false` in `app/page.tsx`) — flip to `true` when you can support the stages with records/photos |
| C2 | **Demonstration video** | Draft section ready (`SHOW_DEMONSTRATION=false`) — supply a real video and we embed it; no fake player was shipped |
| C3 | **Team section (About page)** | Built but unpublished (`SHOW_TEAM_SECTION=false`) — needs verified member names/roles/bios |
| C4 | **Bengali product names** | Removed (were tied to demo products, inventing new ones would be fabricated branding) — provide if wanted; UI already renders them when present |
| C5 | **"Artisanal Pieces Ordered"** heading on confirmations | Kept (not a factual claim, tests assert it) — change if you prefer neutral "Fountains Ordered" |
| C6 | **Production catalog cleanup** | On deploy, the old demo products (bamboo/rustic/terracotta) still in the production DB must be archived so only the three originals show — admin archive or a one-off script at release time |

## D. Informational (no action needed)

- Storage keys (`terranova-*`) and order prefixes (`TNV-`) intentionally kept so existing carts/orders keep working.
- No order emails exist in the product (only verification/reset) — add order mailers only when you're ready to run a real store.
- Render/Vercel settings, `.env`, dependencies, and lockfile were not touched.
