// src/lib/storage/index.ts
// Source: RESEARCH.md Pattern 2 + CONTEXT.md D-05
// The seam every Route Handler imports from. Swapping to Postgres later
// means changing the right-hand side here, not every callsite. The
// `as healthProbeRepo` re-export name is the public contract — callers
// import { healthProbeRepo } from "@/lib/storage".

export { sqliteHealthProbeRepo as healthProbeRepo } from "./sqlite/health-probe";
export type { HealthProbeRepo } from "./repos";
