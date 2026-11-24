import path from "node:path";
import { test } from "@playwright/test";
import { resetTestDatabase, seedCart, waitForAppReady } from "./helpers";

const OUT = path.join(process.cwd(), "test-results", "screenshots");

test("capture visual screenshots", async ({ browser }) => {
  test.setTimeout(300_000);
  await resetTestDatabase();

  const targets = [
    { name: "home", path: "/", seedCart: false },
    { name: "product-01", path: "/products/fountain-01", seedCart: false },
    { name: "product-02", path: "/products/fountain-02", seedCart: false },
    { name: "product-03", path: "/products/fountain-03", seedCart: false },
    { name: "about", path: "/about", seedCart: false },
    { name: "innovation", path: "/innovation", seedCart: false },
    { name: "cart", path: "/cart", seedCart: true },
    { name: "checkout", path: "/checkout", seedCart: true },
  ];
  const viewports = [
    { label: "mobile", width: 390, height: 844 },
    { label: "desktop", width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    if (viewport.label === "mobile") {
      await context.addInitScript(
        ({ key, value }) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        },
        {
          key: "terranova-cart-v1",
          value: [
            { slug: "fountain-01", quantity: 1 },
            { slug: "fountain-03", quantity: 2 },
          ],
        },
      );
    } else {
      await context.addInitScript(
        ({ key, value }) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        },
        {
          key: "terranova-cart-v1",
          value: [
            { slug: "fountain-01", quantity: 1 },
            { slug: "fountain-03", quantity: 2 },
          ],
        },
      );
    }
    const page = await context.newPage();
    for (const target of targets) {
      await page.goto(target.path, { waitUntil: "load", timeout: 60_000 });
      await waitForAppReady(page);
      // Scroll through the page so lazy images start loading, then wait for them.
      await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        window.scrollTo(0, 0);
      });
      await page
        .waitForFunction(
          () =>
            Array.from(document.images).every(
              (img) => img.complete && img.naturalWidth > 0,
            ),
          undefined,
          { timeout: 20_000 },
        )
        .catch(() => undefined);
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(OUT, `${target.name}-${viewport.label}.png`),
        fullPage: true,
      });
    }
    await context.close();
  }
});
