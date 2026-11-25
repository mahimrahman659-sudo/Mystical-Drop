import { expect, test } from "@playwright/test";
import { resetTestDatabase, seedCart, unpriceTestProducts, waitForAppReady } from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
  // Seeds ship priced (matching production); this spec verifies the unpriced state.
  await unpriceTestProducts();
});

test("unpriced products hide prices and disable purchase across the storefront", async ({
  page,
  request,
}) => {
  const catalog = await request.get("/api/catalog");
  const payload = (await catalog.json()) as {
    products: Array<{ slug: string; price: number | null }>;
  };
  expect(payload.products).toHaveLength(3);
  for (const product of payload.products) {
    expect(product.price, `${product.slug} must be unpriced`).toBeNull();
  }

  await page.goto("/");
  await waitForAppReady(page);
  await expect(page.locator("main article")).toHaveCount(3);
  const comingSoon = page.getByText("Price Coming Soon");
  expect(await comingSoon.count()).toBeGreaterThanOrEqual(3);

  const addButtons = page.getByRole("button", { name: "Add to Cart" });
  await expect(addButtons).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) {
    await expect(addButtons.nth(index)).toBeDisabled();
  }
  const homeText = await page.locator("main").innerText();
  expect(homeText).not.toContain("৳");

  await page.goto("/products/fountain-01");
  await waitForAppReady(page);
  await expect(page.getByText("Price Coming Soon").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to Cart" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Instant Buy" })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Contact us" }).first(),
  ).toBeVisible();
  const productText = await page.locator("main").innerText();
  expect(productText).not.toContain("৳");

  const metadata = await request.get("/products/fountain-01");
  const html = await metadata.text();
  expect(html).not.toContain("৳");
});

test("carts holding unpriced products cannot check out, even with a forged total", async ({
  page,
  request,
}) => {
  await seedCart(page.context(), [{ slug: "fountain-01", quantity: 1 }]);

  await page.goto("/cart");
  await waitForAppReady(page);
  await expect(page.getByText("Price Coming Soon").first()).toBeVisible();
  await expect(
    page.getByText(/does not have a confirmed price yet/i).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Proceed to Checkout" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Checkout unavailable/ }),
  ).toBeVisible();
  const cartText = await page.locator("main").innerText();
  expect(cartText).not.toContain("৳0");

  const origin = process.env.PLAYWRIGHT_BASE_URL!;
  const customer = {
    fullName: "Unpriced Buyer",
    phone: "01712345678",
    email: "",
    street: "House 1, Road 1, Gulshan",
    city: "Dhaka",
    postalCode: "",
    instructions: "",
  };

  const forgedTotal = await request.post("/api/orders", {
    headers: { Origin: origin },
    data: {
      submissionKey: crypto.randomUUID(),
      customer,
      items: [{ slug: "fountain-01", quantity: 1 }],
      expectedTotal: 4200,
    },
  });
  expect(forgedTotal.status()).toBe(409);
  expect((await forgedTotal.json()).code).toBe("PRICE_UNAVAILABLE");

  const zeroTotal = await request.post("/api/orders", {
    headers: { Origin: origin },
    data: {
      submissionKey: crypto.randomUUID(),
      customer,
      items: [{ slug: "fountain-01", quantity: 1 }],
      expectedTotal: 0,
    },
  });
  expect(zeroTotal.status()).toBe(409);
  expect((await zeroTotal.json()).code).toBe("PRICE_UNAVAILABLE");

  const mixedCart = await request.post("/api/orders", {
    headers: { Origin: origin },
    data: {
      submissionKey: crypto.randomUUID(),
      customer,
      items: [
        { slug: "fountain-01", quantity: 1 },
        { slug: "fountain-03", quantity: 1 },
      ],
      expectedTotal: 7650,
    },
  });
  expect(mixedCart.status()).toBe(409);
  expect((await mixedCart.json()).code).toBe("PRICE_UNAVAILABLE");
});
