import { beforeEach, describe, expect, it, vi } from "vitest";

describe("sqliteHealthProbeRepo", () => {
  beforeEach(() => {
    process.env.DB_PATH = ":memory:";
    process.env.NODE_ENV = "test";
    vi.resetModules();
  });

  it("recordProbe + readProbe round-trip returns the same timestamp", async () => {
    const { sqliteHealthProbeRepo } = await import("./health-probe");
    const ts = Date.now();
    await sqliteHealthProbeRepo.recordProbe("last_health_check", ts);
    const got = await sqliteHealthProbeRepo.readProbe("last_health_check");
    expect(got).toBe(ts);
  });

  it("readProbe returns null for an unknown key", async () => {
    const { sqliteHealthProbeRepo } = await import("./health-probe");
    const got = await sqliteHealthProbeRepo.readProbe("does-not-exist");
    expect(got).toBeNull();
  });

  it("recordProbe upserts (second call with same key overwrites)", async () => {
    const { sqliteHealthProbeRepo } = await import("./health-probe");
    await sqliteHealthProbeRepo.recordProbe("k", 1000);
    await sqliteHealthProbeRepo.recordProbe("k", 2000);
    const got = await sqliteHealthProbeRepo.readProbe("k");
    expect(got).toBe(2000);
  });
});
