import { MongoClient, type Db } from "mongodb";
import { BRAND_NAME } from "../brand";

const globalForMongo = globalThis as unknown as {
  __mysticalDropMongo?: {
    client: MongoClient;
    uri: string;
    dbName: string;
  };
};

type WatchableTopology = {
  s?: { state?: string };
  on?: (
    event: string,
    listener: (previousState: string, nextState: string) => void,
  ) => void;
};

type WatchableClient = {
  s?: { hasBeenClosed?: boolean };
  topology?: WatchableTopology;
};

const watchedClients = new WeakSet<MongoClient>();

type ResetListener = () => void;
const resetListeners = new Set<ResetListener>();

/**
 * Registered by modules that cache database-bound objects (e.g. the Better
 * Auth instance). Fired whenever the cached MongoClient is discarded, so they
 * can drop state that still points at the dead client.
 */
export function onMongoClientReset(listener: ResetListener): void {
  resetListeners.add(listener);
}

function notifyResetListeners(): void {
  for (const listener of resetListeners) {
    try {
      listener();
    } catch {
      // A broken listener must not block client recovery.
    }
  }
}

function dropIfCurrent(client: MongoClient): void {
  const cached = globalForMongo.__mysticalDropMongo;
  if (cached?.client === client) {
    globalForMongo.__mysticalDropMongo = undefined;
    notifyResetListeners();
  }
}

/**
 * The MongoDB driver closes a topology permanently when a connection attempt
 * fails (`Topology._connect()` failure path calls `this.close()`), and the
 * client stays closed for the life of the process. On serverless that used to
 * poison the cached client for a whole warm instance — every later query
 * failed with `MongoTopologyClosedError` (surfaced as "Application error" on
 * /login, /, and product pages).
 *
 * Two poison signatures are handled:
 * - connect-failure: `client.topology` stays attached with state "closed"
 *   (state may also be observed via the `stateChanged` event once watched);
 * - explicit `client.close()`: the driver nulls `client.topology` and flags
 *   `client.s.hasBeenClosed`.
 *
 * Either way the cached client is dropped so the next request builds a fresh
 * one instead of reusing a corpse. The topology only exists once `connect()`
 * has begun — by then its state has left the initial "closed" value — so an
 * observed "closed" always means poisoned, never "not started yet".
 */
function recoverIfPoisoned(client: MongoClient): void {
  const raw = client as unknown as WatchableClient;

  if (raw.s?.hasBeenClosed) {
    dropIfCurrent(client);
    return;
  }

  const topology = raw.topology;
  if (!topology) return;

  if (!watchedClients.has(client)) {
    watchedClients.add(client);
    topology.on?.("stateChanged", (_previousState, nextState) => {
      if (nextState === "closed") dropIfCurrent(client);
    });
  }

  if (topology.s?.state === "closed") dropIfCurrent(client);
}

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
    recoverIfPoisoned(cached.client);
    const current = globalForMongo.__mysticalDropMongo;
    if (current && current.uri === uri && current.dbName === dbName) {
      return current.client;
    }
    // The cached client was poisoned and has been dropped — fall through and
    // build a fresh one for this request.
    void cached.client.close().catch(() => undefined);
  } else if (cached) {
    // Environment changed under a live process; anything still holding the old
    // client (e.g. the cached auth instance) must be rebuilt too.
    void cached.client.close().catch(() => undefined);
    globalForMongo.__mysticalDropMongo = undefined;
    notifyResetListeners();
  }

  const client = new MongoClient(uri, {
    appName: BRAND_NAME,
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
    // Serverless instances run a handful of sequential queries; a small pool
    // keeps connection churn low against Atlas's connection caps.
    maxPoolSize: 5,
    maxIdleTimeMS: 30_000,
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
