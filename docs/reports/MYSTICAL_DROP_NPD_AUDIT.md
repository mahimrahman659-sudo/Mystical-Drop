# Mystical Drop — NPD Audit Report

**Date:** 2026-11-24 · **Branch:** `review/mystical-drop-audit-rebrand` (clean tree at start) · **Scope:** Phase 0 full repository audit

Labels: **FACT** = verified in code/files · **INFERENCE** = reasoned from evidence · **UNKNOWN** = needs owner input

---

## 1. Architecture (FACT)

| Area | Finding |
|---|---|
| Framework | Next.js **15.5.29** App Router, React 19, TypeScript strict, Tailwind 3.4 |
| Data | MongoDB (`products`, `orders`, `media`, `siteSettings`, Better Auth collections); env: `MONGODB_URI`, `MONGODB_DB_NAME` |
| Auth | Better Auth 1.7 (email/password + optional Google), email verification required, admin role via CLI promote only |
| Commerce | localStorage cart (`terranova-cart-v1`), demo Cash-on-Delivery checkout, **no payment integration**, server-side price revalidation on `POST /api/orders` |
| Admin | Product CRUD (archive/restore, no delete), order status transitions, homepage banner editor, image uploads → sharp WebP → Mongo `media` |
| Emails | Only account verification + password-reset (nodemailer). **No order emails exist.** |
| Tests | Playwright E2E only (6 specs,33 tests) via `npm run test:e2e` (memory Mongo + capture SMTP + build). No unit tests. |
| SEO | Basic metadata + Google verification; **no robots.txt, sitemap, canonical, or JSON-LD** |
| Deployment | Vercel-linked (`mystical-drop`), no `vercel.json`; Render-style auto-deploy not applicable here |

## 2. Catalog state before this work (FACT)

Three **demo products** unrelated to the real range: `bamboo-cascade` (৳3,850), `rustic-tree-stone-well` (৳4,200), `terracotta-pot` (৳3,450) — stock/AI-style photography, Bengali names, dB-rated specs.

## 3. Unsupported / risky claims removed (FACT)

| Claim | Where it lived |
|---|---|
| "24–28 dB Acoustic Calibration", "Studio Verified" | Homepage hero overlay |
| "48h Acoustic Testing", "100% Lead-Free Materials" | Homepage stats |
| "Each piece tested for 48 hours… acoustic resonance" | Collection intro |
| "48-Hour In-Home Acoustic Testing Guarantee", "1-Year Silent Pump Warranty", "insured courier", "24–48h delivery" promises | Product page trust panel |
| "Safe Transit Guarantee / break-free packaging", "Acoustic In-Home Setup", "duties & insurance", "48-Hour Acoustic Resonance Trial" | Cart sidebar |
| "48h pre-dispatch acoustic inspection", "Shockproof custom packing", "digital warranty card", "inclusive of all local taxes" | Checkout |
| "Acoustic calibration setup" line item, shockproof/48-hour inspection steps | Order confirmation |
| "No two fountains are identical", "decades of quiet resonance", dB/material/pump specs | Feature cards, care copy, seed specs |
| Location inconsistency: "Savar" vs "Dhaka" | Product page vs footer |
| Footer: "Care & Guarantee" with acoustic guarantee; dead text "Terms & Acoustic Trial"; "Support email: to be confirmed" | Footer |

All removed or replaced with verified wording in this implementation (see `MYSTICAL_DROP_CONTENT_OVERHAUL.md`).

## 4. Placeholder / unfinished content (FACT)

- Privacy page: explicit "owner approval required" draft (kept — legally relevant; flagged).
- Footer support email: "to be confirmed" (removed from UI; owner decision pending).
- No Terms page (dead footer text removed; owner decision pending).

## 5. Asset audit (FACT / UNKNOWN)

- **The three named originals (`1000014235.jpg`, `1000014236.jpg`, `1000013855.jpg`) are NOT on this machine.** Searched: repo + full git history, `C:\Project`, user profile (Downloads/Desktop/Documents/Pictures/OneDrive/AppData/Temp), `D:\` (incl. WhatsApp sync), and production site assets. **BLOCKED** per instructions — owner chose "continue without originals."
- Verified usable real photos in repo: `rustic-well.jpg` + `rustic-wellhead.jpg` (match Product 03 description), `rustic-lifestyle.jpg` (matches Product 01 description: well + bucket + crossbar + blue glow — **provenance UNCONFIRMED**, possibly the original renamed).
- Product 02 (coconut-shell bowls): **no photograph anywhere** → honest placeholder shipped.
- AI/stock assets identified: `bamboo-*`, `terracotta-*`, `triptych-study.jpg`, `artisan-workshop.jpg` — removed from customer-facing use (files preserved on disk).

## 6. Test-suite coupling (FACT)

Tests hard-coded old slugs/names/prices/heading ("Our Fountains", `#about`, "Angle 02" gallery labels) and assumed a priced catalog — migrated in this work (see verification report).

## 7. Risks carried forward (INFERENCE)

- Production DB still holds the three demo products; new seeds (`fountain-01..03`) will be **added** alongside them on first deploy — needs an archive/cleanup step at release.
- Order references (`TNV-`), storage keys (`terranova-*`), HMAC prefix retained deliberately for data compatibility — cosmetic legacy only.
