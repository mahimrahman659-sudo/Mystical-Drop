# Mystical Drop — Controlled Production Smoke-Test Procedure

**Purpose:** prove the live Cash on Delivery flow end-to-end on `https://mystical-drop.vercel.app` with minimal exposure.
**Rule:** Steps A–B are read-only and may be run by anyone. **Step C places a real order and requires explicit owner approval. Nothing in this document has been executed yet.**

---

## Before you start

- Have the admin login ready (or promote one: `npm run admin:promote -- --email=you@example.com` against production env).
- Know the current live deployment id (rollback target): check `vercel ls mystical-drop` — the newest **Production** entry. Rollback = `vercel promote <previous-production-url>`.
- Expected state: three active fountains at **৳399**, prices visible, Add-to-Cart enabled, zero demo wording.

---

## Step A — Read-only page checks (no login, no data)

In a normal browser (and once on a phone):

1. **Home** (`/`) — headline "Little Fountains. Beautiful Details.", three cards with photos (P02 = twin-bowl photo), **৳399** on each card, Add-to-Cart enabled, footer shows phone `01646886795`, **Ctrl+F "demo" → expect no matches**.
2. **Product pages** (`/products/fountain-01…03`) — price ৳399, no "Price Coming Soon", "Draft name" badge present (names still pending), no dB/warranty/Savar text.
3. **Our Innovation** (`/innovation`) and **Our Story** (`/about`) — render; no placeholder image on the P02 design card.
4. **Cart** (`/cart`) — add one item: line shows ৳399, payment block says *"Pay in cash when your order arrives"*, checkout button enabled.
5. **Checkout** (`/checkout`) — banner "Cash on Delivery • Pay when your order arrives", **one** payment option (COD, checked), "Online payments … will be added later", submit reads **"Place Order (৳399)"**, no bKash/card radios, no "demo" text.
6. **API sanity** — `GET /api/catalog` returns three products, every `price: 399`.

Pass = all six. Stop and roll back (see top) if any fail.

## Step B — Authenticated read-only checks

1. Sign in (or register + verify via SMTP/dev mailbox).
2. **Admin → Overview** — "Cash on Delivery — Collected on delivery" card; stats show `0 Cash on Delivery` (unless orders exist).
3. **Admin → Products** — three fountains, prices ৳399, all Active.
4. **Admin → Orders** — list/search by `MD-` placeholder works; empty state visible.

## Step C — Live order drill ⚠ REQUIRES OWNER APPROVAL

Only proceed if you explicitly approve creating one real order in production.

1. Use a **real phone number you control** and a real address (the store will call this number).
2. Place an order for **one** item through the normal checkout (Add to Cart → Checkout → fill form → **Place Order**).
3. Expected within seconds:
   - Confirmation page: "Your Order Has Been Placed!", reference **`MD-#####`**, "due on delivery" total ৳399.
   - If `ORDER_ALERT_EMAIL` is set **and** SMTP is configured: customer confirmation email (if you left an email) + admin alert email.
4. Verify in **Admin → Orders**: new order, status **Pending**, payment **Not collected**, COD badge.
5. **Cancel it immediately** (admin → Cancel order) — status becomes Cancelled, payment stays Not collected. This keeps the drill from affecting fulfilment metrics; the record remains as history.
6. Confirm account page (if you ordered signed-in) shows the order with status Cancelled.

## Step D — If anything fails

1. **Roll back the deployment:** `vercel promote <rollback-url-from-above>` (code-only; no data migration exists to undo).
2. Order-related data: cancelled/drill orders can stay (they are marked correctly); there is no order-delete — if a junk order must be removed, that is a manual DB operation needing explicit approval.
3. Capture: browser console, `vercel logs <deployment> --level error`, and the failing step's screenshot.

## Out of scope (deliberately)

- Real payment capture (COD only), online payments, order-confirmation *delivery* guarantees, SEO, and any production data edits beyond the drill's cancel step.
