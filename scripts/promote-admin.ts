import "./load-env";
import { normalizeEmail } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";

function argumentValue(name: string): string | undefined {
  const exact = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (exact) return exact.slice(name.length + 3);

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Add it to .env.local before promoting an admin.",
    );
    process.exitCode = 1;
    return;
  }

  const emailInput = argumentValue("email");
  if (!emailInput) {
    console.error(
      "Usage: npm run admin:promote -- --email=customer@example.com",
    );
    process.exitCode = 1;
    return;
  }

  const email = normalizeEmail(emailInput);
  const user = await getDb().collection("user").findOne({ email });

  if (!user) {
    console.error(`No account exists for ${email}. Register and verify it first.`);
    process.exitCode = 1;
    return;
  }

  if (user.emailVerified !== true) {
    console.error(
      `The account ${email} is not email-verified. Verify it before promoting.`,
    );
    process.exitCode = 1;
    return;
  }

  await getDb()
    .collection("user")
    .updateOne({ email }, { $set: { role: "admin", updatedAt: new Date() } });

  console.log(`Promoted verified account ${email} to admin.`);
  console.log("The command is safe to rerun.");
}

main()
  .catch((error: unknown) => {
    console.error(
      "Admin promotion failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    const { getMongoClient } = await import("@/lib/db/client");
    try {
      await getMongoClient().close();
    } catch {
      // Ignore close errors during command failure.
    }
  });
