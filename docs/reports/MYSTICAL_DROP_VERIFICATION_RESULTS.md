# Mystical Drop — Verification Results

**Date:** 2026-11-24 · All checks run locally on branch `review/mystical-drop-audit-rebrand`. No claim below without a command result.

---

## 1. Commands executed (FACT)

| # | Command | Result |
|---|---|---|
| 1 | `npx tsc --noEmit` | **PASS** — 0 errors (run multiple times during implementation; final run clean) |
| 2 | `npx next lint` | **PASS** — "✔ No ESLint warnings or errors" (one `_city` unused warning fixed en route) |
| 3 | `npm run build` | **PASS** — production build OK; all routes present incl. new `/about`, `/innovation` |
| 4 | `npm run test:e2e` (final full run) | **PASS — 36/36 tests, 8.3 min** (build + memory-Mongo + capture-SMTP + Playwright) |
| 5 | `npm run test:e2e -- tests/visual-screenshots.spec.ts` | **PASS** — 16 full-page screenshots written to `test-results/screenshots/` |

### Final E2E composition (36 tests)

admin 6 · auth 11 · cart 8 · **price-hiding 2 (new)** · production-email 2 · rebrand-check 1 · storefront 5 · **visual-screenshots 1 (new)** — all green.

Historical note (FACT): two intermediate full runs surfaced (a) three `networkidle` timeouts under late-run load and (b) one transient `ECONNRESET` in the SMTP spec. Root cause: environment flakiness of `networkidle`/loopback under sustained load — **not reproducible in isolation or partial reruns**. Fixed by deterministic waits + retry (documented in implementation summary); subsequent full run green.

## 2. Requirement-by-requirement verification (FACT)

| # | Requirement | Evidence |
|---|---|---|
| 1 | Original photos displayed correctly | **PARTIAL — blocked**: named originals missing (see catalog plan). Verified real photos used for P01* / P03; P02 placeholder. Screenshot review + `waitForImages` (all `img` elements `naturalWidth > 0`) across 7 viewports ✓ |
| 2 | No unrelated product images substituted | AI/stock set (`bamboo-*`, `terracotta-*`, `triptych-study`, `artisan-workshop`) removed from all customer-facing use; a mis-copied UUID desk-scene photo was **caught in screenshot review and deleted**; sweep grep = 0 references |
| 3 | No unapproved names treated as final | Draft names + visible "Draft name" badge + homepage disclaimer + `DRAFT_NAME_SLUGS` flag (catalog plan) |
| 4 | Unpriced products hide prices | `price-hiding.spec` asserts catalog `price === null`, ≥3 "Price Coming Soon" on home, and **no `৳` character** on home/product page HTML |
| 5 | Unpriced products cannot be purchased | Card buttons `toBeDisabled()`; product page has **0** Add-to-Cart/Instant-Buy buttons; cart shows disabled "Checkout unavailable — price pending"; API returns `409 PRICE_UNAVAILABLE` for forged-total, `expectedTotal: 0`, and mixed carts |
| 6 | Historical orders intact | Order code path untouched except forward-only validation; snapshots keep stored prices; auth/admin order tests (creation, idempotency, transitions, isolation) all pass |
| 7 | Admin works | admin.spec 6/6: edit price, validation (incl. `0` rejection), archive/restore, seed idempotency, image + banner upload, responsive widths |
| 8 | Authentication works | auth.spec 11/11: register/verify/login/logout/reset/role boundary/Google-safe errors/session expiry |
| 9 | Navigation works | Header/mobile-menu links asserted (storefront, rebrand, admin specs); `/about` + `/innovation` render (build output + screenshots) |
| 10 | No broken links introduced | E2E route sweeps (5 routes × 7 viewports) + footer link assertions; dead "Terms" text removed |
| 11–13 | Mobile/tablet/desktop usable, no overflow | Viewport matrix **320/390/768/1024/1440/844/1920** with `scrollWidth ≤ clientWidth + 1` on home/product/cart/checkout/confirmation (storefront), auth, admin, rebrand specs — all pass. Desktop nav moved to `lg` breakpoint after 768px overflow analysis |
| 14 | No unsupported claims introduced | Content overhaul report; sweep greps for acoustic/dB/lead-free/warranty/shockproof/insured/48h/Savar returned only intentional non-claim matches |
| 15 | Existing functionality preserved | Full suite green: cart (qty/archival/outage/idempotency/two-tab), checkout, confirmation, favorites, search, account, orders, admin, emails, privacy, print view |
| 16 | No console/runtime errors | auth hydration spec asserts **zero** console errors/pageerrors across `/`, product, cart, checkout, confirmation, login, register, forgot/reset/verify routes |

## 3. Visual verification (screenshots)

Generated: `test-results/screenshots/` — 16 images (home, product-01/02/03, about, innovation, cart, checkout × 390px & 1440px).

**Manually inspected and confirmed:** home-desktop (all 8 sections, images loaded, price hiding, disabled CTAs, footer), product-02-mobile (placeholder, draft badge, "Price Coming Soon", unpriced purchase panel, design notes), innovation-desktop (full NPD narrative, hypothesis/future labelling), plus a pre-fix home-desktop capture.

**Limitation (honest):** the image-viewing tool began serving a stale attachment part-way through review, so about/cart/checkout/product-01/03 and the mobile variants were **generated but not individually eyeballed**. They are covered by the automated checks above (overflow, image-load, heading assertions on those exact routes at those widths) and are available at the path above for owner review.

## 4. Not verified / out of scope

- Production deployment, production database, Vercel settings — **untouched by design**.
- Real payment/delivery flows — none exist (demo storefront).
- The three named original photographs — unavailable (blocked).
- Browser automation beyond Playwright E2E (no Lighthouse/axe run) — accessibility covered indirectly via semantic markup, focus styles, reduced-motion CSS, alt text, and heading assertions.
