---
phase: 01-foundation
plan: 04
subsystem: healthcheck-route
tags: [health, route-handler, ops, wave-3, foundation]

# Dependency graph
requires: [01-01-foundation-test-infra, 01-02-toolchain-scaffold-trim, 01-03-storage-env-logger]
provides:
  - GET /api/health route returning the 6-field JSON contract (status / commitSha / buildTime / nodeEnv / uptimeSec / db.{ok, probeMs})
  - 200 happy path on storage round-trip success; 503 degraded on probe failure
  - Runtime proof that the storage seam is alive (write + read-back via healthProbeRepo)
  - Single-endpoint healthcheck consumable by Railway healthcheckPath, Docker HEALTHCHECK, and curl smoke tests
affects: [01-05-deploy-artifact]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Route Handler runtime pinning: `export const runtime = "nodejs"` + `export const dynamic = "force-dynamic"` — Edge runtime would fail on better-sqlite3 native binding (FOUND-07); static rendering would defeat the live probe contract'
    - "Probe round-trip pattern: write `last_health_check` via recordProbe then read it back via readProbe; if readBack === null treat as failure (not just exception). probeMs = Date.now() - t0 measured around the round-trip"
    - "Single try/catch covers both storage calls — any failure flips response to 503 with status='degraded' + db.ok=false; logger.error({ err }, ...) before the 503 return so Railway logs surface the failure cause"
    - 'Build-info read from process.env (not env consts) inside the handler: process.env.NEXT_PUBLIC_COMMIT_SHA / BUILD_TIME with `?? "unknown"` fallback — keeps the route''s contract stable regardless of how env.ts defaults change and lets test mocks set process.env directly'

key-files:
  created:
    - src/app/api/health/route.ts
  modified: []

key-decisions:
  - "Verbatim adoption of RESEARCH.md Pattern 4 snippet — the Plan 01 RED test asserts the exact response shape and the 503-on-throw branch, so any drift would have broken the contract. Both test cases (200 happy + 503 degraded) passed on first run."
  - "process.env over env const for commitSha/buildTime per PLAN.md Task 1 guidance: keeps the route handler's contract independent of env.ts defaulting policy and matches how the 200-test mocks env (vi.doMock at module-import boundary, not in process.env)."
  - "Explicit `if (readBack === null) throw` null-check inside the try block. Without it, a write that succeeds but reads back null would silently report db.ok=true, defeating the live-probe purpose of D-08. The error message 'probe roundtrip returned null' is greppable for ops debugging."
  - "logger.debug for happy path, logger.error for the 503 path. Phase 1 LOG_LEVEL defaults to 'info' so debug lines stay silent in production unless explicitly enabled — but they're available for local diagnosis without a code change."
  - "T-1-02 (info disclosure via /api/health) accepted for Phase 1: response includes commitSha (7-char public hash), buildTime (ISO timestamp), nodeEnv, uptimeSec, db.probeMs — none is PII or auth material. The shared-link demo audience makes this acceptable. Future phase introducing PII/auth should split to /api/health (public liveness) + /api/health/internal (auth-gated)."

requirements-completed: [OPS-01]

# Metrics
duration: 1m11s
completed: 2026-04-27
---

# Phase 01 Plan 04: /api/health Route Handler Summary

**A single 44-line Route Handler closes the Wave-3 healthcheck contract — round-tripping through `healthProbeRepo` to prove the volume is mounted, returning the 6-field JSON shape on 200 and flipping to 503 + status='degraded' on storage failure — and turns the last Wave-0 RED test GREEN (6/6 vitest files passing).**

## Performance

- **Duration:** 1m 11s
- **Started:** 2026-04-27T18:28:22Z
- **Completed:** 2026-04-27T18:29:33Z
- **Tasks:** 1 / 1
- **Files created:** 1
- **Files modified:** 0

## Accomplishments

- Shipped `src/app/api/health/route.ts` (~44 lines) implementing the verbatim Pattern 4 snippet from RESEARCH.md.
- Closed OPS-01 (healthcheck endpoint with build info on happy, 503 on degraded).
- Implemented decisions D-08 (probe-based proof of life), D-09 (rich JSON, 200/503), D-10 (single endpoint, GET-only), D-12 (build-info from process.env injected by next.config.ts).
- Turned the last Wave-0 RED test (`src/app/api/health/route.test.ts`) GREEN — both the 200 happy path and the 503 degraded path pass.
- All 6 Wave-0 vitest files now GREEN: env (6), client (3), migrate (3), health-probe (3), route (2), check-env-example (1) — 18 individual tests total.
- All quality gates pass: `tsc --noEmit` exit 0, `eslint .` exit 0 (only a pre-existing unrelated warning in `eslint.config.mjs`), `pnpm build` exit 0 with `/api/health` correctly marked `ƒ (Dynamic)` and emitted into `.next/standalone/.next/server/app/api/health/route.js`.

## Task Commits

1. **Task 1: Implement /api/health Route Handler** — `242bf51` (feat)

## Files Created/Modified

### Created

- `src/app/api/health/route.ts` — GET handler. Imports `healthProbeRepo` from `@/lib/storage` (the seam, not the impl), `env` from `@/lib/env`, `logger` from `@/lib/logger`. Exports `runtime = "nodejs"`, `dynamic = "force-dynamic"`, and `GET`. Builds a `result` object with all 6 fields up front; runs the probe round-trip in a try block; on success updates `db.probeMs` and returns 200; on any throw (including the explicit `readBack === null` check) logs via `logger.error` and returns 503 with `status: "degraded"` + `db.ok: false`.

## Decisions Made

- **Verbatim Pattern 4 adoption.** The Plan 01 RED test asserts an exact response shape and an exact 503-on-throw branch. Pattern 4 from RESEARCH.md is the literal contract. Copied with zero shape drift; both test cases passed on first run.
- **process.env over env const for build-info.** `commitSha` and `buildTime` read from `process.env.NEXT_PUBLIC_COMMIT_SHA` and `process.env.BUILD_TIME` with `?? "unknown"` fallback, not from the `env` const. Matches PLAN.md Task 1 guidance: keeps the route's contract stable regardless of `env.ts` defaulting policy and lets tests set `process.env` directly without re-parsing the Zod schema.
- **Explicit null-check inside try.** `if (readBack === null) throw new Error("probe roundtrip returned null")` — without it, a successful write but missing read would silently report `db.ok: true`, defeating D-08's live-probe purpose.
- **No POST/DELETE/PUT handler, no `/api/ready`, no `/api/live`.** D-10 is explicit: single endpoint, GET-only. K8s-style split probes deferred until Azure Container Apps explicitly needs them (~2-line addition then).
- **No request-id logging.** That's OPS-02 / Phase 7. Phase 1 logger shape is established; per-route `logger.child({ requestId })` will land in middleware later.
- **No auth gating.** Phase 1 is shared-link demo per CLAUDE.md. T-1-02 accepted for the demo audience; future PII/auth introduction should split to `/api/health` (public) + `/api/health/internal` (auth-gated).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Single-file Route Handler, single GREEN flip.

## Authentication Gates

None. No external services touched; healthcheck is unauthenticated by design (T-1-02 accepted for Phase 1).

## Known Stubs

None. The route handler is a real implementation:

- Real round-trip through `healthProbeRepo` (the same repo Plan 03 verified with 3 unit tests).
- Real build-info read from `process.env` (populated by `next.config.ts` from Plan 02).
- Real pino logging (the same logger Plan 03 ships).
- Real `process.uptime()` and `Date.now()` measurements.

The `src/app/page.tsx` placeholder noted in Plan 02's stub list is unchanged — it stays a stub until Phase 2 (Design System) evolves it.

## Wave-3 GREEN State Confirmation

```
$ pnpm exec vitest --run
 ✓ src/lib/env.test.ts (6 tests)
 ✓ src/lib/storage/sqlite/migrate.test.ts (3 tests)
 ✓ src/lib/storage/sqlite/client.test.ts (3 tests)
 ✓ src/lib/storage/sqlite/health-probe.test.ts (3 tests)
 ✓ src/app/api/health/route.test.ts (2 tests)
 ✓ scripts/check-env-example.test.ts (1 test)
 Test Files  6 passed (6)
      Tests  18 passed (18)

$ pnpm exec tsc --noEmit; echo "exit=$?"
exit=0

$ pnpm exec eslint .; echo "exit=$?"
# 1 pre-existing warning in eslint.config.mjs (import/no-anonymous-default-export) — unrelated to this plan, out of scope
exit=0

$ pnpm build
✓ Compiled successfully in 2.9s
Route (app)                                 Size  First Load JS
└ ƒ /api/health                            127 B         102 kB
ƒ  (Dynamic)  server-rendered on demand
exit=0

$ ls -la .next/standalone/server.js
-rw-r--r--@ 1 daan  staff  6571 Apr 27 20:29 .next/standalone/server.js
$ find .next -path '*api/health*' -name 'route.js'
.next/server/app/api/health/route.js
.next/standalone/.next/server/app/api/health/route.js
```

All 6 Wave-0 vitest files GREEN. Wave 0 RED-list is fully drained.

## Verification Performed

- All Plan 04 acceptance criteria from PLAN.md (Task 1) checked individually:
  - `src/app/api/health/route.ts` exists ✓
  - `runtime = "nodejs"` literal present ✓ (`grep -q 'export const runtime = "nodejs"'`)
  - `dynamic = "force-dynamic"` literal present ✓
  - `healthProbeRepo.recordProbe` and `healthProbeRepo.readProbe` both called inside one try block ✓
  - Explicit `if (readBack === null)` null-check present ✓
  - `probeMs = Date.now() - t0` with `t0` set immediately before `recordProbe` ✓
  - 503 path response body has `status: "degraded"` AND `db.ok: false` ✓ (verified by 503 test assertion)
  - 503 path logs via `logger.error({ err }, ...)` before return ✓ (verified in test stderr output)
  - Response body has all 6 fields with correct names ✓ (verified by 200 test `toMatchObject`)
  - `pnpm exec vitest --run src/app/api/health/route.test.ts` exit 0 (2 passed) ✓
  - `pnpm exec vitest --run` exit 0 (6 files / 18 tests, all GREEN) ✓
  - `pnpm exec tsc --noEmit` exit 0 ✓
  - `pnpm exec eslint .` exit 0 ✓
  - `pnpm build` exit 0 ✓
  - `.next/standalone/server.js` exists ✓
  - `.next/server/app/api/health/route.js` exists ✓
  - `.next/standalone/.next/server/app/api/health/route.js` exists ✓
- Manual `pnpm dev` + `curl /api/health` smoke test deferred to Plan 05's `docker-health.sh` automation per PLAN.md note.

## Self-Check: PASSED

All claimed files verified to exist:

- `src/app/api/health/route.ts` ✓

All claimed commits verified in `git log`:

- `242bf51` ✓ (Task 1)

Quality gate evidence captured in "Wave-3 GREEN State Confirmation" above.

## Threat Flags

None. The Route Handler ships exactly the surface enumerated in the plan's `<threat_model>`:

- T-1-02 (info disclosure via /api/health response body) — **accepted for Phase 1** per CLAUDE.md "Auth v1: None / shared-link". Response contains commitSha (public 7-char hash), buildTime (ISO), nodeEnv, uptimeSec, db.probeMs — no PII, no auth material. Future phase that introduces PII/auth should add a migration plan to split `/api/health` (public liveness) + `/api/health/internal` (auth-gated).
- T-1-03 (tampering via recordProbe input) — **mitigated**. Probe key is the hardcoded literal `"last_health_check"`; no user input reaches the storage layer. The sqlite impl uses parameterized queries (proven in Plan 03).
- T-1-XX (DoS via unauthenticated endpoint) — **accepted for Phase 1**. Probe round-trip is single-digit-millisecond on sqlite-on-volume; not a viable amplifier. Rate-limiting deferred to Phase 7 if reachable from public internet.

No new endpoints, auth paths, or schema additions beyond what was modeled.

## Next Plan

**Plan 05: Deploy artifact (nixpacks.toml + Dockerfile + railway.toml + docker-health.sh smoke)** — picks up the now-working `/api/health` endpoint and wraps it in the deploy contract: Railway with `/data` volume + healthcheckPath, multi-stage Dockerfile with HEALTHCHECK directive hitting `/api/health`, and a `docker-health.sh` script that automates the curl smoke test deferred from this plan. Closes Phase 1.
