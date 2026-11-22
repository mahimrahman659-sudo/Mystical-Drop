import { spawn, type ChildProcess } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { expect, test, type APIRequestContext, type Browser } from "@playwright/test";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

type ProductionApp = {
  server: ChildProcess;
  baseUrl: string;
  dbName: string;
};

let app: ProductionApp | undefined;

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not reserve a test port."));
        return;
      }
      probe.close(() => resolve(address.port));
    });
  });
}

async function waitForServer(server: ChildProcess, baseUrl: string): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error("Production email server exited early.");
    }
    try {
      const response = await fetch(`${baseUrl}/api/auth-delivery`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Production email server did not start in time.");
}

async function stopApp(target: ProductionApp | undefined): Promise<void> {
  if (!target) return;
  if (target.server.exitCode === null) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        target.server.kill("SIGKILL");
        resolve();
      }, 10_000);
      target.server.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      target.server.kill();
    });
  }
  const client = new MongoClient(uri);
  await client.connect();
  await client.db(target.dbName).dropDatabase();
  await client.close();
}

async function startApp(
  smtp: "missing" | "unreachable",
): Promise<ProductionApp> {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const dbName = `mystical_drop_e2e_no_smtp_${Date.now()}_${port}`;
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    BETTER_AUTH_URL: baseUrl,
    MONGODB_DB_NAME: dbName,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    DEV_MAILBOX_ENABLED: "1",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  delete env.SMTP_HOST;
  delete env.SMTP_PORT;
  delete env.SMTP_USER;
  delete env.SMTP_PASS;
  delete env.SMTP_FROM;
  delete env.SMTP_SECURE;

  if (smtp === "unreachable") {
    env.SMTP_HOST = "127.0.0.1";
    env.SMTP_PORT = String(await freePort());
    env.SMTP_SECURE = "false";
    env.SMTP_FROM = "Mystical Drop <no-reply@example.com>";
  }

  const server = spawn(
    process.execPath,
    [
      path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
      "start",
      "-p",
      String(port),
    ],
    { cwd: process.cwd(), env, stdio: "ignore" },
  );

  const started = { server, baseUrl, dbName };
  try {
    await waitForServer(server, baseUrl);
  } catch (error) {
    await stopApp(started);
    throw error;
  }
  return started;
}

async function deliveryUnavailableChecks(
  browser: Browser,
  request: APIRequestContext,
  target: ProductionApp,
): Promise<void> {
  const delivery = await request.get(`${target.baseUrl}/api/auth-delivery`);
  expect(delivery.ok()).toBe(true);
  await expect(delivery.json()).resolves.toEqual({
    available: false,
    mode: "unavailable",
  });

  const mailbox = await request.get(`${target.baseUrl}/dev/mailbox`);
  expect(mailbox.status()).toBe(404);

  const page = await browser.newPage({ baseURL: target.baseUrl });
  await page.goto(`${target.baseUrl}/register`);
  await expect(
    page.getByText("Account emails are temporarily unavailable. Please try again shortly."),
  ).toBeVisible();
  await page.getByLabel(/Full name/).fill("Blocked Delivery");
  await page.getByLabel(/Email address/).fill("blocked.delivery@example.com");
  await page.getByLabel(/^Password/).fill("BlockedPass123");
  await page.getByLabel(/Confirm password/).fill("BlockedPass123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/Your account was not created/)).toBeVisible();

  const email = `no.smtp.${randomBytes(4).toString("hex")}@example.com`;
  const client = new MongoClient(uri);
  await client.connect();
  expect(
    await client
      .db(target.dbName)
      .collection("user")
      .countDocuments({ email: "blocked.delivery@example.com" }),
  ).toBe(0);
  await page.close();

  const signUp = await request.post(`${target.baseUrl}/api/auth/sign-up/email`, {
    headers: { Origin: target.baseUrl },
    data: {
      name: "No SMTP Customer",
      email,
      password: "NoSmtpPass123",
      callbackURL: "/login",
    },
  });
  expect(signUp.ok()).toBe(true);
  expect(await signUp.text()).not.toContain("api/auth/verify-email");

  expect(
    await client.db(target.dbName).collection("devMailbox").countDocuments(),
  ).toBe(0);
  await client.close();
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  app = await startApp("missing");
});

test.afterAll(async () => {
  await stopApp(app);
  app = undefined;
});

test("production without SMTP blocks mailbox access and surfaces unavailable delivery", async ({
  browser,
  request,
}) => {
  await deliveryUnavailableChecks(browser, request, app!);
});

test("production with unreachable SMTP does not fall back to the development mailbox", async ({
  browser,
  request,
}) => {
  const unreachable = await startApp("unreachable");
  try {
    await deliveryUnavailableChecks(browser, request, unreachable);
  } finally {
    await stopApp(unreachable);
  }
});
