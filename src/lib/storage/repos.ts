// src/lib/storage/repos.ts
// Source: RESEARCH.md Pattern 2 + CONTEXT.md D-05
// Repo-per-domain, async-only contract.
// A future Postgres impl can drop in without callsite changes — every
// callsite imports from `@/lib/storage` (the barrel), not from any
// concrete sqlite module. Async-only is non-negotiable: the better-sqlite3
// impl wraps sync calls in async fns, so the day we swap to a real async
// driver, no callsite needs to change.

export interface HealthProbeRepo {
  /** Writes the current timestamp under `key`. Used by /api/health to prove the volume is writable. */
  recordProbe(key: string, atMs: number): Promise<void>;

  /** Returns the most recently written probe timestamp, or null if none exists. */
  readProbe(key: string): Promise<number | null>;
}
