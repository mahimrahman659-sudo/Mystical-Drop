import "./load-env";
import { getMongoClient } from "../lib/db/client";

async function main() {
  // --- Path 1: production poison (connect-failure closes topology directly,
  // leaving client.topology attached with state "closed") ---
  const first = getMongoClient();
  await first.db().command({ ping: 1 });
  console.log("1. first client connected");

  const topology = (first as unknown as { topology?: { close?: () => void } })
    .topology;
  if (!topology?.close) throw new Error("FAIL: topology missing after connect");
  topology.close();
  console.log("2. topology closed directly (production failure path)");

  const second = getMongoClient();
  if (second === first) {
    throw new Error("FAIL: poisoned client returned again (path 1)");
  }
  await second.db().command({ ping: 1 });
  const count = await second
    .db()
    .collection("products")
    .countDocuments({ status: "active" });
  console.log(`3. recovery OK — fresh client queried (active products: ${count})`);

  // --- Path 2: explicit client.close() (driver nulls topology, flags
  // hasBeenClosed) ---
  await second.close();
  console.log("4. second client explicitly closed");

  const third = getMongoClient();
  if (third === second) {
    throw new Error("FAIL: closed client returned again (path 2)");
  }
  await third.db().command({ ping: 1 });
  console.log("5. recovery OK after explicit close");

  // --- No churn while healthy ---
  const fourth = getMongoClient();
  if (fourth !== third) {
    throw new Error("FAIL: healthy client discarded unnecessarily");
  }
  console.log("6. healthy client reused (no churn)");

  await third.close();
  console.log("RECOVERY TEST PASSED");
}

main().catch((error) => {
  console.error("RECOVERY TEST FAILED:", error);
  process.exit(1);
});
