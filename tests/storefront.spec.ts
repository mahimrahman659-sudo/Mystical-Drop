import { expect, test, type Page } from "@playwright/test";
import {
  addFromHomepage,
  createGuestOrderViaApi,
  getTestDb,
  priceTestProducts,
  resetTestDatabase,
  seedCart,
  seedConfirmationHandle,
  waitForAppReady,
} from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
  await priceTestProducts();
});

async function waitForImages(page: Page) {
  // Scroll through the page so lazy images start loading, then wait for all
  // of them. On timeout the poll reports the exact sources still pending.
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  });
  await expect
    .poll(
      async () =>
        page.evaluate(() =>
          Array.from(document.images)
            .filter((img) => !(img.complete && img.naturalWidth > 0))
            .map((img) => (img as HTMLImageElement).currentSrc || img.src),
        ),
      { timeout: 30_000, message: "Images that failed to load in time" },
    )
    .toEqual([]);
}

async function expectNoOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
}

test("storefront search, favorites, gallery, and mobile menu", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Mystical Drop — Artisanal Water Features");
  await expect(
    page
      .locator("header")
      .getByRole("link", { name: "Mystical Drop — return to homepage" }),
  ).toBeVisible();
  await expect(
    page
      .locator("#collection")
      .getByRole("heading", { name: "Little Fountains. Beautiful Details." }),
  ).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(3);

  await page.getByRole("button", { name: "Search fountains" }).click();
  const search = page.getByRole("dialog", { name: "Find your fountain" });
  await expect(search).toBeVisible();
  await search.getByLabel(/Search fountains by name/).fill("woodland");
  await expect(
    search.getByRole("link", { name: /Woodland Tree & Well Fountain/ }),
  ).toBeVisible();
  await search
    .getByRole("link", { name: /Woodland Tree & Well Fountain/ })
    .click();
  await expect(page).toHaveURL(/\/products\/fountain-03$/);
  await expect(page).toHaveTitle(
    "Woodland Tree & Well Fountain • Mystical Drop",
  );

  await page.getByRole("button", { name: /Save Woodland Tree & Well Fountain/ }).click();
  await page.getByRole("button", { name: "Favorites, 1 saved" }).click();
  const favorites = page.getByRole("dialog", { name: "Your Favorites" });
  await expect(favorites).toBeVisible();
  await expect(
    favorites.getByRole("link", { name: "Woodland Tree & Well Fountain" }),
  ).toBeVisible();
  await favorites
    .getByRole("button", { name: /Remove Woodland Tree & Well Fountain/ })
    .click();
  await expect(favorites.getByText("Nothing saved yet")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Show View 02/ }).click();
  await expect(
    page.getByText("Showing View 02: Trunk and bowl detail"),
  ).toBeAttached();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page
      .locator("header")
      .getByRole("link", { name: "Mystical Drop — return to homepage" }),
  ).toBeVisible();
  await expectNoOverflow(page);
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: "Site menu" });
  await expect(menu.getByRole("link", { name: "Our Fountains" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Create account" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(menuButton).toBeFocused();
});

test("homepage verification metadata and public privacy page", async ({
  page,
  request,
}) => {
  const homepage = await request.get("/");
  expect(homepage.status()).toBe(200);
  const homepageHtml = await homepage.text();
  expect(homepageHtml).toMatch(
    /<meta[^>]*google-site-verification[^>]*SrK0VfQ50nOdwRILvb6jaRvHWW6Edd2Ekq84ZdR94S0/,
  );

  await page.goto("/");
  await waitForAppReady(page);
  await expect(page).toHaveTitle("Mystical Drop — Artisanal Water Features");
  await expect(
    page.locator('head meta[name="google-site-verification"]'),
  ).toHaveAttribute(
    "content",
    "SrK0VfQ50nOdwRILvb6jaRvHWW6Edd2Ekq84ZdR94S0",
  );
  await expect(
    page.getByText(/tabletop water fountains/i).first(),
  ).toBeVisible();
  await expect(
    page
      .locator("header")
      .getByRole("link", { name: "Mystical Drop — return to homepage" }),
  ).toBeVisible();

  const privacyLink = page.getByRole("link", { name: "Privacy Policy" });
  await expect(privacyLink).toHaveAttribute("href", "/privacy");
  await privacyLink.click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page).toHaveTitle("Privacy Policy • Mystical Drop");
  await expect(
    page.getByRole("heading", { name: "Privacy Policy", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(/Google sign-in is optional/i)).toBeVisible();
});

test("empty cart is rendered from live catalog availability", async ({ page }) => {
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Your Cart is Currently Empty" }),
  ).toBeVisible();
  await expect(page.getByText("(0 items)")).toBeVisible();
  await expect(page.locator("footer")).toContainText("Mystical Drop");

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Place Demo Order/ })).toHaveCount(0);

  const missing = await page.goto("/products/not-a-fountain");
  expect(missing?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This path has run dry." }),
  ).toBeVisible();
});

test("catalog wording stays accurate for zero, three, and four active products", async ({
  page,
  request,
}) => {
  test.slow();
  const db = await getTestDb();
  const products = db.collection("products");

  await page.goto("/");
  await expect(
    page
      .locator("#collection")
      .getByRole("heading", { name: "Little Fountains. Beautiful Details.", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator("header")
      .getByRole("link", { name: "Our Fountains", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(3);
  await expect(
    page.locator("#craftsmanship").getByText("3", { exact: true }),
  ).toBeVisible();

  const fixtureSource = await products.findOne({ slug: "fountain-02" });
  if (!fixtureSource) throw new Error("Seed product missing.");
  const { _id, seedId, ...copy } = fixtureSource;
  await products.insertOne({
    ...copy,
    slug: "fourth-fixture",
    name: "Fourth Fixture Fountain",
    shortName: "Fourth Fixture",
    catalogNumber: "04",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await page.reload({ waitUntil: "load" });
  await waitForAppReady(page);
  await expect(page.locator("main article")).toHaveCount(4);
  await expect(
    page.locator("#craftsmanship").getByText("4", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Our Three Handcrafted Fountains" }),
  ).toHaveCount(0);
  const fourProductCatalog = await request.get("/api/catalog");
  const fourProducts = (await fourProductCatalog.json()) as {
    products: unknown[];
  };
  expect(fourProducts.products).toHaveLength(4);

  await products.updateMany({}, { $set: { status: "archived" } });
  await page.reload({ waitUntil: "load" });
  await waitForAppReady(page);
  await expect(
    page.getByRole("heading", { name: "The collection is being prepared" }),
  ).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(0);
  await expect(page.locator("footer")).toContainText(
    "No fountains are currently listed.",
  );
  const emptyCatalog = await request.get("/api/catalog");
  const emptyProducts = (await emptyCatalog.json()) as { products: unknown[] };
  expect(emptyProducts.products).toHaveLength(0);
});

test("storefront pages fit every viewport with real images and confirmed order", async ({
  browser,
  request,
}) => {
  test.slow();
  const order = await createGuestOrderViaApi(request, [
    { slug: "fountain-01", quantity: 1 },
    { slug: "fountain-02", quantity: 1 },
  ], {
    fullName: "Guest Responsive",
    phone: "01712345678",
    email: "guest.responsive@example.com",
    street: "House 1, Road 2, Banani",
    city: "Dhaka",
    postalCode: "1213",
  });
  expect(order.total).toBe(8050);

  const viewports = [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 1000 },
    { width: 844, height: 390 },
    { width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    await seedCart(context, [
      { slug: "fountain-01", quantity: 1 },
      { slug: "fountain-02", quantity: 1 },
    ]);
    await seedConfirmationHandle(context, {
      orderId: order.id,
      accessToken: order.accessToken,
    });
    const page = await context.newPage();

    const routes = [
      { path: "/", heading: /Little Fountains/ },
      { path: "/products/fountain-01", heading: /Rustic Miniature Well Fountain/ },
      { path: "/cart", heading: /Your Peaceful Cart/ },
      { path: "/checkout", heading: /Checkout/ },
      { path: "/order-confirmation", heading: /Your Demo Order Has Been Placed/ },
    ];

    for (const route of routes) {
      await page.goto(route.path, { waitUntil: "load", timeout: 120_000 });
      await waitForAppReady(page);
      await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
      await waitForImages(page);
      await page.locator("footer").scrollIntoViewIfNeeded();
      await expect(page.locator("footer")).toContainText("Mystical Drop");
      await expectNoOverflow(page);
    }

    await context.close();
  }
});
