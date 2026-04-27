// src/lib/logger.ts
// Source: RESEARCH.md Discretion Gap 4 + CONTEXT.md D-11
// Thin pino wrapper. Reads level + base env from src/lib/env.ts.
// Phase 7 (OPS-02) layers per-request `logger.child({ requestId })` on top —
// establishing the dep + log shape now means no callsite refactor later.

import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Production: raw JSON to stdout. pino-pretty deferred to Phase 7
  // (RESEARCH.md Discretion Gap 4) — raw JSON in dev is fine for Phase 1.
});
