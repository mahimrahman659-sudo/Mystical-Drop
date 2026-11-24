import "./load-env";
import { getMongoClient, onMongoClientReset } from "../lib/db/client";

async function main() {
  const resetCount = (state: { resets: number }): number => state.resets;
  const stats = { resets: 0 };
  onMongoClientReset(() => {
    stats.resets += 1;
  });

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
  if (resetCount(stats) !== 1) {
    throw new Error(`FAIL: expected 1 reset listener call, got ${stats.resets}`);
  }
  await second.db().command({ ping: 1 });
  console.log("3. recovery OK + auth-reset listener fired (resets=1)");

  // --- Path 2: explicit client.close() (driver nulls topology, flags
  // hasBeenClosed) ---
  await second.close();
  console.log("4. second client explicitly closed");

  const third = getMongoClient();
  if (third === second) {
    throw new Error("FAIL: closed client returned again (path 2)");
  }
  if (resetCount(stats) !== 2) {
    throw new Error(`FAIL: expected 2 reset listener calls, got ${stats.resets}`);
  }
  await third.db().command({ ping: 1 });
  console.log("5. recovery OK after explicit close + listener fired (resets=2)");

  // --- No churn while healthy (listener must NOT fire) ---
  const fourth = getMongoClient();
  if (fourth !== third) {
    throw new Error("FAIL: healthy client discarded unnecessarily");
  }
  if (resetCount(stats) !== 2) {
    throw new Error(`FAIL: listener fired on healthy reuse (resets=${stats.resets})`);
  }
  console.log("6. healthy client reused, no spurious resets");

  await third.close();
  console.log("RECOVERY TEST PASSED");
}

main().catch((error) => {
  console.error("RECOVERY TEST FAILED:", error);
  process.exit(1);
});
