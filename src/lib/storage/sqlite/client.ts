// src/lib/storage/sqlite/client.ts
// Source: RESEARCH.md Pattern 1 + CONTEXT.md D-07
// Lazy, memoized DB handle. First call opens the file at env.DB_PATH,
// sets pragmas, runs pending migrations, then memoizes. Subsequent calls
// return the same handle.
// Eager init via instrumentation.ts is rejected — it would block container
// boot if the Railway volume isn't mounted (defeats healthcheck-driven
// restarts).

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import Database from "better-sqlite3";
import { runMigrations } from "./migrate";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  logger.info({ path: env.DB_PATH }, "opening sqlite");
  db = new Database(env.DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
