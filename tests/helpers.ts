import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { MongoClient, type Db } from "mongodb";
import { CART_STORAGE_KEY } from "../lib/cart";
import { CONFIRMATION_STORAGE_KEY } from "../lib/checkout";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error(
    "E2E database is not configured. Run tests through npm run test:e2e.",
  );
}

let cachedClient: MongoClient | null = null;

export async function getTestDb(): Promise<Db> {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri!);
    await cachedClient.connect();
  }
  return cachedClient.db(dbName!);
}

export async function closeTestDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}

export async function resetTestDatabase(): Promise<void> {
  const client = new MongoClient(uri!);
  await client.connect();
  await client.db(dbName!).dropDatabase();
  await client.close();

  const { setupDatabase } = await import("../lib/db/setup");
  await setupDatabase();
}

export type TestMail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  kind: string;
  createdAt: Date;
};

export function capturedMails(): TestMail[] {
  const captureFile = process.env.E2E_SMTP_CAPTURE_FILE;
  if (!captureFile) throw new Error("E2E SMTP capture file is not configured.");
  return readFileSync(captureFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const mail = JSON.parse(line) as Omit<TestMail, "createdAt"> & {
        createdAt: string;
      };
      return { ...mail, createdAt: new Date(mail.createdAt) };
    });
}

export async function latestMail(
  to: string,
  kind: "verification" | "password-reset",
): Promise<TestMail> {
  const mail = capturedMails()
    .filter(
      (entry) =>
        entry.kind === kind &&
        entry.to.toLowerCase().includes(to.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  if (!mail) throw new Error(`No ${kind} email found for ${to}.`);
  return mail;
}

export async function waitForMail(
  to: string,
  kind: "verification" | "password-reset",
): Promise<TestMail> {
  await expect
    .poll(async () => {
      try {
        await latestMail(to, kind);
        return true;
      } catch {
        return false;
      }
    }, { timeout: 15_000, message: `Waiting for ${kind} email to ${to}` })
    .toBe(true);
  return latestMail(to, kind);
}

export function verificationLink(mail: TestMail): string {
  const match = mail.text.match(/https?:\/\/[^\s]+\/api\/auth\/verify-email\?[^\s]+/);
  if (!match) throw new Error("Verification link missing from captured email.");
  return match[0];
}

export function resetLink(mail: TestMail): string {
  const match = mail.text.match(/https?:\/\/[^\s]+\/api\/auth\/reset-password\/[^\s]+/);
  if (!match) throw new Error("Password-reset link missing from captured email.");
  return match[0];
}

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  returnTo?: string;
};

export async function waitForAppReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.documentElement.dataset.appReady === "true",
    undefined,
    { timeout: 15_000 },
  );
}

export async function registerViaUi(page: Page, input: RegisterInput): Promise<void> {
  const suffix = input.returnTo
    ? `?returnTo=${encodeURIComponent(input.returnTo)}`
    : "";
  await page.goto(`/register${suffix}`);
  await waitForAppReady(page);
  await page.getByLabel(/Full name/).fill(input.name);
  await page.getByLabel(/Email address/).fill(input.email);
  await page.getByLabel(/^Password/).fill(input.password);
  await page.getByLabel(/Confirm password/).fill(input.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/Check your inbox/)).toBeVisible({ timeout: 30_000 });
}

export async function verifyEmailViaMailbox(
  page: Page,
  email: string,
): Promise<void> {
  const mail = await waitForMail(email, "verification");
  await page.goto(verificationLink(mail));
  await expect(page).toHaveURL(/\/login\?verified=1/);
  await waitForAppReady(page);
  await expect(page.getByText("Email verified. Sign in to continue.")).toBeVisible();
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string,
  returnTo = "/account",
): Promise<void> {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill(email);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(`**${returnTo}`, { timeout: 30_000 });
  await waitForAppReady(page);
}

export async function logoutViaUi(page: Page): Promise<void> {
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/", { timeout: 30_000 });
}

export async function registerVerifyAndLogin(
  page: Page,
  input: RegisterInput & { returnTo?: string },
): Promise<void> {
  await registerViaUi(page, input);
  await verifyEmailViaMailbox(page, input.email);
  await loginViaUi(page, input.email, input.password, input.returnTo ?? "/account");
}

function runTsxScript(script: string, args: string[]): string {
  const tsxCli = path.join(
    process.cwd(),
    "node_modules",
    "tsx",
    "dist",
    "cli.mjs",
  );
  try {
    return execFileSync(process.execPath, [tsxCli, script, ...args], {
      cwd: process.cwd(),
      env: process.env,
      encoding: "utf8",
      timeout: 120_000,
    });
  } catch (error) {
    const failure = error as {
      message?: string;
      stdout?: string;
      stderr?: string;
    };
    throw new Error(
      `Script ${script} failed: ${failure.stderr || failure.stdout || failure.message || "unknown error"}`,
    );
  }
}

export function runDbSetup(): string {
  return runTsxScript("scripts/setup-db.ts", []);
}

export function promoteAdmin(email: string): void {
  const output = runTsxScript("scripts/promote-admin.ts", [
    `--email=${email}`,
  ]);
  if (!/Promoted verified account/i.test(output)) {
    throw new Error(`Unexpected admin promotion output: ${output}`);
  }
}

export async function getProductPrice(slug: string): Promise<number> {
  const db = await getTestDb();
  const product = await db.collection("products").findOne({ slug });
  if (!product) throw new Error(`Product ${slug} not found.`);
  return product.price as number;
}

export async function seedCart(
  context: BrowserContext,
  lines: Array<{ slug: string; quantity: number }>,
): Promise<void> {
  await context.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: CART_STORAGE_KEY, value: lines },
  );
}

export async function seedConfirmationHandle(
  context: BrowserContext,
  handle: { orderId: string; accessToken: string },
): Promise<void> {
  await context.addInitScript(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    },
    { key: CONFIRMATION_STORAGE_KEY, value: handle },
  );
}

export function addFromHomepage(page: Page, name: string) {
  const card = page.locator("article").filter({
    has: page.getByRole("heading", { name, exact: true }),
  });
  return card.getByRole("button", { name: "Add to Cart" }).click();
}

export type CheckoutCustomer = {
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  postalCode?: string;
  instructions?: string;
};

export async function fillCheckout(page: Page, customer: CheckoutCustomer): Promise<void> {
  await page.getByLabel(/Full Name/).fill(customer.fullName);
  await page.getByLabel(/Mobile Number/).fill(customer.phone);
  if (customer.email) {
    await page.getByLabel(/Email Address/).fill(customer.email);
  }
  await page.getByLabel(/Street Address/).fill(customer.street);
  await page.getByLabel(/City \/ District/).fill(customer.city);
  if (customer.postalCode) {
    await page.getByLabel(/Postal \/ Zip Code/).fill(customer.postalCode);
  }
  if (customer.instructions) {
    await page.getByLabel(/Special Delivery Instructions/).fill(customer.instructions);
  }
}

export async function submitDemoOrder(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await page.waitForURL("**/order-confirmation", { timeout: 60_000 });
  await expect(
    page.getByRole("heading", { name: "Your Demo Order Has Been Placed!" }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Artisanal Pieces Ordered")).toBeVisible({
    timeout: 30_000,
  });
}

export async function createGuestOrderViaApi(
  request: APIRequestContext,
  items: Array<{ slug: string; quantity: number }>,
  customer: CheckoutCustomer,
): Promise<{
  id: string;
  reference: string;
  accessToken: string;
  total: number;
}> {
  const db = await getTestDb();
  const docs = await db
    .collection("products")
    .find({ slug: { $in: items.map((item) => item.slug) }, status: "active" })
    .toArray();
  const subtotal = items.reduce((sum, line) => {
    const product = docs.find((doc) => doc.slug === line.slug);
    if (!product) throw new Error(`Missing product ${line.slug}`);
    return sum + (product.price as number) * line.quantity;
  }, 0);

  const response = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      submissionKey: randomUUID(),
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email ?? "",
        street: customer.street,
        city: customer.city,
        postalCode: customer.postalCode ?? "",
        instructions: customer.instructions ?? "",
      },
      items,
      expectedTotal: subtotal,
    },
  });
  if (!response.ok()) {
    throw new Error(`Guest order failed: ${response.status()} ${await response.text()}`);
  }
  const payload = (await response.json()) as {
    order: { id: string; reference: string; total: number };
    accessToken: string;
  };
  return { ...payload.order, accessToken: payload.accessToken };
}

export async function getOrderById(id: string) {
  const db = await getTestDb();
  const { ObjectId } = await import("mongodb");
  return db.collection("orders").findOne({ _id: new ObjectId(id) });
}

export async function countOrders(): Promise<number> {
  const db = await getTestDb();
  return db.collection("orders").countDocuments();
}

export function randomEmail(prefix: string): string {
  return `${prefix}.${randomUUID().slice(0, 8)}@example.com`;
}

export function randomSubmissionKey(): string {
  return randomUUID();
}

export async function createVerifiedUserDirect(
  request: APIRequestContext,
  input: {
    name: string;
    email: string;
    password: string;
    role?: "customer" | "admin";
  },
): Promise<{ id: string; email: string }> {
  const response = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      name: input.name,
      email: input.email,
      password: input.password,
      callbackURL: "/login",
    },
  });
  if (!response.ok()) {
    throw new Error(`Direct sign-up failed: ${response.status()} ${await response.text()}`);
  }
  const payload = (await response.json()) as { user?: { id?: string } };
  const db = await getTestDb();
  await db.collection("user").updateOne(
    { email: input.email.toLowerCase() },
    { $set: { emailVerified: true, role: input.role ?? "customer" } },
  );
  const user = await db
    .collection("user")
    .findOne({ email: input.email.toLowerCase() });
  if (!user) throw new Error("Directly created user was not found.");
  return { id: String(user._id), email: user.email as string };
}

