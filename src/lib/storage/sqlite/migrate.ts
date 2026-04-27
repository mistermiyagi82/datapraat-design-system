// src/lib/storage/sqlite/migrate.ts
// Source: RESEARCH.md Pattern 3 + CONTEXT.md D-06
// Hand-rolled SQL migration runner — applies pending files in lexical order
// inside a transaction, tracks applied migrations in schema_migrations.
// Idempotent: a second run applies zero new migrations.

import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { logger } from "@/lib/logger";

const MIGRATIONS_DIR = path.join(process.cwd(), "src/lib/storage/sqlite/migrations");

// Strict regex prevents path traversal — only files matching this pattern
// are loaded. Threat T-1-03 mitigation: rejects `../`, absolute paths,
// non-SQL files. The migrations directory is checked into git, not
// user-writable at runtime.
const MIGRATION_FILENAME_RE = /^\d{4}_[a-zA-Z0-9_]+\.sql$/;

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[]).map((r) => r.id),
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => MIGRATION_FILENAME_RE.test(f))
    .sort();

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) {
    logger.debug({ count: files.length }, "no pending migrations");
    return;
  }

  const apply = db.transaction((file: string) => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    db.exec(sql);
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(
      file,
      Date.now(),
    );
  });

  for (const file of pending) {
    logger.info({ file }, "applying migration");
    apply(file);
  }
  logger.info({ applied: pending.length }, "migrations complete");
}
