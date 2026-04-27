// src/lib/storage/sqlite/health-probe.ts
// Source: RESEARCH.md Pattern 2 + CONTEXT.md D-05, D-08
// sqlite implementation of HealthProbeRepo. Wraps better-sqlite3 sync calls
// in `async` method bodies so the interface stays Postgres-future-proof.
// getDb() is called per method (not at module load) — preserves the lazy
// memoized open so we don't touch the DB until a request actually needs it.

import type { HealthProbeRepo } from "../repos";
import { getDb } from "./client";

export const sqliteHealthProbeRepo: HealthProbeRepo = {
  async recordProbe(key, atMs) {
    getDb()
      .prepare(
        "INSERT INTO health_probe (key, value, updated_at) VALUES (?, ?, ?) " +
          "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
      )
      .run(key, String(atMs), atMs);
  },
  async readProbe(key) {
    const row = getDb().prepare("SELECT updated_at FROM health_probe WHERE key = ?").get(key) as
      | { updated_at: number }
      | undefined;
    return row?.updated_at ?? null;
  },
};
