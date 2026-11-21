import "./load-env";
import { setupDatabase } from "@/lib/db/setup";
import { getMongoDatabaseName } from "@/lib/db/client";

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is not set. Add it to .env.local before running setup.",
    );
    process.exitCode = 1;
    return;
  }

  const result = await setupDatabase();
  console.log(`MongoDB database: ${getMongoDatabaseName()}`);
  console.log(`Catalog seed inserted: ${result.inserted}`);
  console.log(`Seeded catalog rows: ${result.seededProducts}`);
  console.log(`Active products: ${result.activeProducts}`);
  console.log(`Total products: ${result.totalProducts}`);
  console.log("Indexes are in place. Running setup again is safe.");
}

main()
  .catch((error: unknown) => {
    console.error(
      "Database setup failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    const { getMongoClient } = await import("@/lib/db/client");
    try {
      await getMongoClient().close();
    } catch {
      // Ignore close errors during setup failure.
    }
  });
