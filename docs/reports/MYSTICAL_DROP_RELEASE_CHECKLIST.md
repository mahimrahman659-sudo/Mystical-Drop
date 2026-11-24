# Mystical Drop — Release Checklist & Rollback

**Status: NOT READY TO RELEASE — awaiting owner approval.** This implementation exists only as local uncommitted changes on `review/mystical-drop-audit-rebrand`.

---

## 0. Preconditions (owner)

- [x] **Rollback target recorded (2026-11-24):** deployment `dpl_6P2LwdffyDzbnDb9U6hX2ufSbbKM` — `https://mystical-drop-b18execn6-abstract-lifestyle1.vercel.app` (Production, Ready, created 2026-11-23 01:22 BST; aliases `mystical-drop.vercel.app` + `mystical-drop-abstract-lifestyle1.vercel.app`). Verified serving the pre-release code (no "Little Fountains" / "Our Innovation"). **Rollback = `vercel promote https://mystical-drop-b18execn6-abstract-lifestyle1.vercel.app`.**
- [x] Owner authorized release: "push and deploy" (2026-11-24). Items A1–A4 remain open — site intentionally ships with draft names, hidden prices, and the P02 placeholder.
- [ ] Confirm Render/Vercel Auto-Deploy behavior stays **disabled** for this repo (no bare production deploys).

## 1. Pre-merge verification (all must be green)

```powershell
npx tsc --noEmit          # expect: no output
npx next lint             # expect: ✔ No ESLint warnings or errors
npm run build             # expect: build completes, /about + /innovation present
npm run test:e2e          # expect: 36 passed
```

- [ ] Visual pass over `test-results/screenshots/` (16 images) at owner's discretion — regenerate any time with `npm run test:e2e -- tests/visual-screenshots.spec.ts`.
- [ ] Manual spot-check on a phone: home → product → cart → menu → `/innovation` → `/about`.

## 2. Merge & deploy (separate explicit authorizations required)

Each step needs its own go-ahead — none were performed:

- [ ] Owner reviews diff (33 modified + 4 added paths; see implementation summary).
- [ ] **Authorize commit** → single review commit on `review/mystical-drop-audit-rebrand`.
- [ ] **Authorize merge/push** to the release branch.
- [ ] Promote via **validated preview** (preview URL → smoke test → promote). Never a bare production deploy.

## 3. Post-deploy data steps (production DB — destructive steps flagged)

- [ ] Run `npm run setup:db` (idempotent) so the three `fountain-*` seeds + indexes exist. *Safe: uses `$setOnInsert`; never overwrites admin edits; never touches orders.*
- [ ] **Archive the three legacy demo products** in admin (`bamboo-cascade`, `rustic-tree-stone-well`, `terracotta-pot`) so the storefront shows only the original collection. *(Archive ≠ delete; reversible via Restore.)*
- [ ] Set the homepage banner if the default (`rustic-well.jpg`) should differ — admin → Site banner.
- [ ] Verify on production: homepage shows 3 cards with "Price Coming Soon", no `৳` anywhere, Add-to-Cart disabled, `/about` + `/innovation` load, footer phone correct.
- [ ] Confirm **no historical orders changed**: admin → Orders — pre-existing references/totals intact.
- [ ] Confirm Google verification meta still present (search console) and `/privacy` behaves as intended.

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

## 6. What was intentionally NOT done

No commits · no pushes · no merges · no deploys · no production/env/DB changes · no dependency or lockfile edits · no payment activation · no deletion of historical orders · no publication of unapproved names/prices · no invented specifications or claims.
