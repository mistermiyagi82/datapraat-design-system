// src/lib/env.ts
// Sources: RESEARCH.md Discretion Gap 3 + CONTEXT.md D-04, D-07
// Zod-parsed env config. Throws fast on invalid env per CONTEXT.md D-04
// (fail-fast on misconfigured deploys; never start up with a broken contract).

import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

  // Storage — env-driven path (CONTEXT.md D-07).
  // Production default targets the Railway `/data` volume mount; dev uses a
  // gitignored local path so contributors don't need a writable `/data`.
  DB_PATH: z
    .string()
    .min(1)
    .default(
      process.env.NODE_ENV === "production" ? "/data/datapraat.sqlite" : "./.data/datapraat.sqlite",
    ),

  // Build-time injected by next.config.ts (CONTEXT.md D-12). Defaulted because
  // they're absent in dev / test / unit-test runners.
  NEXT_PUBLIC_COMMIT_SHA: z.string().default("dev"),
  BUILD_TIME: z.string().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Fail fast with readable, field-level errors per CONTEXT.md D-04.
    // T-1-01 mitigation: only key names + reasons are printed, never values.
    console.error("[env] Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration — see logs above");
  }
  return result.data;
}

export const env: Env = parseEnv();
