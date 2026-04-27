---
phase: 01-foundation
plan: 03
subsystem: storage-env-logger
tags: [storage, sqlite, zod, pino, migrations, wave-2, foundation]

# Dependency graph
requires: [01-01-foundation-test-infra, 01-02-toolchain-scaffold-trim]
provides:
  - Zod-parsed env config (NODE_ENV / LOG_LEVEL / DB_PATH + build-time vars) with fail-fast on invalid env
  - pino logger (level + base from env, ISO timestamps; pino-pretty deferred to Phase 7)
  - HealthProbeRepo async-only interface (Postgres-swappable seam)
  - sqlite implementation: lazy memoized getDb(), WAL + foreign_keys pragmas, idempotent migration runner
  - Phase 1 schema (0001_init.sql): health_probe(key, value, updated_at) only
  - Storage barrel (@/lib/storage) so Route Handlers import the seam, not the impl
  - pnpm onlyBuiltDependencies + .npmrc public-hoist-pattern for native bindings + eslint-config-next
affects: [01-04-health-route, 01-05-deploy-artifact]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lazy memoized DB handle (Pattern 1): module-scope `let db: Database | null`; first getDb() opens at env.DB_PATH, sets pragmas, runs migrations, memoizes; subsequent calls return the cached handle"
    - "Hand-rolled SQL migrations (Pattern 3): MIGRATIONS_DIR scanned with strict regex `^\\d{4}_[a-zA-Z0-9_]+\\.sql$` (T-1-03 path-traversal mitigation), pending applied in lexical order inside `db.transaction()`, tracked in `schema_migrations(id, applied_at)`"
    - "Async-only repo interface (Pattern 2): every method returns a Promise even when wrapping sync better-sqlite3 calls — Postgres swap is a one-day migration, not a callsite refactor"
    - "Per-method `getDb()` call (not module-load): `health-probe.ts` calls `getDb().prepare(...)` inside each method body so import-time side effects stay zero (no DB open until a request actually needs it)"
    - "Zod fail-fast env parser: `safeParse(process.env)` → on `!result.success`, log `flatten().fieldErrors` (key names + reasons only — no values per T-1-01) and throw `Invalid environment configuration`"
    - "NODE_ENV-aware default at schema-build time: `DB_PATH` default reads `process.env.NODE_ENV` directly inside the `.default()` callback so production gets `/data/datapraat.sqlite` and dev/test gets `./.data/datapraat.sqlite`"

key-files:
  created:
    - src/lib/env.ts
    - src/lib/logger.ts
    - src/lib/storage/repos.ts
    - src/lib/storage/index.ts
    - src/lib/storage/sqlite/client.ts
    - src/lib/storage/sqlite/migrate.ts
    - src/lib/storage/sqlite/health-probe.ts
    - src/lib/storage/sqlite/migrations/0001_init.sql
    - .npmrc
  modified:
    - package.json

key-decisions:
  - "Verbatim Pattern 1/2/3 + Discretion Gap 3/4 snippets from RESEARCH.md adopted with zero shape drift — the test contract from Plan 01 was authored against those exact module signatures, so any deviation would break tests."
  - "pnpm.onlyBuiltDependencies = ['better-sqlite3'] added to package.json (Rule 3). Pnpm 10 blocks native build scripts by default; without this entry the better-sqlite3 install completes but skips the prebuild step, and `new Database(...)` throws `Could not locate the bindings file` at runtime. This was a pre-existing latent issue — Plan 02 installed the dep but never executed it."
  - ".npmrc with `public-hoist-pattern[]=*eslint*` + `public-hoist-pattern[]=*prettier*` added (Rule 3). eslint-config-next references `eslint-plugin-react-hooks` by bare name; under pnpm's strict node_modules layout the plugin lives in `.pnpm/...` only and ESLint can't find it from the project root. The public-hoist-pattern is the canonical pnpm + Next.js bridge."
  - "No premature domain repos (Rule 2 negative): `repos.ts` exports ONLY HealthProbeRepo. ConversationRepo / ReportRepo / etc. land in their introducing phase per CONTEXT.md D-05. Confirmed by grep: only one `interface` keyword in repos.ts."
  - "Zod v4 `result.error.flatten().fieldErrors` works as expected on 4.3.6 — verified live with `node -e` before implementing. No fallback to `format()` or `issues` was needed; the contingency clause in PLAN.md Task 1 was unused."
  - "logger.ts wraps pino directly (not behind a factory). Phase 7 (OPS-02) will add `logger.child({ requestId })` per-route in middleware; that's a one-liner that doesn't change the import shape callsites use today."

requirements-completed: [FOUND-06, FOUND-07]

# Metrics
duration: 4m08s
completed: 2026-04-27
---

# Phase 01 Plan 03: Storage Seam + Zod Env + Pino Logger Summary

**Eight files implement the Phase 1 runtime spine — Zod-parsed env, pino logger, lazy memoized sqlite handle, idempotent migration runner with strict path-traversal regex, async-only HealthProbeRepo, and the Phase-1 baseline `health_probe` schema — turning four of the six Wave-0 RED tests GREEN in one wave.**

## Performance

- **Duration:** 4m 08s
- **Started:** 2026-04-27T18:19:58Z
- **Completed:** 2026-04-27T18:24:06Z
- **Tasks:** 3 / 3
- **Files created:** 9 (8 plan-targeted + `.npmrc` Rule-3 fix)
- **Files modified:** 1 (`package.json` — `pnpm.onlyBuiltDependencies` Rule-3 fix)

## Accomplishments

- Shipped the Zod-parsed `env` const with NODE_ENV-aware DB_PATH default, LOG_LEVEL enum, and field-level fail-fast logging (no values leaked).
- Shipped the pino logger reading level + base from `env.ts`, ISO timestamps; `pino-pretty` deferred per RESEARCH.md.
- Shipped a lazy memoized `getDb()` that opens at `env.DB_PATH`, sets `journal_mode = WAL` + `foreign_keys = ON`, runs migrations, and caches the handle.
- Shipped a 50-line migration runner that scans `migrations/` with a strict `^\d{4}_[a-zA-Z0-9_]+\.sql$` regex (T-1-03 mitigation), applies pending files atomically in a `db.transaction(...)`, and records each in `schema_migrations(id, applied_at)`.
- Shipped `0001_init.sql` creating only the `health_probe(key, value, updated_at)` table — Phase 1 scope, no premature domain tables.
- Shipped the `HealthProbeRepo` async interface, its sqlite implementation (upsert via `ON CONFLICT(key) DO UPDATE`), and the barrel that re-exports `sqliteHealthProbeRepo as healthProbeRepo`.
- Turned 4 Wave-0 RED tests GREEN in one wave: `env.test.ts` (6), `migrate.test.ts` (3), `client.test.ts` (3), `health-probe.test.ts` (3) — 15 individual tests.
- Cumulative Wave-0 status: 5 of 6 vitest test files GREEN (env, client, migrate, health-probe, check-env-example). Only `src/app/api/health/route.test.ts` remains RED — Plan 04 turns it GREEN.
- All quality gates pass: `tsc --noEmit` exit 0, `eslint src/lib` exit 0, `pnpm build` exit 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: env.ts (Zod fail-fast) + logger.ts (pino)** — `e007124` (feat)
2. **Task 2: migrate.ts + 0001_init.sql + client.ts + Rule-3 toolchain fixes** — `bb9d42a` (feat)
3. **Task 3: repos.ts + health-probe.ts + storage barrel index.ts** — `d6e0c22` (feat)

## Files Created/Modified

### Created — env + logger

- `src/lib/env.ts` — Zod schema for `NODE_ENV` / `LOG_LEVEL` / `DB_PATH` / `NEXT_PUBLIC_COMMIT_SHA` / `BUILD_TIME`. Exports `env: Env` (parsed const) and `type Env`. Throws `Invalid environment configuration` on `!result.success`.
- `src/lib/logger.ts` — `import pino from "pino"`; `export const logger = pino({ level: env.LOG_LEVEL, base: { env: env.NODE_ENV }, timestamp: pino.stdTimeFunctions.isoTime })`.

### Created — storage seam

- `src/lib/storage/repos.ts` — exports `interface HealthProbeRepo` with exactly two async methods: `recordProbe(key, atMs): Promise<void>` and `readProbe(key): Promise<number | null>`.
- `src/lib/storage/index.ts` — barrel: `export { sqliteHealthProbeRepo as healthProbeRepo } from "./sqlite/health-probe"; export type { HealthProbeRepo } from "./repos";`.
- `src/lib/storage/sqlite/client.ts` — `let db: Database.Database | null = null`; `getDb()` opens lazily, sets WAL + foreign_keys pragmas, calls `runMigrations(db)`, memoizes.
- `src/lib/storage/sqlite/migrate.ts` — `runMigrations(db)`. Creates `schema_migrations` if absent. Filters dir with `MIGRATION_FILENAME_RE = /^\d{4}_[a-zA-Z0-9_]+\.sql$/`. Sorts ascending. Applies pending in a single `db.transaction((file) => ...)`. Inserts into `schema_migrations` with `Date.now()`.
- `src/lib/storage/sqlite/health-probe.ts` — `sqliteHealthProbeRepo` const typed as `HealthProbeRepo`. `recordProbe` uses `INSERT ... ON CONFLICT(key) DO UPDATE` upsert. `readProbe` returns `row?.updated_at ?? null`. Both methods call `getDb()` per-invocation, not at module load.
- `src/lib/storage/sqlite/migrations/0001_init.sql` — `CREATE TABLE IF NOT EXISTS health_probe (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);`. Nothing else.

### Created — toolchain Rule-3 fix

- `.npmrc` — `public-hoist-pattern[]=*eslint*` and `public-hoist-pattern[]=*prettier*` so `eslint-config-next` can resolve `eslint-plugin-react-hooks` from project root under pnpm's strict node_modules.

### Modified

- `package.json` — added `"pnpm": { "onlyBuiltDependencies": ["better-sqlite3"] }` so pnpm 10 builds the native binding.

## Decisions Made

- **Verbatim adoption of RESEARCH.md snippets.** The test files from Plan 01 import from exact module paths and assert exact behaviors. Pattern 1/2/3 and Discretion Gap 3/4 snippets are the literal contract, copied with zero shape drift.
- **Zod v4 flatten works.** Verified live before writing env.ts: `result.error.flatten().fieldErrors` returns `{ LOG_LEVEL: ['Invalid option: ...'] }` on 4.3.6. The PLAN.md contingency clause (fall back to `format()` or `issues`) was unused.
- **Threat T-1-03 mitigation present and exercised.** `MIGRATION_FILENAME_RE` is the literal text in `migrate.ts:17` and the 3-test `migrate.test.ts` file passes — the regex is the only path through which migration files are loaded.
- **No domain repos leaked.** `repos.ts` exports exactly one interface. `index.ts` exports exactly one repo + one type. Verified by grep: `^export interface` count = 1 in `repos.ts`.
- **Phase 1 schema is intentionally minimal.** `0001_init.sql` creates `health_probe` only. `schema_migrations` is created by the runner itself, not by SQL — this was the explicit choice in CONTEXT.md so the runner is self-bootstrapping on a brand-new DB.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] better-sqlite3 native binding not built under pnpm 10**

- **Found during:** Task 2 first verify run.
- **Issue:** `pnpm exec vitest --run src/lib/storage/sqlite/migrate.test.ts` failed with `Could not locate the bindings file. Tried: ...build/Release/better_sqlite3.node ...`. Root cause: pnpm 10 blocks native install scripts by default and asks for explicit approval; Plan 02 installed `better-sqlite3@12.9.0` but never executed it, so the missing build was latent.
- **Fix:** Added `"pnpm": { "onlyBuiltDependencies": ["better-sqlite3"] }` to `package.json`. After `pnpm install` the prebuild step ran; bindings file appeared at `node_modules/.pnpm/better-sqlite3@12.9.0/node_modules/better-sqlite3/build/Release/better_sqlite3.node`.
- **Files modified:** `package.json`
- **Commit:** `bb9d42a`

**2. [Rule 3 — Blocking issue] eslint-plugin-react-hooks not resolvable under pnpm strict layout**

- **Found during:** Task 2 verify chain (`pnpm exec eslint src/lib/storage`).
- **Issue:** ESLint reported `Couldn't find the plugin "eslint-plugin-react-hooks"`. Root cause: pnpm's strict node_modules nests transitive deps under `.pnpm/`, but `eslint-config-next` references plugins by bare name from the project root. Plan 02's eslint check reportedly passed, but a fresh `pnpm install` (forced by the `onlyBuiltDependencies` change) re-laid the modules tree without a hoisted plugin.
- **Fix:** Added `.npmrc` with `public-hoist-pattern[]=*eslint*` and `public-hoist-pattern[]=*prettier*` (canonical pnpm + Next.js bridge). After `CI=true pnpm install` (CI flag needed because pnpm refused to remove the modules dir without TTY), the plugins hoisted to top-level node_modules and `pnpm exec eslint src/lib/storage` exited 0.
- **Files modified:** `.npmrc` (created)
- **Commit:** `bb9d42a`

These two fixes are inherited fragility from Plan 02 — both packages were installed by Plan 02 but the verification chain that would have caught them (running code that uses the native binding, running eslint after a clean install) didn't fire there. Both are now permanent fixes.

## Issues Encountered

- **pnpm 10 build-script approval friction.** Required adding `pnpm.onlyBuiltDependencies` to package.json — interactive `pnpm approve-builds` doesn't work in a non-TTY agent shell.
- **pnpm strict layout vs eslint-config-next.** The hoist pattern fix is the documented Next.js + pnpm convention; documented now in `.npmrc`.
- **`git stash --include-untracked` interaction during diagnosis.** Used briefly to test if eslint failure was pre-existing; fully restored with `git stash pop`. No code lost; the diagnosis confirmed the issue was independent of Plan 03 changes.

## Authentication Gates

None. No external services touched in this plan.

## Known Stubs

None. All eight plan-targeted files are real implementations:

- `env.ts` — actually parses env via Zod with real defaults and a real throw path.
- `logger.ts` — actual pino instance, not a console.log shim.
- `migrate.ts` — actually applies SQL transactionally with a real schema_migrations ledger.
- `client.ts` — actually opens a real `better-sqlite3` Database; tested at `:memory:` and the real on-disk path is wired via `env.DB_PATH`.
- `health-probe.ts` — actual upsert + read-back round-trip; verified by 3 tests.
- `0001_init.sql` — actual table.

The `src/app/page.tsx` placeholder noted in Plan 02's stub list is unchanged here — Plan 04 / Phase 2 will evolve it.

## Wave-2 GREEN State Confirmation

```
$ pnpm exec vitest --run src/lib/env.test.ts src/lib/storage scripts/check-env-example.test.ts
 ✓ src/lib/env.test.ts (6 tests)
 ✓ src/lib/storage/sqlite/migrate.test.ts (3 tests)
 ✓ src/lib/storage/sqlite/client.test.ts (3 tests)
 ✓ src/lib/storage/sqlite/health-probe.test.ts (3 tests)
 ✓ scripts/check-env-example.test.ts (1 test)
 Test Files  5 passed (5)
      Tests  16 passed (16)

$ pnpm exec tsc --noEmit; echo "exit=$?"
exit=0

$ pnpm exec eslint src/lib; echo "exit=$?"
exit=0

$ pnpm build  ... ✓ Compiled successfully; build exit=0
```

The remaining Wave-0 RED test (`src/app/api/health/route.test.ts`) stays RED — Plan 04 turns it GREEN.

## Verification Performed

- All Plan 03 acceptance criteria from PLAN.md (Tasks 1–3) checked individually:
  - Task 1: `env.ts` contains `import { z } from "zod"`, calls `safeParse`, throws `Invalid environment ...`, `DB_PATH` default reads `process.env.NODE_ENV === "production"`. `logger.ts` wraps `pino({ ... })` with `level: env.LOG_LEVEL` + `base: { env: env.NODE_ENV }`. No `pino-pretty` import.
  - Task 2: `0001_init.sql` contains `CREATE TABLE IF NOT EXISTS health_probe` and only that table. `migrate.ts` contains literal `MIGRATION_FILENAME_RE = /^\d{4}_[a-zA-Z0-9_]+\.sql$/`, uses `db.transaction(...)`, records `applied_at = Date.now()`. `client.ts` contains both pragmas, memoizes via `let db = null`, calls `runMigrations(db)` after `new Database(env.DB_PATH)`.
  - Task 3: `repos.ts` has exactly two methods on `HealthProbeRepo`. `health-probe.ts` uses `ON CONFLICT(key) DO UPDATE` (greppable). `getDb().prepare(` appears twice. `index.ts` re-exports `sqliteHealthProbeRepo as healthProbeRepo` and the type.
- 4 of 6 Wave-0 vitest files now GREEN (env, client, migrate, health-probe). 1 GREEN from Plan 02 (check-env-example). 1 RED until Plan 04 (route.test.ts).
- Storage seam contract: only `src/lib/storage/index.ts` references the `sqlite/` subdirectory; nothing outside `src/lib/storage/` imports from `sqlite/` directly. Confirmed by `grep -rn 'from "@/lib/storage/sqlite' src/`.

## Self-Check: PASSED

All claimed files verified to exist:

- `src/lib/env.ts` ✓
- `src/lib/logger.ts` ✓
- `src/lib/storage/repos.ts` ✓
- `src/lib/storage/index.ts` ✓
- `src/lib/storage/sqlite/client.ts` ✓
- `src/lib/storage/sqlite/migrate.ts` ✓
- `src/lib/storage/sqlite/health-probe.ts` ✓
- `src/lib/storage/sqlite/migrations/0001_init.sql` ✓
- `.npmrc` ✓
- `package.json` ✓ (modified with `pnpm.onlyBuiltDependencies`)

All claimed commits verified in `git log`:

- `e007124` ✓ (Task 1)
- `bb9d42a` ✓ (Task 2)
- `d6e0c22` ✓ (Task 3)

## Threat Flags

None. Plan 03 ships only the runtime code already enumerated in the plan's `<threat_model>`. No new endpoints, auth paths, or schema additions beyond what was modeled (T-1-03 mitigation is implemented; T-1-01 is mitigated by the field-name-only error log; T-1-05 is the operator-controlled DB_PATH; T-1-04 stays deferred to Plan 05).

## Next Plan

**Plan 04: `/api/health` Route Handler** — picks up the Zod env config, pino logger, and `healthProbeRepo` barrel from `@/lib/storage` to ship the 6-field health endpoint contract (status / commitSha / buildTime / nodeEnv / uptimeSec / db.{ok, probeMs}). Turns the last Wave-0 RED test (`src/app/api/health/route.test.ts`) GREEN.
