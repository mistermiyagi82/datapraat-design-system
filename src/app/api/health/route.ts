// src/app/api/health/route.ts
// Sources: RESEARCH.md Pattern 4 (Healthcheck Route Handler) + CONTEXT.md D-08, D-09, D-10, D-12 + Specifics.
// Single Phase-1 Route Handler. Returns the 6-field health contract on happy path,
// flips to 503 + status='degraded' on storage probe failure. Proves the volume is
// mounted, the file is writable, and migrations ran (D-08).

import { NextResponse } from "next/server";
import { healthProbeRepo } from "@/lib/storage";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Force Node runtime — better-sqlite3 native binding requires it (FOUND-07: no Edge).
export const runtime = "nodejs";

// Force dynamic — healthcheck must run on every request, never statically rendered or cached.
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const result = {
    status: "ok" as "ok" | "degraded",
    commitSha: process.env.NEXT_PUBLIC_COMMIT_SHA ?? "unknown",
    buildTime: process.env.BUILD_TIME ?? "unknown",
    nodeEnv: env.NODE_ENV,
    uptimeSec: Math.round(process.uptime()),
    db: { ok: true as boolean, probeMs: 0 as number },
  };

  try {
    const t0 = Date.now();
    await healthProbeRepo.recordProbe("last_health_check", t0);
    const readBack = await healthProbeRepo.readProbe("last_health_check");
    if (readBack === null) throw new Error("probe roundtrip returned null");
    result.db.probeMs = Date.now() - t0;
  } catch (err) {
    logger.error({ err }, "health probe failed");
    result.status = "degraded";
    result.db.ok = false;
    return NextResponse.json(result, { status: 503 });
  }

  logger.debug({ probeMs: result.db.probeMs, totalMs: Date.now() - startedAt }, "health ok");
  return NextResponse.json(result, { status: 200 });
}
