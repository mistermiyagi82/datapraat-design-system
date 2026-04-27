import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe(".env.example coverage", () => {
  it("lists every key used by the Zod env schema (or documents it as build-time-only)", async () => {
    const examplePath = path.join(process.cwd(), ".env.example");
    expect(fs.existsSync(examplePath), ".env.example must exist at repo root").toBe(true);
    const example = fs.readFileSync(examplePath, "utf8");
    // Build-time-only vars (NEXT_PUBLIC_COMMIT_SHA, BUILD_TIME) are intentionally
    // not in .env.example per RESEARCH.md Discretion Gap 5 — they're injected by
    // next.config.ts. Runtime-configurable vars must be present (commented or set).
    const requiredKeys = ["NODE_ENV", "LOG_LEVEL", "DB_PATH"];
    for (const key of requiredKeys) {
      // Allow either `KEY=...` or `# KEY=...` (commented default)
      const re = new RegExp(`(^|\\n)\\s*#?\\s*${key}\\s*=`, "m");
      expect(re.test(example), `.env.example missing reference to ${key}`).toBe(true);
    }
  });
});
