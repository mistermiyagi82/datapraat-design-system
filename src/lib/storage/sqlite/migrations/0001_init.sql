-- src/lib/storage/sqlite/migrations/0001_init.sql
-- Phase 1 baseline: health_probe table only.
-- schema_migrations is created by the runner itself (migrate.ts).
-- Sources: CONTEXT.md D-06 + Specifics (filename convention NNNN_short_name.sql).
CREATE TABLE IF NOT EXISTS health_probe (
  key        TEXT    PRIMARY KEY,
  value      TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);
