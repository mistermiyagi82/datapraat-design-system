---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-04-28T10:28:05.582Z"
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 9
  completed_plans: 6
  percent: 67
---

# State: DataPraat

**Last updated:** 2026-04-28 (after Plan 02-01 — Phase 2 Wave 0 test infrastructure)

## Project Reference

**Core value:** A municipality user opens DataPraat, asks a question about their data in plain Dutch, and gets back a correct, trust-marked chart with conversation continuity.

**Current focus:** Phase 02 — design-system

**Project mode:** yolo · **Granularity:** standard · **Parallelization:** enabled

## Current Position

Phase: 02 (design-system) — EXECUTING
Plan: 2 of 4 (Plan 01 complete)

- **Milestone:** v1
- **Phase:** 2
- **Plan:** 02-02 next (tokens, shadcn init, fonts, format helpers)
- **Status:** Executing Phase 02

```
Progress: [██████████████░░░░░░] 67% (6/9 plans complete; phase 02 wave 0 done)
```

| Phase                         | Status                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| 1. Foundation                 | Complete (5/5 plans done; Railway deploy live; awaiting verifier)                     |
| 2. Design System              | Eligible (depends on Phase 1)                                                         |
| 3. Marketing Landing          | Eligible after Phase 2 (parallel with Phase 4)                                        |
| 4. Chat Backbone              | Blocked on Phase 2                                                                    |
| 5. Generative Charts & Trust  | Blocked on Phase 4                                                                    |
| 6. Overzicht (Live VVD)       | Blocked on Phase 5                                                                    |
| 7. Stubs & Operability Polish | Blocked on Phase 1 (ops parts) and Phase 2 (stubs); parallel-eligible with Phase 6    |

## Performance Metrics

- Phases complete: 1/7 (Phase 1 awaiting verifier sign-off)
- Plans complete: 5/5 in phase 01 (0 plans complete in other phases)
- Requirements covered: 29/29 (mapped; FOUND-01 / FOUND-04 / FOUND-05 / FOUND-06 / FOUND-07 / OPS-01 implemented — all 6 Phase 1 requirements complete)
- Time-in-phase: 25m 46s automated + Railway deploy (Plan 01: 5m21s + Plan 02: 6m48s + Plan 03: 4m08s + Plan 04: 1m11s + Plan 05: 8m18s automated + manual deploy)

| Phase         | Plan | Duration                | Tasks | Files                                      | Date       |
| ------------- | ---- | ----------------------- | ----- | ------------------------------------------ | ---------- |
| 01-foundation | 01   | 5m 21s                  | 3     | 12 new + 1 modified (.gitignore)           | 2026-04-27 |
| 01-foundation | 02   | 6m 48s                  | 3     | 3 new + 7 modified                         | 2026-04-27 |
| 01-foundation | 03   | 4m 08s                  | 3     | 9 new + 1 modified (package.json)          | 2026-04-27 |
| 01-foundation | 04   | 1m 11s                  | 1     | 1 new                                      | 2026-04-27 |
| 01-foundation | 05   | 8m 18s + Railway deploy | 3     | 5 created (Dockerfile, .dockerignore, nixpacks.toml, railway.toml, docker-entrypoint.sh) + 7 modified | 2026-04-28 |
| 02-design-system | 01 | 5m 07s | 3 | 5 new (vitest.setup.ts + 4 RED tests) + 3 modified (package.json, pnpm-lock.yaml, vitest.config.ts) | 2026-04-28 |

## Accumulated Context

### Decisions (locked in by PROJECT.md)

- Single Next.js 15 app for marketing + product (shared design system, one deploy).
- Vibathon repo (`/Users/daan/VS Studio/vibathon-knowledgegraph`) is the architectural blueprint, not a fork.
- Stack updated from vibathon's pins: Next.js 15, React 19, Tailwind 4, shadcn 4 (`base-vega`), AI SDK 5, MCP SDK current, Recharts 3.
- Drop vibathon dependencies: Neo4j, Attio, googleapis, pdf-parse, LangChain.
- Hosting v1: Railway with Nixpacks + `/data` volume; architect for Azure Container Apps + Azure Files later. No Vercel-only APIs.
- Persistence: `better-sqlite3` behind a storage interface so Postgres can be swapped in.
- Chat is the v1 spine; KloptDit + Scenario ship as stubs.
- Existing prototype files at repo root are reference material — clean rebuild, not incremental migration.

### Decisions logged from Plan 01-01

- Scaffold via temp dir + selective copy because `pnpm create next-app .` refuses non-empty directories even with `--yes`. Copied scaffold output excluding `.git`, `node_modules`, `.next`, `CLAUDE.md`, `.gitignore`; ran `pnpm install` fresh inside the actual repo.
- Renamed scaffold's `package.name` from `next-tmp` → `datapraat`.
- Six Wave 0 RED test scaffolds (env, sqlite client/migrate/health-probe, /api/health, .env.example coverage) reference future implementation paths and fail with "Cannot find module" today — Plans 02–04 turn them GREEN.
- Did NOT install AI SDK / MCP SDK / shadcn / Recharts / Tabler / Base UI / better-sqlite3 / zod in Plan 01 — those land in their introducing phase.
- Did NOT add `engines.node`, `packageManager` pin, or version-locked dependencies — Plan 02 owns the three-way Node/pnpm pin.
- `.nvmrc` pins Node 22 with no `v` prefix, no trailing newline (verified with `[ "$(cat .nvmrc)" = "22" ]`).
- `.gitignore` extended preserving the original `.DS_Store` line.
- Prototype HTML/JSX/CSS files at repo root left untouched (per CONTEXT.md D-01).

### Decisions logged from Plan 01-02

- Pinned Next.js to 15.5.15 (downgraded from Plan 01's scaffold default of 16.2.4); same for `eslint-config-next` (15.5.15) — locked at the 15-line per PROJECT.md.
- RESEARCH.md proposed `@types/react-dom@19.2.5`, `@eslint/eslintrc@3.3.2`, `vitest@3.4.0` — none yet published. Substituted latest published patches (`19.2.3`, `3.3.5`, `3.2.4`).
- Three-way Node/pnpm pin closed: `engines.node = ">=22 <23"` + `packageManager = "pnpm@10.30.2"` + `.nvmrc = 22` (the latter from Plan 01).
- ESLint 9 flat config bridged to `eslint-config-next` via `FlatCompat` (the canonical Next.js maintainer pattern from discussion #71806; eslint-config-next still ships eslintrc-format only).
- `tsconfig.json` excludes `**/*.test.ts` so tsc passes on a tree where Wave-0 RED tests import not-yet-created modules; vitest still type-checks at test time.
- `next.config.ts` adds `outputFileTracingRoot=__dirname` (Rule 3 fix) — without it, Next inferred `/Users/daan` as workspace root because of an unrelated `package-lock.json` higher up the tree, breaking the `.next/standalone/server.js` placement.
- `next.config.ts` injects `NEXT_PUBLIC_COMMIT_SHA` (from `RAILWAY_GIT_COMMIT_SHA` slice or `git rev-parse --short HEAD` fallback) and `BUILD_TIME` (from `Date.now()`) at build time per CONTEXT.md D-12.
- `.env.example` documents `NODE_ENV`, `LOG_LEVEL`, `DB_PATH`; intentionally omits `NEXT_PUBLIC_COMMIT_SHA`/`BUILD_TIME` per RESEARCH.md Discretion Gap 5 — they're build-time-injected, not runtime-configurable.
- `src/app/layout.tsx` set to `<html lang="nl">` with DataPraat metadata; scaffold's Geist fonts dropped (design tokens land Phase 2).
- Skipped `.env.development` per RESEARCH.md — Zod schema (Plan 03) provides defaults; `.env.example` + `.env.local` is the cleaner override contract.

### Decisions logged from Plan 01-03

- Adopted RESEARCH.md Pattern 1/2/3 + Discretion Gap 3/4 snippets verbatim — the Plan-01 RED tests were authored against those exact module signatures, so any shape drift would have broken the test contract.
- `pnpm.onlyBuiltDependencies = ["better-sqlite3"]` added to `package.json` (Rule 3) — pnpm 10 blocks native build scripts by default; Plan 02 installed the dep but the prebuild step was latent. Without this, `new Database(...)` throws `Could not locate the bindings file` at runtime.
- `.npmrc` with `public-hoist-pattern[]=*eslint*` + `*prettier*` (Rule 3) — eslint-config-next references `eslint-plugin-react-hooks` by bare name; under pnpm strict layout the plugin lives in `.pnpm/...` only and ESLint can't resolve it from the project root. Canonical pnpm + Next.js bridge.
- `repos.ts` exports ONLY `HealthProbeRepo` — domain repos (Conversation, Report, etc.) land in their introducing phase per CONTEXT.md D-05.
- Migration runner uses literal regex `^\d{4}_[a-zA-Z0-9_]+\.sql$` (T-1-03 mitigation); only files matching this pattern are loaded from the `migrations/` directory.
- `getDb()` is called per-method in `health-probe.ts` (not at module load) — preserves the lazy-open contract; importing the storage barrel doesn't open the DB.
- Zod v4 `flatten().fieldErrors` works as expected on 4.3.6 — verified live with `node -e` before implementation. The PLAN.md fallback contingency was unused.

### Decisions logged from Plan 01-04

- Adopted RESEARCH.md Pattern 4 verbatim — the Plan 01 RED test asserted the exact response shape and 503-on-throw branch, so any drift would have broken the test contract. Both cases passed on first run.
- `commitSha` and `buildTime` read from `process.env.NEXT_PUBLIC_COMMIT_SHA` / `process.env.BUILD_TIME` (with `?? "unknown"` fallback), NOT from the `env` const — keeps the route's contract stable regardless of how `env.ts` defaulting changes, and lets test mocks set process.env directly without re-parsing the Zod schema.
- Explicit `if (readBack === null) throw` null-check inside the try block — without it, a successful write but missing read would silently report `db.ok: true`, defeating D-08's live-probe purpose.
- T-1-02 (info disclosure via /api/health response body) accepted for Phase 1 per CLAUDE.md "Auth v1: None / shared-link". No PII or auth material in the 6-field response. Future PII/auth introduction should split to `/api/health` (public liveness) + `/api/health/internal` (auth-gated).
- No `POST`/`DELETE`/`PUT` handler, no `/api/ready`, no `/api/live` — D-10 explicit: single endpoint, GET-only. K8s-style split probes deferred until Azure Container Apps explicitly needs them.

### Decisions logged from Plan 02-01

- Pinned `@vitejs/plugin-react@5.2.0` (Rule 3 deviation from RESEARCH.md's 6.0.1). plugin-react@6.x imports `./internal` from `vite@^8`; Phase 1's vitest@3.2.4 ships `vite@7.3.2`, so 6.0.1 fails at config load with `ERR_PACKAGE_PATH_NOT_EXPORTED`. 5.2.0 supports vite 4|5|6|7|8. Re-bump when vitest goes to 4.x.
- Other 4 dev deps pinned exactly per RESEARCH.md §1: `@testing-library/react@16.3.2`, `@testing-library/jest-dom@6.9.1`, `@testing-library/user-event@14.6.1`, `jsdom@29.1.0`. Lockfile validated with `pnpm install --frozen-lockfile`.
- Wave 0 ships test infrastructure only — vitest extended for jsdom + globals + plugin-react + setupFiles + `*.test.tsx` include; vitest.setup.ts registers jest-dom matchers + afterEach(cleanup); 4 RED test files lock the contracts of `fmtEUR/fmtNum/fmtPercent/fmtCompact` (DS-03a) and `Icon/TrustBadge/AskButton` (DS-03b/c/d). No implementation files created — Plans 02+03 own them, demonstrated by RED→GREEN flips.
- fmt tests use Intl-tolerant regex matchers (e.g. `/€\s*7\.200\.000/`) to absorb nl-NL non-breaking-space (U+00A0) variance across Node 22 patch versions.
- Component tests use the parent-spy pattern for stopPropagation: render `<div onClick={parentSpy}><X .../></div>`, click X, assert parentSpy NOT called. More durable than spying on the synthetic event object.
- Accepted RESEARCH.md Rule-3 corrections to be applied in Plan 02 (NOT modifying CONTEXT.md): D-05 `toast → sonner` (shadcn deprecation per issue #7120), and D-01 missing aliases (`--sidebar-*` 8 vars present-but-empty so a future `shadcn add sidebar` doesn't fail; `--destructive-foreground` dropped per Vega 4).

### Decisions logged from Plan 01-05

- Verbatim adoption of RESEARCH.md Pattern 6+7 snippets (Dockerfile + nixpacks.toml + railway.toml). Grep-based acceptance criteria assert exact text fragments (`apk add --no-cache libc6-compat python3 make g++`, `corepack prepare pnpm@10.30.2`, `healthcheckPath = "/api/health"`); any drift would have failed the gate.
- All three better-sqlite3 native-binding gotchas resolved in the multi-stage Alpine Dockerfile: deps `apk add python3 make g++`, runner `apk add libc6-compat`, explicit `COPY` of `src/lib/storage/sqlite/migrations` into the runner. Docker e2e green locally before Railway push.
- Container hardening: `addgroup --gid 1001 nodejs && adduser --uid 1001 nextjs`. After the Rule-3 entrypoint fix, the long-running Node process still runs as `nextjs` UID 1001 (verified `docker run id -u` returns 1001) — only a single `chown` shell command runs as root in the entrypoint, then `su-exec` drops privileges before exec'ing `node server.js`. T-1-04 mitigation intact.
- `nixpacks.toml` pins `pnpm-9_x` even with `packageManager: pnpm@10.30.2` — Nixpacks needs SOME pnpm to launch the install phase before Corepack downloads the pinned version. RESEARCH.md Caveats documents this bridge.
- `railway.toml` differs from vibathon on one line: `healthcheckPath = "/api/health"` (vibathon used `/`). Otherwise identical (NIXPACKS, /data volume, ON_FAILURE restart with 3 retries).
- **Rule-3 fix during checkpoint:** `docker-entrypoint.sh` + Dockerfile chown shim added after first Railway deploy hit `SQLITE_CANTOPEN`. Railway bind-mounts volumes as root-owned by default; the local docker-health smoke didn't catch this because host bind-mounts inherit host UID. Entrypoint chowns `$DATA_DIR` as root, then `su-exec nextjs:nodejs "$@"` to drop privileges. Preserves CONTEXT.md D-15 (non-root app process). Will be unnecessary if Railway later supports volume UID/GID configuration.
- **Rule-3 mitigation during checkpoint:** `RAILWAY_GIT_COMMIT_SHA` set as a manual Railway service variable because `railway up` (CLI upload) doesn't carry git context the way GitHub-tracked deploys do. Once Phase 7 OPS-03 wires the project to GitHub auto-deploy, Railway will inject the SHA automatically and the manual var becomes redundant but harmless.
- **Railway deploy verified live** at <https://datapraat-app-production.up.railway.app> on 2026-04-28. /api/health returns 200 with `status:"ok"`, `commitSha:"22e64a2"`, `nodeEnv:"production"`, `db.ok:true`, `db.probeMs:0`. Volume persistence confirmed via redeploy (uptime drop 25→3, db still reachable).

### Open Todos

- Run `gsd-verifier` for Phase 1 sign-off.
- Execute Plan 02-02 (tokens + shadcn init + fonts + format helpers) — turns the 12 fmt RED tests GREEN; applies the toast→sonner Rule-3 correction.
- Execute Plan 02-03 (Icon/TrustBadge/AskButton custom primitives) — turns the 3 component test files GREEN.
- Execute Plan 02-04 (`/internal/design` page + remaining shadcn primitives + side-by-side token QA).
- Phase 7 OPS-03: connect Railway project to GitHub for auto-deploy (obsoletes the manual `RAILWAY_GIT_COMMIT_SHA` service variable).
- Decide MCP server URL convention (env var name, default value) at Phase 4 planning.

### Blockers

None.

### Notes

- VVD MCP and DataPraatFormaat MCP are both available in the working environment for live wiring during Phase 4–6.
- Phases 2/3, 3/4, and 6/7 are eligible for parallel execution per ROADMAP.md "Parallelization" section.

## Session Continuity

**Last action:** Completed Plan 02-01 — Test infrastructure for design system (3 tasks; commits d5146b0 + baf287c + 2618605). Installed 5 dev deps (jsdom, RTL, jest-dom, user-event, plugin-react); extended vitest config for jsdom + globals + plugin-react + `*.test.tsx`; created vitest.setup.ts with jest-dom matchers + afterEach(cleanup); shipped 4 RED test files locking the contracts of fmt helpers (12 tests) + Icon/TrustBadge/AskButton (3 files). RED state confirmed: vitest exits 1 with "Failed to resolve import" for all 4 files. Phase 1 tests still GREEN (6 files / 18 tests). One Rule-3 deviation: `@vitejs/plugin-react` pinned at 5.2.0 instead of RESEARCH.md's 6.0.1 (6.x requires vite 8 which Phase 1's vitest 3.2.4 doesn't ship).

**Phase 2 status:** Plan 01 (Wave 0 test infra) complete. Plans 02 (tokens/shadcn/fonts/fmt), 03 (custom primitives), 04 (/internal/design + remaining shadcn) ahead.

**Next action:** Execute Plan 02-02 (tokens + shadcn init + fonts + fmt helpers). Will turn the 12 fmt RED tests GREEN.

**Resumption:** Read `.planning/phases/02-design-system/02-01-SUMMARY.md` for Wave 0 close-out. ROADMAP.md Phase 2 progress now shows 1/4 plans complete.

**Last session:** 2026-04-28T10:28:05.579Z

---

_State initialized: 2026-04-26 · Updated 2026-04-28 after 02-01-PLAN.md (Phase 2 Wave 0 — test infrastructure complete)_
