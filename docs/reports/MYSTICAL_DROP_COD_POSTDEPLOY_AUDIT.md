# Mystical Drop — COD Post-Deployment Audit & Stabilization Report

**Date:** 2026-11-25 · **Base:** commit `26eac4f` on `review/mystical-drop-audit-rebrand` · **Scope:** local implementation + verification only — **nothing pushed, merged, deployed, or written to production data.**

Labels: **FACT** = verified by command/execution · **INFERENCE** = reasoned from evidence · **UNKNOWN** = owner input required.

---

## Phase 1 — Repository synchronization

### Git state (FACT)
| Item | Value |
|---|---|
| Working tree | Clean at `26eac4f` before this work; this report's work is uncommitted (see §Changed files) |
| Branch | `review/mystical-drop-audit-rebrand` — was **ahead 2** of origin (`2d5fd7c`, `26eac4f`) before this session's commit |
| `origin/main` | `92f3bb7` (contains everything through the auth-reset merge; **not** the photos/prices or COD commits) |
| Divergence | `origin/main...HEAD` = `0 behind / 2 ahead` → merging main→branch is unnecessary; sync is a **fast-forward** (no conflicts possible) |
| Local `main` ref | Stale clone artifact (behind origin/main by 12) — irrelevant, origin/main is authoritative |
| Remote | `https://github.com/mahimrahman659-sudo/Mystical-Drop.git` |

### PR #5 (FACT)
**PR #5 does not exist.** `git ls-remote origin 'refs/pull/*/head'` advertises only PRs **1–4**; PR #4 head = `26e707b` (merged as `886aa28`). The two COD-related commits have never been pushed, so no PR can exist for them.

### GitHub 403 diagnosis (FACT)
- Probe: `git push --dry-run` (non-mutating) → `Permission to mahimrahman659-sudo/Mystical-Drop.git denied to mahi8026` → HTTP 403.
- **Read access works** (`git ls-remote` succeeds); **write is denied** — the stored credential's GitHub identity is **`mahi8026`**, which has no write permission on the owner-owned repo.
- Credential chain: system `credential.helper = manager` (Git Credential Manager); `GIT_ASKPASS` points at VSCode's askpass — earlier intermittent push successes occurred when an interactive GCM/VSCode prompt supplied a *different* (owner-account) token. Non-interactive sessions always get the stored `mahi8026` credential → deterministic 403.
- Git commit identity (`user.name = mahi8026`, owner's email) is unrelated to the credential and needs no change.
- **Not fixable from here without touching credentials or repo settings (both out of bounds). Owner options, in order of simplicity:**
  1. Run `git push origin review/mystical-drop-audit-rebrand` from your own terminal (interactive GCM/VSCode auth — has worked before), **or**
  2. In Git Credential Manager: sign out of `mahi8026` / sign in as `mahimrahman659` so the stored credential can write, **or**
  3. Add `mahi8026` as a collaborator with **Write** role on the repo (repo settings).

### Deployed source verification (FACT + INFERENCE)
- The live deployment (`dpl_85vxb4VZDFu8y3gnTycTzbjAHpq9`, promoted 2026-11-25 18:12) was created by `vercel deploy` **from this working directory**, which was a clean tree at `26eac4f` and remains so.
- Behavioral proof (FACT): the live site serves strings that exist only in `2d5fd7c`/`26eac4f` ("Place Order", zero demo wording, fountain images) — verified by 12/12 browser checks in the previous session.
- **INFERENCE: deployed source == commits `2d5fd7c` + `26eac4f` (i.e., branch content through `26eac4f`).**

### Safe synchronization plan (NOT executed — needs approval + working credentials)
1. Owner pushes the branch (option 1–3 above).
2. Open **PR #5**: `review/mystical-drop-audit-rebrand` → `main`. Fast-forwardable — GitHub will show no conflicts (branch already contains `origin/main`).
3. Merge (owner action). Git integration then auto-deploys `main` — content identical to what is already live plus this stabilization work once pushed.
4. After merge: `git fetch && git checkout main && git pull` to refresh the stale local `main` ref.

---

## Phase 2 — Independent COD security audit

Audited the full order path by reading code (not relying on the 36/42 passing tests). All ten mandated checks:

| # | Check | Verdict | Evidence (file:behavior) |
|---|---|---|---|
| 1 | Server-side price calculation | **PASS** | `lib/db/orders.ts::createOrder` — `unitPrice` comes only from DB product docs; client sends `expectedTotal` which must **equal** the recomputed total or the order is rejected `409 TOTAL_CHANGED` |
| 2 | Product availability validation | **PASS** | Same function — products fetched with `status:"active"` only; missing → `409 UNAVAILABLE`; unpriced → `409 PRICE_UNAVAILABLE` |
| 3 | Shipping charge calculation | **PASS** | Server constant `FREE_SHIPPING.amount` (0) — never read from the request |
| 4 | Customer input validation | **PASS** | `app/api/orders/route.ts`: zod bounds (uuid key, ≤80/40/200/200/80/10/300-char fields, qty int 1–10, 1–10 items, int total) + `validateCheckout` (BD phone regex, name 2–80, street ≥5, city ≥2, 4-digit postal, ≤300 instructions); duplicate slugs rejected; all values trimmed |
| 5 | Atomic order creation | **PASS** | Single-document `insertOne` — no multi-document writes to partially fail |
| 6 | Database-backed idempotency | **PASS** | Unique index on `submissionKey` + pre-flight `findOne` + `existingSubmission` guards (owner mismatch → `409 SUBMISSION_CONFLICT`; cart-signature mismatch → `409 SUBMISSION_CONFLICT`); unique `reference` index with bounded retry loop |
| 7 | Concurrent checkout submissions | **PASS** | Racing inserts resolve via unique-index duplicate-key → loser fetches the winner's order and returns it (`created:false`); proven by e2e two-tab test **and** the new5-way parallel test |
| 8 | Duplicate-order prevention | **PASS** | Same key → one order (any number of replays/parallel calls); same key + different cart → 409, zero extra orders (new test) |
| 9 | Admin authorization | **PASS** | `lib/admin/auth.ts`: role re-read from the DB on **every** request (`getSessionUser`), pages gate via `getAdminViewer`, all server actions via `requireAdminAction`; public registration forces `role:"customer"` (`input:false`); admin promotion is CLI-only |
| 10 | Valid order status transitions | **PASS** | Whitelist `ALLOWED_TRANSITIONS` + atomic compare-and-swap `updateOne({_id, fulfillmentStatus: expected})` → stale writers get `stale`, invalid jumps get `invalid`; `statusHistory` records admin identity; terminal states have no exits |
| 11 | Historical order integrity | **PASS** | No code path deletes orders or mutates items/prices/totals; the only writes are the status CAS + history push; customer reads are scoped by `userId`, confirmation reads require owner session **or** HMAC token (sha256-stored), admin search regex-escapes input |

### Additional findings

| ID | Severity | Finding | Action taken |
|---|---|---|---|
| F1 | Medium (brand/correctness) | **6 stale "demo" strings survived the previous cleanup** — my earlier sweep glob (`app\**\*.ts`) never matched two-level paths like `app/api/orders/`. Locations: order API 500 message, account order detail (×2), admin order detail (×2), admin order list badge | **FIXED** (all → real-COD wording) |
| F2 | Medium (correctness) | Payment status could never leave `not_collected` — no writer existed, so delivered COD orders would forever read "not collected" | **FIXED**: marking an order **delivered now records `paymentStatus:"paid"`** (cash handover); earlier/cancelled states untouched; dynamic payment labels added (`paymentStatusLabel`) — admin + account pages previously hardcoded "Not collected" |
| F3 | Low (cosmetic) | `TNV-` legacy reference prefix on new orders | **FIXED** in Phase 4 |
| F4 | Low (cosmetic) | Mis-indented `const delivery` line in `createOrder` | **FIXED** |
| F5 | **Risk — not fixed (scope)** | **No rate limiting on `POST /api/orders`.** The Origin check blocks cross-site posts but not scripted clients; a bot could spam junk orders (each needing admin cleanup). Options: per-IP/per-phone DB-backed throttle, or Vercel WAF rule | **Documented — owner decision** (building throttling is a new feature; outside this prompt's verify list) |
| F6 | Info | Order confirmation route has no Origin check — harmless: it only reads and requires a valid HMAC token or owner session | No action |
| F7 | Info | `expectedTotal: 0` passes the schema but always fails `TOTAL_CHANGED` for real carts (totals ≥ ৳399) | No action |

---

## Phase 3 — Order notifications

### Email infrastructure audit (FACT)
- `lib/email.ts`: nodemailer SMTP transport (from `SMTP_HOST/PORT/SECURE/USER/PASS/FROM`), dev-mailbox fallback **only outside production** (production without SMTP → hard failure by design), `escapeHtml` helper, delivery-status probe at `/api/auth-delivery`.
- E2E harness runs a capture SMTP server and writes JSONL classified **by subject regex** (`scripts/test-smtp.ts`).

### Implemented
1. **Customer confirmation email** (`order-confirmation`) — sent only when the checkout provided an email: reference (MD-), placed time (Asia/Dhaka), itemized lines, subtotal/delivery/total, **"Amount payable on delivery: ৳…"**, delivery address + phone, "pay in cash when your order arrives", "we will call you to confirm… before dispatch" (wording matches the site's published COD process — no invented support address, no invented delivery SLA).
2. **Admin alert email** (`order-alert`) — sent to **`ORDER_ALERT_EMAIL`** (new optional env var, added to `.env.example`; **unset = alerts disabled**, no address invented): subject `New COD order MD-XXXXX — ৳total payable on delivery`, full summary + customer contact + "call the customer to confirm delivery".
3. **Accurate summary** — both emails derive from the stored `OrderConfirmation` snapshot (server-priced totals, never recomputed client-side).
4. **Duplicate prevention** — notifications fire **only when `created === true`** in the API route; idempotent replays (`created:false`) never resend (test-proven).
5. **Failure isolation** — sends are fire-and-forget after the insert; `sendOrderEmails` catches and logs each send and **never rejects**; the route adds a belt-and-suspenders `.catch`. An email outage can therefore neither fail the order response nor create duplicates.
6. Test SMTP classifier extended for the two new subjects; `waitForMail` kinds widened; E2E env sets `ORDER_ALERT_EMAIL=orders-alert@example.com` (test-only).

### Notification tests (new)
- `tests/order-notifications.spec.ts` — (a) full UI checkout → customer confirmation + admin alert contents (reference, payable-on-delivery total, phone, call-to-confirm) and exactly one order; (b) API replay → **zero** additional confirmation mails, same order id, one order.
- `tests/production-email.spec.ts` — **"placing an order succeeds when email delivery is unavailable"**: production app with no SMTP → both sends fail internally → order still `201`, exactly one order, zero mailbox writes. *(This is the direct proof of the "email failure must not fail or duplicate orders" requirement.)*

---

## Phase 4 — Order reference prefix TNV → MD

- **FACT:** `freshReference()` now emits `MD-#####` for **new** orders only; the unique-index retry loop is prefix-agnostic.
- **Backward compatibility (FACT):**
  - Historical `TNV-` references live only inside stored documents — account pages and admin lists render `order.reference` verbatim; admin search regex-matches the stored string (TNV or MD both searchable); confirmation links use `orderId` + HMAC token, **never** the reference.
  - Tests now accept both: `/#(?:MD|TNV)-\d{5}/` (auth ×2, cart two-tab); admin search placeholder updated to `MD-12345`.
  - The internal HMAC message prefix (`terranova-order:`) was **deliberately not changed** — it is not user-visible and changing it would invalidate any future token verification semantics for no benefit.
- **Risk:** MD + 5 digits = 90k space with up to 5 collision retries — fine at this order volume (INFERENCE).

---

## Phase 5 — Verification

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors (run after every change batch) |
| `npx next lint` | **PASS** — no warnings/errors |
| `npm run build` (inside e2e harness) | **PASS** — production bundle built before tests ran |
| `npm run test:e2e` (final) | **42/42 PASSED (14.3 min)** |

### Final suite composition (42)
admin 6 · auth 11 · cart 8 · **concurrency 3 (new)** · **order-notifications 2 (new)** · price-hiding 2 · production-email **3 (1 new)** · rebrand 1 · storefront 5 · visual-screenshots 1.

**New coverage highlights:** 5-way parallel identical submissions → one order;3-way parallel distinct → three orders; replayed-key-cart-conflict → 409, no extra order; delivered→paid COD transition (admin flow); notification contents + replay suppression; order success under total email failure; MD- prefix asserted in both notification and production tests.

### Controlled production smoke-test procedure
Prepared in **`docs/reports/MYSTICAL_DROP_COD_SMOKE_TEST.md`** — read-only checks first; **placing a real order is explicitly gated on your approval** (scripted in that document, never executed).

---

## Changed files (this session, uncommitted)

| File | Change |
|---|---|
| `lib/email.ts` | Store-email kinds widened; `sendOrderConfirmationEmail`, `sendOrderAlertEmail`, never-rejecting `sendOrderEmails` orchestrator; `sendAuthEmail` → generic `deliverStoreEmail` |
| `app/api/orders/route.ts` | Fire-and-forget notifications on `created` only; 500-message "demo" → "your order" |
| `lib/orders.ts` | `PAYMENT_STATUS_LABELS` + `paymentStatusLabel()` |
| `lib/db/orders.ts` | `updateOrderStatus` records `paymentStatus:"paid"` on delivered; `MD-` reference prefix; indent fix |
| `app/account/orders/[id]/page.tsx` | Real-COD wording; dynamic payment label; explainer rewritten |
| `app/admin/orders/[id]/page.tsx` | "COD" badge; dynamic payment status; payment-on-delivery explainer |
| `app/admin/orders/page.tsx` | "Demo" → "COD" badge; search placeholder `MD-12345` |
| `.env.example` | `ORDER_ALERT_EMAIL` (optional) |
| `scripts/run-e2e.ts` | Test-only `ORDER_ALERT_EMAIL` |
| `scripts/test-smtp.ts` | Subject classification for `order-confirmation` / `order-alert` |
| `tests/helpers.ts` | `TestMailKind` widened |
| `tests/order-notifications.spec.ts` | **New** (2 tests) |
| `tests/concurrency.spec.ts` | **New** (3 tests) |
| `tests/production-email.spec.ts` | +1 test (order succeeds without email) |
| `tests/admin.spec.ts` | Delivered→paid assertions in the existing flow |
| `tests/auth.spec.ts`, `tests/cart.spec.ts` | Reference regex accepts `MD-` and `TNV-` |
| `docs/reports/MYSTICAL_DROP_COD_POSTDEPLOY_AUDIT.md` | **New** (this report) |
| `docs/reports/MYSTICAL_DROP_COD_SMOKE_TEST.md` | **New** (procedure) |

## Remaining risks
1. **F5 — no order rate limiting** (see Phase 2). Recommended before heavy public traffic.
2. **No push/merge yet** — production runs `26eac4f`; this stabilization work exists only locally. Sync plan in Phase 1; blocked on GitHub credentials.
3. **`ORDER_ALERT_EMAIL` unset in production** — admin alerts silently disabled until the owner sets the env var in Vercel (customer confirmations work whenever SMTP is configured).
4. **Customer emails depend on buyers leaving an optional email** — orders placed without one get no confirmation (phone is the primary channel).
5. **Delivered→paid assumes the admin marks delivered only after cash is physically received** — workflow discipline, not code (INFERENCE).

## Owner decisions required
1. **Push + PR #5 + merge** after fixing GitHub credentials (Phase 1 options 1–3).
2. **Set `ORDER_ALERT_EMAIL`** in Vercel production env (e.g., a monitored inbox) — or leave alerts off.
3. **Optionally adopt an order rate-limiting strategy** (F5).
4. **Approve/execute the production smoke test** (procedure document) — including whether to place one real test order.
5. Unchanged from before: final product names, privacy-policy approval, support email, Terms page.

---

## Release executed (2026-11-26, pre-competition)

Owner directive: "tomorrow morning is our competition so need to do fast on remaining work" � treated as authorization to complete the Phase 1 sync plan.

| Step | Result |
|---|---|
| Push branch | `92f3bb7..c836372` (credential working again) |
| Merge to `main` | Fast-forward push `92f3bb7..c836372` � zero conflicts as predicted |
| Auto-deploy | Git integration built **`dpl_FERXJ67UcRcTT3TNbw2JHeJwXWk4`** � Ready, Production |
| Live validation | 24/24 route loads clean � zero demo wording (home+cart) � catalog = 3 x 399 � images 200 � admin gate redirects anonymous to login � **`/api/auth-delivery` = `{available:true, mode:"smtp"}`** (order + auth emails will actually send) |
| Local hygiene | local `main` fast-forwarded to `c836372`; branch in sync; tree clean |

Smoke-test procedure Steps A�B executed (read-only) � all pass. Step C (live order drill) remains owner-gated.
