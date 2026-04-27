import { describe, it, expect, beforeEach, vi } from "vitest";

describe("GET /api/health", () => {
  beforeEach(() => {
    process.env.DB_PATH = ":memory:";
    process.env.NODE_ENV = "test";
    vi.resetModules();
  });

  it("returns 200 with all six fields on happy path", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      status: "ok",
      commitSha: expect.any(String),
      buildTime: expect.any(String),
      nodeEnv: expect.any(String),
      uptimeSec: expect.any(Number),
      db: { ok: true, probeMs: expect.any(Number) },
    });
  });

  it("returns 503 with status=degraded when storage probe throws", async () => {
    // vi.doMock must precede the dynamic import; vi.resetModules() in beforeEach makes this safe.
    vi.doMock("@/lib/storage", () => ({
      healthProbeRepo: {
        recordProbe: async () => {
          throw new Error("simulated volume failure");
        },
        readProbe: async () => null,
      },
    }));
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.db.ok).toBe(false);
  });
});
