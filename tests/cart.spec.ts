import { expect, test } from "@playwright/test";
import {
  addFromHomepage,
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
