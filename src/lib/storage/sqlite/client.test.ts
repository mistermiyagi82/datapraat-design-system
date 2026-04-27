import { describe, it, expect, beforeEach, vi } from "vitest";

describe("getDb()", () => {
  beforeEach(() => {
    process.env.DB_PATH = ":memory:";
    process.env.NODE_ENV = "test";
    vi.resetModules();
  });

  it("opens the database lazily and memoizes the handle", async () => {
    const { getDb } = await import("./client");
    const a = getDb();
    const b = getDb();
    expect(a).toBe(b); // same memoized handle
  });

  it("runs migrations on first call (schema_migrations table exists after first getDb())", async () => {
    const { getDb } = await import("./client");
    const db = getDb();
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'",
      )
      .get();
    expect(row).toBeTruthy();
  });

  it("creates the health_probe table on first call", async () => {
    const { getDb } = await import("./client");
    const db = getDb();
    const row = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='health_probe'",
      )
      .get();
    expect(row).toBeTruthy();
  });
});
