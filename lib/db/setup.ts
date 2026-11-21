

import { getDb } from "./client";
import { products } from "../products";
import type { StoredProduct } from "../catalog";

export const PRODUCT_COLLECTION = "products";
export const ORDER_COLLECTION = "orders";
export const DEV_MAILBOX_COLLECTION = "devMailbox";

export async function ensureDatabaseIndexes(): Promise<void> {
  const db = getDb();

  await Promise.all([
    db.collection("user").createIndex(
      { email: 1 },
      { unique: true, name: "user_email_uidx" },
    ),
    db.collection("session").createIndex(
      { token: 1 },
      { unique: true, name: "session_token_uidx" },
    ),
    db.collection("session").createIndex(
      { userId: 1 },
      { name: "session_userId_idx" },
    ),
    db.collection("account").createIndex(
      { providerId: 1, accountId: 1 },
      { unique: true, name: "account_providerId_accountId_uidx" },
    ),
    db.collection("account").createIndex(
      { userId: 1 },
      { name: "account_userId_idx" },
    ),
    db.collection("rateLimit").createIndex(
      { key: 1 },
      { unique: true, name: "rateLimit_key_uidx" },
    ),
    db.collection(PRODUCT_COLLECTION).createIndex(
      { slug: 1 },
      { unique: true, name: "products_slug_uidx" },
    ),
    db.collection(PRODUCT_COLLECTION).createIndex(
      { seedId: 1 },
      {
        unique: true,
        sparse: true,
        name: "products_seedId_uidx",
      },
    ),
    db.collection(PRODUCT_COLLECTION).createIndex(
      { status: 1, catalogNumber: 1 },
      { name: "products_status_catalog_idx" },
    ),
    db.collection(ORDER_COLLECTION).createIndex(
      { reference: 1 },
      { unique: true, name: "orders_reference_uidx" },
    ),
    db.collection(ORDER_COLLECTION).createIndex(
      { submissionKey: 1 },
      { unique: true, name: "orders_submissionKey_uidx" },
    ),
    db.collection(ORDER_COLLECTION).createIndex(
      { userId: 1, createdAt: -1 },
      { name: "orders_userId_createdAt_idx" },
    ),
    db.collection(ORDER_COLLECTION).createIndex(
      { fulfillmentStatus: 1, createdAt: -1 },
      { name: "orders_status_createdAt_idx" },
    ),
    db.collection(DEV_MAILBOX_COLLECTION).createIndex(
      { expireAt: 1 },
      { expireAfterSeconds: 0, name: "devMailbox_expireAt_ttl" },
    ),
  ]);
}

export async function seedInitialProducts(): Promise<{
  inserted: number;
  existing: number;
}> {
  const collection = getDb().collection<StoredProduct>(PRODUCT_COLLECTION);
  const now = new Date();
  let inserted = 0;

  for (const product of products) {
    const doc: StoredProduct = {
      ...product,
      seedId: product.slug,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.updateOne(
      { seedId: product.slug },
      { $setOnInsert: doc },
      { upsert: true },
    );
    inserted += result.upsertedCount;
  }

  const existing = await collection.countDocuments({ seedId: { $exists: true } });
  return { inserted, existing };
}

export async function setupDatabase(): Promise<{
  inserted: number;
  seededProducts: number;
  activeProducts: number;
  totalProducts: number;
}> {
  await ensureDatabaseIndexes();
  const seed = await seedInitialProducts();
  const db = getDb();
  const [activeProducts, totalProducts] = await Promise.all([
    db.collection(PRODUCT_COLLECTION).countDocuments({ status: "active" }),
    db.collection(PRODUCT_COLLECTION).countDocuments(),
  ]);

  return {
    inserted: seed.inserted,
    seededProducts: seed.existing,
    activeProducts,
    totalProducts,
  };
}
