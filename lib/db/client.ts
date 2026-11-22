import { MongoClient, type Db } from "mongodb";
import { BRAND_NAME } from "../brand";

const globalForMongo = globalThis as unknown as {
  __mysticalDropMongo?: {
    client: MongoClient;
    uri: string;
    dbName: string;
  };
};

function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to .env.local using .env.example as a template.",
    );
  }
  return uri;
}

export function getMongoDatabaseName(): string {
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  if (!dbName) {
    throw new Error(
      "MONGODB_DB_NAME is not configured. Set it to the existing application database name.",
    );
  }
  return dbName;
}

export function getMongoClient(): MongoClient {
  const uri = requireMongoUri();
  const dbName = getMongoDatabaseName();
  const cached = globalForMongo.__mysticalDropMongo;

  if (cached && cached.uri === uri && cached.dbName === dbName) {
    return cached.client;
  }

  if (cached) {
    void cached.client.close().catch(() => undefined);
  }

  const client = new MongoClient(uri, {
    appName: BRAND_NAME,
    serverSelectionTimeoutMS: 10_000,
  });

  globalForMongo.__mysticalDropMongo = { client, uri, dbName };
  return client;
}

export function getDb(): Db {
  return getMongoClient().db(getMongoDatabaseName());
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
