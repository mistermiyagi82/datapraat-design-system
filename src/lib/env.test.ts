import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("env (zod-parsed)", () => {
  beforeEach(() => {
    // Reset env + module cache so env.ts re-parses on each test
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("accepts a complete valid environment", async () => {
    process.env.NODE_ENV = "development";
    process.env.LOG_LEVEL = "info";
    process.env.DB_PATH = "./.data/test.sqlite";
    const mod = await import("./env");
    expect(mod.env.NODE_ENV).toBe("development");
    expect(mod.env.LOG_LEVEL).toBe("info");
    expect(mod.env.DB_PATH).toBe("./.data/test.sqlite");
  });

  it("defaults LOG_LEVEL to 'info' when not set", async () => {
    delete process.env.LOG_LEVEL;
    const mod = await import("./env");
    expect(mod.env.LOG_LEVEL).toBe("info");
  });

  it("defaults NODE_ENV to 'development' when not set", async () => {
    delete process.env.NODE_ENV;
    const mod = await import("./env");
    expect(mod.env.NODE_ENV).toBe("development");
  });

  it("rejects an invalid LOG_LEVEL", async () => {
    process.env.LOG_LEVEL = "verbose"; // not in enum
    await expect(import("./env")).rejects.toThrow(/Invalid environment/);
  });

  it("uses production-style DB_PATH default when NODE_ENV=production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DB_PATH;
    const mod = await import("./env");
    expect(mod.env.DB_PATH).toBe("/data/datapraat.sqlite");
  });

  it("uses dev-style DB_PATH default when NODE_ENV!=production", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.DB_PATH;
    const mod = await import("./env");
    expect(mod.env.DB_PATH).toBe("./.data/datapraat.sqlite");
  });
});
