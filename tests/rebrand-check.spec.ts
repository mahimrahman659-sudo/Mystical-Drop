import { expect, test, type Page } from "@playwright/test";
import { resetTestDatabase, waitForAppReady } from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
});

async function headerMetrics(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    const logo = header?.querySelector<HTMLElement>(
      'a[aria-label^="Mystical Drop"]',
    );
    if (!header || !logo) return null;
    const logoRect = logo.getBoundingClientRect();
    const nextInteractive = [
      ...header.querySelectorAll<HTMLElement>("a, button"),
    ]
      .filter((element) => element !== logo && !logo.contains(element))
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.left > logoRect.left + 1)
      .sort((a, b) => a.left - b.left)[0];
    return {
      logoText: logo.innerText,
      logoRight: logoRect.right,
      nextLeft: nextInteractive?.left ?? null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

test("rebrand wordmark, titles, and footer fit the target widths", async ({
  browser,
}) => {
  test.setTimeout(300_000);
  const widths = [320, 390, 768, 1440];
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width === 320 ? 800 : 1000 },
    });
    const page = await context.newPage();
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page).toHaveTitle(
      "Mystical Drop — Artisanal Water Features",
    );
    const logo = page
      .locator("header")
      .getByRole("link", { name: "Mystical Drop — return to homepage" });
    await expect(logo).toBeVisible();
    await expect(logo).toContainText("Mystical Drop");
    await expect(
      page.getByRole("link", { name: /^Cart,/ }),
    ).toBeVisible();
    const accountButton = page.getByRole("button", { name: "Account menu" });
    await expect(accountButton).toBeVisible();
    await accountButton.click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await page.keyboard.press("Escape");
    if (width < 768) {
      await expect(
        page.getByRole("button", { name: "Open menu" }),
      ).toBeVisible();
    }
    const metrics = await headerMetrics(page);
    expect(metrics).not.toBeNull();
    expect(metrics!.logoText).toContain("Mystical Drop");
    expect(metrics!.scrollWidth).toBeLessThanOrEqual(metrics!.clientWidth + 1);
    if (metrics!.nextLeft !== null) {
      expect(metrics!.logoRight).toBeLessThanOrEqual(metrics!.nextLeft + 1);
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(
      page.locator("footer").getByText("Mystical Drop", { exact: true }).first(),
    ).toBeVisible();
    const footerOverflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(footerOverflow.scroll).toBeLessThanOrEqual(footerOverflow.client + 1);
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 1024, height: 900 } });
  const page = await context.newPage();
  await page.goto("/login");
  await expect(page).toHaveTitle("Sign in • Mystical Drop");
  await page.goto("/register");
  await expect(page).toHaveTitle("Create account • Mystical Drop");
  await context.close();
});
