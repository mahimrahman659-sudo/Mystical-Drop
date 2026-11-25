# Mystical Drop — Owner Decisions Required

**Updated:** 2026-11-25 · **Resolved since first release:** A1 (photos delivered via admin upload), A2 (moot — `rustic-lifestyle.jpg` no longer used as P01's main image), A4 (prices set: **৳399 each** on all three fountains; ordering is live). Remaining items below.

---

## A. Open — presentation completeness

| # | Decision / asset | Why it matters | What happens meanwhile |
|---|---|---|---|
| A1′ | **Named source files** `1000014235/4236/3855.jpg` were never located on this machine | Your admin uploads are now live and verified (not logos, not duplicates), but the byte-original files with those names still aren't archived anywhere findable | Store the three files somewhere durable (cloud drive) for your own records — the site itself no longer depends on them |
| A3 | **Final product names** for fountain-01/02/03 | Draft names + "Draft name" badges ship on every product page | Draft labels until you approve finals → then clear `DRAFT_NAME_SLUGS` |

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
