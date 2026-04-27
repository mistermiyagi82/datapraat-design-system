import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { runMigrations } from "./migrate";

describe("runMigrations()", () => {
  it("creates schema_migrations table on a fresh DB", () => {
    const db = new Database(":memory:");
    runMigrations(db);
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
      )
      .get();
    expect(row).toBeTruthy();
  });

  it("is idempotent — second run applies zero new migrations", () => {
    const db = new Database(":memory:");
    runMigrations(db);
    const beforeCount = (
      db.prepare("SELECT COUNT(*) as c FROM schema_migrations").get() as {
        c: number;
      }
    ).c;
    runMigrations(db);
    const afterCount = (
      db.prepare("SELECT COUNT(*) as c FROM schema_migrations").get() as {
        c: number;
      }
    ).c;
    expect(afterCount).toBe(beforeCount);
  });

  it("records the 0001_init.sql migration as applied after first run", () => {
    const db = new Database(":memory:");
    runMigrations(db);
    const ids = (
      db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[]
    ).map((r) => r.id);
    expect(ids).toContain("0001_init.sql");
  });
});
