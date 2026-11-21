import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    trace: "off",
    screenshot: "off",
  },
  webServer: {
    command: "npm start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
