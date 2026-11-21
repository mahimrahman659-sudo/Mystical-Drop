import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { startTestSmtp } from "./test-smtp";

const TEST_PORT = Number(process.env.E2E_PORT || 3100);
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function run(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
  shell = false,
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
      shell,
    });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function main() {
  console.log("Preparing an isolated MongoDB test database…");
  const mongo = await MongoMemoryServer.create({
    instance: { launchTimeout: 60_000 },
  });
  const captureFile = path.join(
    os.tmpdir(),
    `terranova-smtp-${Date.now()}-${randomBytes(4).toString("hex")}.jsonl`,
  );
  const smtp = await startTestSmtp(captureFile);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    MONGODB_URI: mongo.getUri(),
    MONGODB_DB_NAME: `terranova_e2e_${Date.now()}`,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: BASE_URL,
    PLAYWRIGHT_BASE_URL: BASE_URL,
    PORT: String(TEST_PORT),
    DEV_MAILBOX_ENABLED: "1",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(smtp.port),
    SMTP_SECURE: "false",
    SMTP_FROM: "TerraNova <no-reply@example.com>",
    E2E_SMTP_CAPTURE_FILE: captureFile,
    NEXT_TELEMETRY_DISABLED: "1",
  };
  delete env.SMTP_USER;
  delete env.SMTP_PASS;

  Object.assign(process.env, env);

  try {
    console.log("Building the production bundle for the test run…");
    const buildExit = await run(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "build"],
      env,
      process.platform === "win32",
    );
    if (buildExit !== 0) {
      process.exitCode = buildExit;
      return;
    }

    const { setupDatabase } = await import("../lib/db/setup");
    await setupDatabase();
    const { getMongoClient } = await import("../lib/db/client");
    await getMongoClient().close();

    console.log("Starting Playwright against the isolated MongoDB database…");
    const testExit = await run(
      process.execPath,
      [
        path.join(process.cwd(), "node_modules", "playwright", "cli.js"),
        "test",
        ...process.argv.slice(2),
      ],
      env,
    );
    process.exitCode = testExit;
  } finally {
    await smtp.close();
    await mongo.stop();
  }
}

main().catch((error: unknown) => {
  console.error(
    "E2E setup failed:",
    error instanceof Error ? error.message : "unknown error",
  );
  process.exitCode = 1;
});
