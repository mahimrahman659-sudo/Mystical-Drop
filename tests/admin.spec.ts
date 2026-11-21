import { expect, test } from "@playwright/test";
import {
  createGuestOrderViaApi,
  createVerifiedUserDirect,
  getProductPrice,
  getTestDb,
  loginViaUi,
  promoteAdmin,
  resetTestDatabase,
  runDbSetup,
} from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
});

async function loginAsAdmin(
  page: Parameters<typeof loginViaUi>[0],
  request: Parameters<typeof createVerifiedUserDirect>[0],
  email = "admin@example.com",
) {
  await createVerifiedUserDirect(request, {
    name: "Studio Admin",
    email,
    password: "AdminPass12345",
    role: "admin",
  });
  await loginViaUi(page, email, "AdminPass12345");
}

test("operator promotion is idempotent and admin boundaries are enforced", async ({
  browser,
  page,
  request,
}) => {
  await createVerifiedUserDirect(request, {
    name: "Promoted Admin",
    email: "promoted@example.com",
    password: "AdminPass12345",
  });
  promoteAdmin("promoted@example.com");
  promoteAdmin("promoted@example.com");

  await loginViaUi(page, "promoted@example.com", "AdminPass12345");
  await page.goto("/account");
  await page.getByRole("button", { name: /Account menu for/ }).click();
  await expect(
    page.getByRole("link", { name: "Admin panel", exact: true }),
  ).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Payment is not collected")).toBeVisible();

  await createVerifiedUserDirect(request, {
    name: "Normal Customer",
    email: "normal.customer@example.com",
    password: "CustomerPass123",
  });
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await loginViaUi(customerPage, "normal.customer@example.com", "CustomerPass123");
  await customerPage.goto("/admin");
  await expect(
    customerPage.getByRole("heading", { name: "This area is restricted" }),
  ).toBeVisible();
  await customerContext.close();

  const anonymousContext = await browser.newContext();
  const anonymousPage = await anonymousContext.newPage();
  await anonymousPage.goto("/admin");
  await expect(anonymousPage).toHaveURL(/\/login\?returnTo=%2Fadmin/);
  await anonymousContext.close();
});

test("product editing, validation, archival, and setup idempotency", async ({
  page,
  request,
}) => {
  test.slow();
  await loginAsAdmin(page, request);
  const guestOrder = await createGuestOrderViaApi(
    request,
    [{ slug: "rustic-tree-stone-well", quantity: 1 }],
    {
      fullName: "Snapshot Guest",
      phone: "01712345678",
      email: "snapshot@example.com",
      street: "House 8, Road 9, Mohammadpur",
      city: "Dhaka",
    },
  );

  await page.goto("/admin/products/rustic-tree-stone-well/edit");
  await page.getByLabel(/Price \(BDT\)/).fill("4500");
  await page.getByRole("button", { name: "Save product" }).click();
  await page.waitForURL(/\/admin\/products\?saved=updated/, { timeout: 30_000 });

  await page.goto("/products/rustic-tree-stone-well");
  await expect(page.getByText("৳4,500").first()).toBeVisible();

  const db = await getTestDb();
  const snapshot = await db.collection("orders").findOne({ reference: guestOrder.reference });
  expect(snapshot?.items[0]?.unitPrice).toBe(4200);
  expect(snapshot?.items[0]?.lineTotal).toBe(4200);

  const setupOutput = runDbSetup();
  expect(setupOutput).toContain("Running setup again is safe");
  expect(await getProductPrice("rustic-tree-stone-well")).toBe(4500);
  expect(await db.collection("orders").countDocuments()).toBe(1);

  await page.goto("/admin/products");
  const rusticRow = page.locator("li").filter({
    has: page.getByRole("heading", { name: "Rustic Tree & Stone Well Fountain" }),
  });
  await rusticRow.getByRole("button", { name: "Archive" }).click();
  await page.waitForURL(/saved=status/, { timeout: 30_000 });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Rustic Tree & Stone Well Fountain" }),
  ).toHaveCount(0);
  await page.goto("/products/rustic-tree-stone-well");
  await expect(page.getByText(/Archived/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Cart" })).toHaveCount(0);

  const archivedOrder = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      submissionKey: crypto.randomUUID(),
      customer: {
        fullName: "Archived Attempt",
        phone: "01712345678",
        email: "archived@example.com",
        street: "House 5, Road 6, Uttara",
        city: "Dhaka",
        postalCode: "1230",
        instructions: "",
      },
      items: [{ slug: "rustic-tree-stone-well", quantity: 1 }],
      expectedTotal: 4500,
    },
  });
  expect(archivedOrder.status()).toBe(409);

  await page.goto("/admin/products");
  const archivedRow = page.locator("li").filter({
    has: page.getByRole("heading", { name: "Rustic Tree & Stone Well Fountain" }),
  });
  await archivedRow.getByRole("button", { name: "Restore" }).click();
  await page.waitForURL(/saved=status/, { timeout: 30_000 });

  await page.goto("/admin/products/new");
  await page.getByLabel(/Product name/).fill("Mist and Reed Fountain");
  await page.getByLabel(/Short name/).fill("Mist and Reed");
  await page.getByLabel(/URL slug/).fill("mist-and-reed");
  await page.getByLabel(/Card description/).fill(
    "A quiet reed-and-stone fountain made for a small reading room.",
  );
  await page.getByLabel(/Product page description/).fill(
    "A hand-finished stone and reed fountain designed for a slow, quiet room.",
  );
  await page.getByLabel(/Price \(BDT\)/).fill("0");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByText(/Price must be greater than zero/)).toBeVisible();

  await page.getByLabel(/URL slug/).fill("bamboo-cascade");
  await page.getByLabel(/Price \(BDT\)/).fill("3999");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page.getByText(/That slug is already in use/)).toBeVisible();

  await page.getByLabel(/URL slug/).fill("mist-and-reed");
  await page.getByRole("button", { name: "Create product" }).click();
  await page.waitForURL(/\/admin\/products\?saved=created/, { timeout: 30_000 });
  await page.goto("/products/mist-and-reed");
  await expect(page.getByText("Mist and Reed Fountain").first()).toBeVisible();
  await expect(page.getByText("৳3,999").first()).toBeVisible();
});

test("admin order search, filters, permitted transitions, and stale/invalid updates", async ({
  page,
  request,
}) => {
  test.slow();
  await loginAsAdmin(page, request);
  const first = await createGuestOrderViaApi(
    request,
    [{ slug: "bamboo-cascade", quantity: 1 }],
    {
      fullName: "Order One",
      phone: "01712345678",
      email: "order.one@example.com",
      street: "House 4, Road 5, Banani",
      city: "Dhaka",
    },
  );
  const second = await createGuestOrderViaApi(
    request,
    [{ slug: "terracotta-pot", quantity: 1 }],
    {
      fullName: "Order Two",
      phone: "01812345678",
      email: "order.two@example.com",
      street: "House 3, Road 2, Dhanmondi",
      city: "Dhaka",
    },
  );

  const db = await getTestDb();
  const firstDoc = await db.collection("orders").findOne({ reference: first.reference });
  const secondDoc = await db.collection("orders").findOne({ reference: second.reference });
  const firstUrl = `/admin/orders/${firstDoc!._id}`;
  const secondUrl = `/admin/orders/${secondDoc!._id}`;

  await page.goto("/admin/orders");
  await page.getByLabel(/Search by reference/).fill(first.reference);
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(`#${first.reference}`)).toBeVisible();
  await expect(page.getByText(`#${second.reference}`)).toHaveCount(0);

  await page.goto("/admin/orders");
  await page.getByLabel(/Fulfilment status/).selectOption("pending");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(`#${first.reference}`)).toBeVisible();
  await expect(page.getByText(`#${second.reference}`)).toBeVisible();

  await page.goto(firstUrl, { waitUntil: "networkidle" });
  const stalePage = await page.context().newPage();
  await stalePage.goto(firstUrl, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Mark as Confirmed/ }).click();
  await page.waitForURL(/updated=1/, { timeout: 30_000 });
  await expect(page.getByText(/Fulfilment status updated/)).toBeVisible();

  const confirmed = await db.collection("orders").findOne({ reference: first.reference });
  expect(confirmed?.fulfillmentStatus).toBe("confirmed");
  expect(confirmed?.statusHistory.at(-1).changedBy.email).toBe("admin@example.com");
  expect(confirmed?.paymentStatus).toBe("not_collected");

  await stalePage.getByRole("button", { name: /Mark as Confirmed/ }).click();
  await stalePage.waitForURL(/error=stale/, { timeout: 30_000 });
  await stalePage.close();

  await page.goto(firstUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Mark as Shipped/ }).click();
  await expect
    .poll(
      async () =>
        (await db.collection("orders").findOne({ reference: first.reference }))
          ?.fulfillmentStatus,
      { timeout: 30_000 },
    )
    .toBe("shipped");

  await page.goto(firstUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const form = Array.from(document.querySelectorAll("form")).find((item) =>
      item.textContent?.includes("Move one step"),
    );
    if (form) {
      const button = document.createElement("button");
      button.type = "submit";
      button.name = "nextStatus";
      button.value = "pending";
      button.textContent = "Forge transition";
      form.appendChild(button);
    }
  });
  await page.getByRole("button", { name: "Forge transition" }).click();
  await page.waitForURL(/error=invalid/, { timeout: 30_000 });

  await page.goto(secondUrl, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Cancel order" }).click();
  await page.waitForURL(/updated=1/, { timeout: 30_000 });
  const cancelled = await db.collection("orders").findOne({ reference: second.reference });
  expect(cancelled?.fulfillmentStatus).toBe("cancelled");

  await page.goto("/admin/orders");
  await page.getByLabel(/Fulfilment status/).selectOption("cancelled");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText(`#${second.reference}`)).toBeVisible();

  await page.goto("/admin/orders");
  await page.getByLabel(/Search by reference/).fill("NOPE");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("No matching orders")).toBeVisible();
});

test("admin can upload a product image and homepage banner", async ({
  page,
  request,
}) => {
  test.slow();
  await loginAsAdmin(page, request);
  const imagePath = "public/images/terracotta-detail.jpg";

  await page.goto("/admin/products/rustic-tree-stone-well/edit");
  await page
    .getByLabel("Upload Main image", { exact: true })
    .setInputFiles(imagePath);
  const productImage = page.locator('input[type="hidden"][name="imageSrc"]');
  await expect(productImage).toHaveValue(
    /^\/api\/media\/[a-f0-9]{24}$/,
    { timeout: 30_000 },
  );
  const productImageSrc = await productImage.inputValue();
  await page.getByRole("button", { name: "Save product" }).click();
  await page.waitForURL(/\/admin\/products\?saved=updated/, {
    timeout: 30_000,
  });

  const db = await getTestDb();
  const product = await db
    .collection("products")
    .findOne({ slug: "rustic-tree-stone-well" });
  expect(product?.image?.src).toBe(productImageSrc);
  const imageResponse = await request.get(productImageSrc);
  expect(imageResponse.status()).toBe(200);
  expect(imageResponse.headers()["content-type"]).toBe("image/webp");

  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "Site banner" }),
  ).toBeVisible();
  await page
    .getByLabel("Upload Banner image", { exact: true })
    .setInputFiles(imagePath);
  const bannerImage = page.locator('input[type="hidden"][name="imageSrc"]');
  await expect(bannerImage).toHaveValue(/^\/api\/media\/[a-f0-9]{24}$/, {
    timeout: 30_000,
  });
  const bannerImageSrc = await bannerImage.inputValue();
  await page
    .getByLabel(/Banner image description/)
    .fill("Uploaded verification banner");
  await page.getByRole("button", { name: "Save banner" }).click();
  await expect(page.getByText("Homepage banner updated.")).toBeVisible();

  const settings = await db
    .collection("siteSettings")
    .findOne({ key: "homeBanner" });
  expect(settings?.imageSrc).toBe(bannerImageSrc);
  expect(settings?.imageAlt).toBe("Uploaded verification banner");

  const home = await request.get("/");
  expect(home.status()).toBe(200);
  expect(await home.text()).toContain("Uploaded verification banner");
});

test("admin screens fit phone, tablet, and desktop widths", async ({
  page,
  request,
}) => {
  test.slow();
  await loginAsAdmin(page, request);
  const order = await createGuestOrderViaApi(
    request,
    [{ slug: "bamboo-cascade", quantity: 1 }],
    {
      fullName: "Responsive Admin Order",
      phone: "01712345678",
      email: "responsive.order@example.com",
      street: "House 7, Road 8, Gulshan",
      city: "Dhaka",
    },
  );

  const widths = [320, 390, 768, 1440];
  const pages = [
    { path: "/account", heading: /Your quiet corner/ },
    { path: "/admin", heading: /Overview/ },
    { path: "/admin/products", heading: /Products/ },
    { path: "/admin/products/new", heading: /New product/ },
    { path: "/admin/products/rustic-tree-stone-well/edit", heading: /Edit product/ },
    { path: "/admin/orders", heading: /Orders/ },
    { path: `/admin/orders/${order.id}`, heading: new RegExp(`#${order.reference}`) },
    { path: "/admin/settings", heading: /Site banner/ },
  ];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const item of pages) {
      await page.goto(item.path, { waitUntil: "networkidle", timeout: 120_000 });
      await expect(page.getByRole("heading", { name: item.heading }).first()).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(overflow.scroll, `${item.path} at ${width}px`).toBeLessThanOrEqual(
        overflow.client + 1,
      );
    }

    if (width === 320) {
      await page.goto("/account", { waitUntil: "networkidle" });
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Site menu" });
      await expect(menu.getByRole("link", { name: "Account" })).toBeVisible();
      await expect(
        menu.getByRole("link", { name: "Admin panel", exact: true }),
      ).toBeVisible();
      await expect(menu.getByRole("button", { name: "Sign out" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
    }
  }
});
