import { expect, test } from "@playwright/test";
import {
  addFromHomepage,
  fillCheckout,
  getTestDb,
  resetTestDatabase,
  waitForAppReady,
} from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
});

test("cart quantities, removal, clearing, and invalid stored data", async ({ page }) => {
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await addFromHomepage(page, "Bamboo Cascade Water Fountain");
  await page.goto("/cart");
  await waitForAppReady(page);
  await expect(page.getByText("(2 items)")).toBeVisible();

  const bambooLine = () =>
    page.locator("main li").filter({
      has: page.getByRole("heading", { name: "Bamboo Cascade", exact: true }),
    });

  await bambooLine()
    .getByRole("group", { name: /Quantity for Bamboo Cascade Water Fountain/ })
    .getByRole("button", { name: "Increase quantity" })
    .click();
  await expect(page.getByText("(3 items)")).toBeVisible();
  await expect(page.locator("aside").getByText("৳11,900").first()).toBeVisible();

  await page.reload();
  await waitForAppReady(page);
  await expect(page.getByText("(3 items)")).toBeVisible();

  await bambooLine()
    .getByRole("group", { name: /Quantity for Bamboo Cascade Water Fountain/ })
    .getByRole("button", { name: "Decrease quantity" })
    .click();
  await expect(page.getByText("(2 items)")).toBeVisible();

  await page.getByRole("button", {
    name: "Remove Rustic Tree & Stone Well Fountain from cart",
  }).click();
  await expect(page.getByText("(1 item)")).toBeVisible();
  await expect(page.locator("aside").getByText("৳3,850").first()).toBeVisible();

  await page.getByRole("button", { name: "Clear Entire Cart" }).click();
  await page.getByRole("dialog", { name: "Clear your entire cart?" }).getByRole("button", { name: "Clear cart" }).click();
  await expect(page.getByRole("heading", { name: "Your Cart is Currently Empty" })).toBeVisible();

  await page.evaluate(() => {
    localStorage.setItem(
      "terranova-cart-v1",
      JSON.stringify([
        { slug: "rustic-tree-stone-well", quantity: 0 },
        { slug: "bamboo-cascade", quantity: -1 },
        { slug: "terracotta-pot", quantity: 1.5 },
        { slug: "unknown-product", quantity: 2 },
        { slug: "rustic-tree-stone-well", quantity: 2 },
      ]),
    );
  });
  await page.reload();
  await waitForAppReady(page);
  await expect(page.getByText("(3 items)")).toBeVisible();
  await expect(page.locator("aside").getByText("৳11,850").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bamboo Cascade", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Rustic Tree & Stone Well", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Terracotta Pot", exact: true })).toBeVisible();
});

test("catalog outage preserves the cart and recovers without data loss", async ({
  page,
}) => {
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Catalog unavailable." }),
    }),
  );

  await page.goto("/cart");
  await expect(page.getByText("The cart catalog is unavailable")).toBeVisible();
  await expect(page.getByText(/saved cart has not been erased/i)).toBeVisible();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("terranova-cart-v1") ?? "[]"),
  );
  expect(stored).toEqual([{ slug: "rustic-tree-stone-well", quantity: 1 }]);

  await page.unroute("**/api/catalog");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Rustic Tree & Stone Well", exact: true }),
  ).toBeVisible();
  await expect(page.locator("aside").getByText("৳4,200").first()).toBeVisible();
});

test("archived cart items are surfaced and can be removed", async ({ page }) => {
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await addFromHomepage(page, "Bamboo Cascade Water Fountain");

  const db = await getTestDb();
  await db
    .collection("products")
    .updateOne(
      { slug: "rustic-tree-stone-well" },
      { $set: { status: "archived" } },
    );

  await page.goto("/cart");
  await waitForAppReady(page);
  await expect(
    page.getByText(/1 saved fountain is no longer available/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rustic Tree & Stone Well", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("aside").getByText("৳3,850").first()).toBeVisible();

  await page.getByRole("button", { name: "Remove unavailable items" }).click();
  await expect(
    page.getByText(/saved fountain is no longer available/i),
  ).toHaveCount(0);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("terranova-cart-v1") ?? "[]"),
  );
  expect(stored).toEqual([{ slug: "bamboo-cascade", quantity: 1 }]);
});

test("a rejected price change refreshes the checkout total and keeps the cart", async ({
  page,
}) => {
  test.slow();
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await waitForAppReady(page);
  await fillCheckout(page, {
    fullName: "Price Change Shopper",
    phone: "01712345678",
    street: "House 1, Road 2, Gulshan",
    city: "Dhaka",
  });

  const db = await getTestDb();
  await db
    .collection("products")
    .updateOne(
      { slug: "rustic-tree-stone-well" },
      { $set: { price: 5000 } },
    );

  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await expect(page.getByText(/price of one or more fountains has changed/i)).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByRole("button", { name: /Place Demo Order \(৳5,000\)/ }),
  ).toBeVisible({ timeout: 15_000 });
  expect(await db.collection("orders").countDocuments()).toBe(0);
  await expect(
    page.locator("aside").getByText("Rustic Tree & Stone Well").first(),
  ).toBeVisible();
});

test("an interrupted checkout response is idempotent after reload", async ({ page }) => {
  test.slow();
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await waitForAppReady(page);
  const customer = {
    fullName: "Interrupted Checkout",
    phone: "01712345678",
    street: "House 9, Road 3, Dhanmondi",
    city: "Dhaka",
  };
  await fillCheckout(page, customer);

  let intercepted = false;
  await page.route("**/api/orders", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (!intercepted && path === "/api/orders") {
      intercepted = true;
      await route.fetch();
      await route.abort("failed");
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  const db = await getTestDb();
  await expect
    .poll(() => db.collection("orders").countDocuments(), { timeout: 30_000 })
    .toBe(1);

  await page.reload();
  await waitForAppReady(page);
  await fillCheckout(page, customer);
  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await page.waitForURL("**/order-confirmation", { timeout: 60_000 });
  await expect(
    page.getByRole("heading", { name: "Your Demo Order Has Been Placed!" }),
  ).toBeVisible();
  expect(await db.collection("orders").countDocuments()).toBe(1);
});

test("two tabs submit the first checkout attempt simultaneously", async ({
  browser,
}) => {
  test.slow();
  const db = await getTestDb();
  const references: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const context = await browser.newContext();
    const firstPage = await context.newPage();
    await firstPage.goto("/");
    await waitForAppReady(firstPage);
    await addFromHomepage(firstPage, "Rustic Tree & Stone Well Fountain");
    expect(
      await firstPage.evaluate(() =>
        localStorage.getItem("terranova-checkout-attempts-v1"),
      ),
    ).toBeNull();

    const secondPage = await context.newPage();
    await Promise.all([
      firstPage.goto("/checkout"),
      secondPage.goto("/checkout"),
    ]);
    await Promise.all([waitForAppReady(firstPage), waitForAppReady(secondPage)]);

    for (const page of [firstPage, secondPage]) {
      await expect(
        page.getByRole("button", { name: /Place Demo Order/ }),
      ).toBeVisible();
      await fillCheckout(page, {
        fullName: `Two Tab Shopper ${attempt}`,
        phone: "01712345678",
        street: "House 7, Road 5, Gulshan",
        city: "Dhaka",
      });
    }

    await expect
      .poll(async () =>
        firstPage.evaluate(() => {
          const raw = localStorage.getItem("terranova-checkout-attempts-v1");
          return raw ? Object.keys(JSON.parse(raw) as object).length : 0;
        }),
      )
      .toBe(1);
    const attempts = await Promise.all(
      [firstPage, secondPage].map((page) =>
        page.evaluate(() =>
          JSON.parse(
            localStorage.getItem("terranova-checkout-attempts-v1") ?? "{}",
          ),
        ),
      ),
    );
    expect(Object.values(attempts[0] as object)).toHaveLength(1);
    expect(attempts[1]).toEqual(attempts[0]);

    await context.route("**/api/orders", async (route) => {
      if (new URL(route.request().url()).pathname !== "/api/orders") {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 1_200));
      await route.fulfill({ response });
    });

    await Promise.all(
      [firstPage, secondPage].map((page) =>
        page.evaluate(() => {
          document
            .querySelector<HTMLFormElement>("#checkout-form")
            ?.requestSubmit();
        }),
      ),
    );
    await Promise.all([
      firstPage.waitForURL("**/order-confirmation", { timeout: 60_000 }),
      secondPage.waitForURL("**/order-confirmation", { timeout: 60_000 }),
    ]);

    const confirmationReferences = await Promise.all(
      [firstPage, secondPage].map(async (page) => {
        await expect(
          page.getByRole("heading", { name: "Your Demo Order Has Been Placed!" }),
        ).toBeVisible();
        const text = await page.locator("body").innerText();
        return text.match(/#TNV-\d{5}/)?.[0] ?? "";
      }),
    );
    expect(confirmationReferences[0]).toBeTruthy();
    expect(confirmationReferences[1]).toBe(confirmationReferences[0]);
    references.push(confirmationReferences[0]);
    expect(await db.collection("orders").countDocuments()).toBe(attempt);
    await context.close();
  }

  expect(new Set(references).size).toBe(2);
});

test("a genuinely new purchase creates a second order", async ({ page }) => {
  test.slow();
  const customer = {
    fullName: "Repeat Shopper",
    phone: "01712345678",
    street: "House 6, Road 9, Banani",
    city: "Dhaka",
  };

  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Tree & Stone Well Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await waitForAppReady(page);
  await fillCheckout(page, customer);
  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await page.waitForURL("**/order-confirmation", { timeout: 60_000 });

  await page.getByRole("link", { name: "Continue Shopping" }).click();
  await waitForAppReady(page);
  await addFromHomepage(page, "Bamboo Cascade Water Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await waitForAppReady(page);
  await fillCheckout(page, customer);
  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await page.waitForURL("**/order-confirmation", { timeout: 60_000 });
  await expect(
    page.getByRole("heading", { name: "Your Demo Order Has Been Placed!" }),
  ).toBeVisible();

  const db = await getTestDb();
  const orders = await db.collection("orders").find({}).toArray();
  expect(orders).toHaveLength(2);
  expect(new Set(orders.map((order) => order.reference)).size).toBe(2);
});

test("Instant Buy preserves existing cart items and selected quantity", async ({ page }) => {
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Bamboo Cascade Water Fountain");
  await page.goto("/products/rustic-tree-stone-well");
  await waitForAppReady(page);

  const quantity = page.getByRole("group", { name: "Quantity" });
  await quantity.getByRole("button", { name: "Increase quantity" }).click();
  await quantity.getByRole("button", { name: "Increase quantity" }).click();
  await expect(quantity.getByText("3")).toBeVisible();
  await page.getByRole("button", { name: "Instant Buy" }).click();

  await page.waitForURL("**/checkout");
  await waitForAppReady(page);
  const summary = page.locator("aside");
  await expect(summary.getByText("Rustic Tree & Stone Well").first()).toBeVisible();
  await expect(summary.getByText("Bamboo Cascade").first()).toBeVisible();
  await expect(summary.getByText("3x")).toBeVisible();
  await expect(summary.getByText("1x")).toBeVisible();
  await expect(summary.getByText("৳16,450").first()).toBeVisible();
});
