# Mystical Drop — Release Checklist & Rollback

**Status: NOT READY TO RELEASE — awaiting owner approval.** This implementation exists only as local uncommitted changes on `review/mystical-drop-audit-rebrand`.

---

## 0. Preconditions (owner)

- [x] **Rollback target recorded (2026-11-24):** deployment `dpl_6P2LwdffyDzbnDb9U6hX2ufSbbKM` — `https://mystical-drop-b18execn6-abstract-lifestyle1.vercel.app` (Production, Ready, created 2026-11-23 01:22 BST; aliases `mystical-drop.vercel.app` + `mystical-drop-abstract-lifestyle1.vercel.app`). Verified serving the pre-release code (no "Little Fountains" / "Our Innovation"). **Rollback = `vercel promote https://mystical-drop-b18execn6-abstract-lifestyle1.vercel.app`.**
- [x] Owner authorized release: "push and deploy" (2026-11-24). Items A1–A4 remain open — site intentionally ships with draft names, hidden prices, and the P02 placeholder.
- [ ] Confirm Render/Vercel Auto-Deploy behavior stays **disabled** for this repo (no bare production deploys).

## 1. Pre-merge verification (all must be green)

- [x] `npx tsc --noEmit` — no errors (2026-11-24)
- [x] `npx next lint` — no warnings/errors (2026-11-24)
- [x] `npm run build` — pass (inside e2e run)
- [x] `npm run test:e2e` — **36 passed** (2026-11-24)
- [x] Visual pass — 16 screenshots in `test-results/screenshots/`; home/product/innovation manually reviewed

## 2. Merge & deploy — EXECUTED 2026-11-24 (owner: "push and deploy" + "Promote now, validate live")

- [x] **Commit:** `fe105ae` "Present original fountain collection with price-safe catalog, rewritten content, and NPD pages" (46 files, +2477/−692)
- [x] **Push:** `origin/review/mystical-drop-audit-rebrand` (`b57196f..fe105ae`)
- [x] **Preview:** `dpl_DABPYAcHWXn5LrEWZJM4qra87c14` → `https://mystical-drop-p3eis9bo4-abstract-lifestyle1.vercel.app` (Ready; behind Vercel login wall so HTTP validation was not possible — owner authorized promote-with-live-validation instead)
- [x] **Promote:** `vercel promote` → production build `dpl_BKeHELR5ivM7x4CeDvssHiHPg3KP` → `https://mystical-drop-ruy6dn2ar-abstract-lifestyle1.vercel.app`, aliased to **mystical-drop.vercel.app** (Ready)
- [ ] **Not done (separate authorization):** merge to `main` — see §7 warning

## 3. Post-deploy data steps — EXECUTED 2026-11-24

- [x] Target DB confirmed as production by fingerprint (banner media `6b032c78a2f84df188b226be` matches live site; `terranova_dev` on Atlas — legacy name)
- [x] `npm run setup:db` — "Catalog seed inserted: 3", idempotent, indexes in place
- [x] Archived legacy demos (`bamboo-cascade`, `rustic-tree-stone-well`, `terracotta-pot`) — reversible via admin → Restore; **0 orders existed, none touched**
- [x] Production validation (28 checks): new homepage/copy live, `/about` + `/innovation` live, all 3 fountain pages 200 with Price Coming Soon + draft badge, no dB/warranty/Savar claims, catalog API = exactly 3 `fountain-*` products **all price null**, legacy slugs absent from home/catalog/search, all images 200, legacy URL serves the (unlinked) Archived view without trust panels. Cart empty-state confirmed via Playwright (client-rendered).

## 4. Post-release (when owner opens commerce)

- [ ] Enter verified prices (admin product edit) → product becomes purchasable only while **Active** with integer price > 0.
- [ ] Replace fountain-02 placeholder with the original photo (A1) and confirm fountain-01 photo (A2).
- [ ] Clear `DRAFT_NAME_SLUGS` after final names publish (A3).
- [ ] Consider: order-confirmation emails, Terms page, support email, real payment method — all currently out of scope by design.

## 5. Rollback

1. Record in step 0 gives the exact prior production deployment.
2. Roll back in Vercel (instant, no data migration exists — schema changes are additive: `price` may be `null`, which **old code treats as…** ⚠ note: old code assumed `number` — if rolled back, cards would render `৳NaN` for the new unpriced seeds).
3. Therefore after any rollback: **archive the `fountain-*` products** (or re-run old-code-compatible seeding) so the old build only serves the priced legacy catalog.
4. Orders require no rollback action (untouched schema; new orders created during the window remain valid demo records).

## 7. Open items after release (2026-11-24)

1. **Merge `review/mystical-drop-audit-rebrand` → `main` soon (separate authorization).** Git integration is active: pushes to `main` auto-deploy to production. `main` still holds the old code — an unrelated `main` push without this branch would **revert the live site**. Merging makes the branch state canonical.
2. Homepage banner: production `siteSettings.homeBanner` still points at the owner-uploaded photo `/api/media/6b032c78a2f84df188b226be` (verified = a real tree-and-well product photo, fetched 2026-11-24). It renders as the hero; change via admin → Site banner if a different image is preferred.
3. Rollback if needed: `vercel promote https://mystical-drop-b18execn6-abstract-lifestyle1.vercel.app` (old code). DB rollback if required: restore the 3 legacy products from admin (they are archived, not deleted) — new seeds can be archived likewise.
4. Owner decisions A1–B5 remain open (photos, names, prices, privacy, support email, terms).

## 8. What was intentionally NOT done

No merges to `main` · no Vercel/Render/GitHub settings changes · no dependency or lockfile edits · no payment activation · no deletion of historical orders or products (archive only) · no publication of unapproved names/prices · no invented specifications or claims.
