# Mystical Drop

Mystical Drop is a handcrafted indoor water fountain storefront for Dhaka, Bangladesh. The app includes the storefront, customer accounts, guest and authenticated checkout, customer order history, and a responsive admin panel.

## Stack

- Next.js 15.5 App Router, React 19, TypeScript
- Tailwind CSS 3.4
- Better Auth 1.7 with MongoDB adapter
- MongoDB (Atlas for deployed environments)
- Playwright for browser tests

## Local Setup

```powershell
npm install
Copy-Item .env.example .env.local
```

Create a dedicated MongoDB database, then set these values in `.env.local`:

```text
MONGODB_URI
MONGODB_DB_NAME
BETTER_AUTH_SECRET
BETTER_AUTH_URL
```

Existing deployments must keep their current `MONGODB_DB_NAME`; changing it points the app at a different, empty database.

Run the idempotent index/catalog setup:

```powershell
npm run setup:db
```

Start the app:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Authentication

Auth routes:

- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

Better Auth stores users, accounts, sessions, verification records, and rate-limit data in MongoDB. Password accounts require email verification. Public registration always creates a customer account.

For Google OAuth, create a Google Cloud OAuth web client and add this authorized redirect URI for local development:

```text
http://localhost:3000/api/auth/callback/google
```

For production, add the deployed origin and its callback URL instead:

```text
https://your-production-domain.example/api/auth/callback/google
```

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`, then restart the app. In deployment, add the same values to the hosting environment and set `BETTER_AUTH_URL` to the deployed origin. Google sign-in and explicit account linking use Better Auth's OAuth and `linkSocial` flows. Implicit linking by matching email is intentionally disabled.

## Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` for real delivery.

In local development without SMTP, verification and password-reset emails are captured at:

```text
/dev/mailbox
```

The development mailbox exists only outside production. A production build never exposes it and never stores account email content in MongoDB, even if `DEV_MAILBOX_ENABLED=1` is present. Production without working SMTP reports email delivery as unavailable and keeps the resend/retry paths available. Do not place links, tokens, or email bodies in logs.

## Customer Accounts And Orders

- `/account` shows the profile and account order history.
- `/account/orders/[id]` only returns orders owned by the signed-in customer.
- Guest checkout remains available.
- Orders are stored in MongoDB with server-calculated prices, totals, and purchase-time item snapshots.
- A unique checkout submission key prevents duplicate orders and is retained across retries and reloads until the attempt is completed or the cart changes.
- Confirmation details for guests are scoped by a high-entropy access token stored in the browser tab; order references alone do not expose delivery details.
- Checkout is a clearly labeled demonstration Cash on Delivery flow. No card details or real payments are collected.

## Admin

Admin routes:

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[slug]/edit`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/settings`

Admins can upload product images and the homepage banner from the panel. Uploaded images are validated, re-encoded to WebP, stored in MongoDB, and served from cacheable media URLs.

Admin pages and mutations require a server-verified admin role. To promote an existing, email-verified customer:

```powershell
npm run admin:promote -- --email=user@example.com
```

The command is safe to rerun. There is no default admin account or public role-promotion endpoint.

## Database Setup

`npm run setup:db` creates the required indexes and upserts the three original catalog products using stable seed IDs and slugs. Re-running it preserves admin edits, archived products, and existing orders.

The setup covers unique indexes for user email, provider accounts, session tokens, product slugs, order references, checkout submission keys, rate-limit keys, and site settings, plus indexes for uploaded media.

## Tests

```powershell
npm run test:e2e
```

This command builds the production app, starts an isolated MongoDB instance through `mongodb-memory-server`, runs a local SMTP capture server, and runs Playwright tests. It does not connect to Atlas or production data. Account emails are captured in memory/temporary files rather than the development mailbox.

The suite covers account verification and login, password reset, production mailbox isolation, missing-SMTP behavior, guest and authenticated checkout, price and availability changes, cart preservation, interrupted-response idempotency, duplicate-order prevention, customer order isolation, admin boundaries, catalog editing and archiving, setup/index integrity, fulfilment transitions, responsive layouts, and hydration checks.

## Production Build

```powershell
npm run build
npm start
```

Before accepting real orders, configure Atlas, production auth URLs and secrets, Google OAuth, SMTP, real support/policy content, and a live payment and fulfilment integration. Use a dedicated production database rather than a development database. The current storefront is a demo COD implementation.
