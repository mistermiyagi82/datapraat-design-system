---
phase: 01-foundation
plan: 01
subsystem: testing
tags: [next.js, vitest, scaffold, gitignore, wave-0, verification-rails]

# Dependency graph
requires: []
provides:
  - Next.js 16 + React 19 + TypeScript 5 scaffold via pnpm create next-app
  - Vitest 3.2.4 test runner (node env, src + scripts globs, @ alias)
  - .nvmrc pinning Node 22 for the repo
  - Extended .gitignore covering .next, node_modules, .env*, .data/, coverage, editor dirs
  - Six RED test scaffolds covering FOUND-06, FOUND-07, OPS-01
  - Four executable verification shell scripts covering FOUND-01, FOUND-05, FOUND-07, OPS-01
affects: [01-02-foundation-strict-config, 01-03-storage-env, 01-04-health-route, 01-05-deploy-artifact]

# Tech tracking
tech-stack:
  added:
    - next@16.2.4
    - react@19.2.4 / react-dom@19.2.4
    - typescript@5.9.3 (strict via scaffold default)
    - tailwindcss@4.2.4 + @tailwindcss/postcss@4.2.4
    - eslint@9.39.4 + eslint-config-next@16.2.4 (flat config)
    - vitest@3.2.4 + @vitest/ui@3.2.4
    - "@types/node@20.19.39, @types/react@19.2.14, @types/react-dom@19.2.3"
  patterns:
    - "Wave 0 RED test scaffolds: tests written first against future module paths, fail with 'Cannot find module' until implementation lands"
    - "vi.resetModules() + dynamic import() pattern so env / client modules can be re-parsed under different process.env on each test"
    - "Verification shell scripts use set -euo pipefail and live in scripts/ alongside the *.test.ts vitest scripts"
    - "Prototype HTML/JSX/CSS files left untouched at repo root; new app installed alongside (CONTEXT.md D-01 compliance)"

key-files:
  created:
    - vitest.config.ts
    - .nvmrc
    - package.json (via scaffold; renamed to "datapraat", added test/test:ci scripts)
    - pnpm-lock.yaml
    - pnpm-workspace.yaml
    - eslint.config.mjs
    - next.config.ts
    - postcss.config.mjs
    - tsconfig.json
    - next-env.d.ts (gitignored)
    - AGENTS.md (scaffold-generated Next.js agent rules)
    - README.md (scaffold-generated)
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - src/app/favicon.ico
    - src/lib/env.test.ts
    - src/lib/storage/sqlite/client.test.ts
    - src/lib/storage/sqlite/migrate.test.ts
    - src/lib/storage/sqlite/health-probe.test.ts
    - src/app/api/health/route.test.ts
    - scripts/check-env-example.test.ts
    - scripts/check-dev-boot.sh
    - scripts/check-standalone.sh
    - scripts/check-no-vercel.sh
    - scripts/check-docker-health.sh
    - public/file.svg, public/globe.svg, public/next.svg, public/vercel.svg, public/window.svg
  modified:
    - .gitignore (extended with Next.js / Node / env / sqlite / coverage / editor blocks while preserving the original .DS_Store line)

key-decisions:
  - "Scaffold via temp dir + selective copy because pnpm create next-app refuses to write into a non-empty directory; --yes does not override that safety check. Copied scaffold output excluding .git, node_modules, .next, CLAUDE.md, .gitignore — then ran pnpm install fresh so the lockfile lives in the actual repo."
  - "Renamed scaffold's package name from 'next-tmp' to 'datapraat' immediately to avoid leaking the temp slug into history."
  - "Did NOT install AI SDK / MCP SDK / shadcn / Recharts / Tabler / Base UI / better-sqlite3 / zod — those land in their introducing phase per CLAUDE.md; better-sqlite3 in particular ships in Plan 03."
  - "Did NOT add engines.node, packageManager pin, or version-locked dependencies — Plan 02 (Task 1) owns the three-way Node/pnpm pin (D-03)."
  - "Wave 0 tests reference future implementation paths (./env, ./client, ./migrate, ./health-probe, ./route, @/lib/storage). RED state with 'Cannot find module' is the desired outcome — Plans 02-04 turn them GREEN."

patterns-established:
  - "Wave 0 verification rail: every Phase 1 requirement (FOUND-01/04/05/06/07, OPS-01) has at least one automated test or shell script that fails today and passes once the implementing wave lands."
  - "Test files use explicit Vitest imports (import { describe, it, expect } from 'vitest') — no reliance on globals."
  - "Shell scripts start with #!/usr/bin/env bash + set -euo pipefail and are committed with chmod +x."
  - "Prototype preservation: existing root-level *.html, *.jsx, *.css, *.js files are reference-only and must not be touched by Phase 1 work."

requirements-completed: [FOUND-01, FOUND-04, FOUND-05, FOUND-06, FOUND-07, OPS-01]

# Metrics
duration: 5m21s
completed: 2026-04-27
---

# Phase 01 Plan 01: Wave 0 Test Infrastructure & Verification Rails Summary

**Next.js 16 + React 19 scaffold installed alongside the prototype, Vitest 3 wired up, and 12 new files (1 config, 1 .nvmrc, 6 RED tests, 4 verify scripts) establish the feedback loop that gates every later Phase 1 wave.**

## Performance

- **Duration:** 5m 21s
- **Started:** 2026-04-27T17:57:07Z
- **Completed:** 2026-04-27T18:02:28Z
- **Tasks:** 3 / 3
- **Files modified:** 1 (.gitignore)
- **Files created:** ~30 (scaffold output + 6 tests + 4 scripts + config files)

## Accomplishments

- Bootstrapped a clean Next.js 16 / React 19 / TypeScript 5 / Tailwind 4 application alongside the existing prototype (no prototype files mutated).
- Installed Vitest 3.2.4 + @vitest/ui as devDependencies; added `test` and `test:ci` scripts.
- Created `vitest.config.ts` with node environment, `src/**/*.test.ts` + `scripts/**/*.test.ts` globs, and a `@/` alias mapping to `src/`.
- Pinned Node 22 via `.nvmrc` (exactly the two characters `22`, no trailing newline — verified with `[ "$(cat .nvmrc)" = "22" ]`).
- Extended `.gitignore` with Next.js, Node, `.env*`, `/.data/`, coverage, and editor directories while preserving the original `.DS_Store` entry.
- Authored 6 Wave 0 test files (env, client, migrate, health-probe, route, env-example coverage) — all RED with "Cannot find module", proving the tests are real, not vacuous.
- Authored 4 executable verification shell scripts (`check-dev-boot.sh`, `check-standalone.sh`, `check-no-vercel.sh`, `check-docker-health.sh`) — `bash -n` clean, `check-no-vercel.sh` passes today against the empty src/ tree.

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js scaffold + Vitest + extend .gitignore** — `b57f2cf` (chore)
2. **Task 2: Write Wave 0 test files (RED state)** — `2b4ca8e` (test)
3. **Task 3: Write Wave 0 verification scripts (shell)** — `b0b471f` (chore)

## Files Created/Modified

### Created — config & tooling
- `vitest.config.ts` — Vitest 3 config (node env, src + scripts globs, `@` → `./src` alias)
- `.nvmrc` — pins Node 22 (no `v` prefix, no trailing newline)
- `package.json` — scaffold-generated, name set to `datapraat`, with `test` and `test:ci` scripts added
- `pnpm-lock.yaml`, `pnpm-workspace.yaml` — pnpm 10 lockfile + workspace
- `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`, `postcss.config.mjs` — Next 16 / TS / ESLint flat config / Tailwind PostCSS
- `AGENTS.md`, `README.md` — scaffold-generated docs
- `src/app/{layout.tsx,page.tsx,globals.css,favicon.ico}` — default scaffold landing page
- `public/{file,globe,next,vercel,window}.svg` — default scaffold static assets

### Created — Wave 0 tests
- `src/lib/env.test.ts` — 6 cases covering FOUND-07 Zod env schema (accept/reject + defaults for `NODE_ENV` / `LOG_LEVEL` / `DB_PATH`)
- `src/lib/storage/sqlite/client.test.ts` — 3 cases: lazy + memoized `getDb()`, migrations run on first call, `health_probe` table created (FOUND-06)
- `src/lib/storage/sqlite/migrate.test.ts` — 3 cases: fresh-DB schema, idempotency on second run, `0001_init.sql` recorded (FOUND-06)
- `src/lib/storage/sqlite/health-probe.test.ts` — 3 cases: round-trip, null on unknown key, upsert (FOUND-06)
- `src/app/api/health/route.test.ts` — 2 cases: 200 happy with all six fields, 503 degraded when storage throws (OPS-01)
- `scripts/check-env-example.test.ts` — `.env.example` keys ⊇ runtime-configurable Zod schema keys (FOUND-07)

### Created — Wave 0 shell verifiers
- `scripts/check-dev-boot.sh` — boots `pnpm dev`, curls `/`, fails if no response within 30s (FOUND-01)
- `scripts/check-standalone.sh` — asserts `.next/standalone/server.js` exists post-build (FOUND-05)
- `scripts/check-no-vercel.sh` — greps src/ for `@vercel/(kv|blob|postgres|edge-config)`, `next/og`, `runtime: 'edge'`, hardcoded API key patterns (FOUND-07)
- `scripts/check-docker-health.sh` — end-to-end docker build + run + curl `/api/health` with `/data` volume mount (FOUND-05 + OPS-01)

### Modified
- `.gitignore` — appended Next.js / Node / env / sqlite / coverage / editor blocks; original `.DS_Store` line preserved.

## Decisions Made

- **Scaffold-into-temp-dir workaround.** `pnpm create next-app .` (and even `--yes`) refused to write into the existing repo because it contains the prototype HTML/JSX/CSS files. Worked around by scaffolding into `/tmp/datapraat-scaffold/next-tmp`, then selectively copying the new files into the repo (skipping `.git`, `node_modules`, `.next`, the scaffold's `CLAUDE.md` stub, and the scaffold's `.gitignore`). Then ran `pnpm install` fresh so node_modules and lockfile both live in the actual repo.
- **Package name renamed to `datapraat`.** The scaffold defaults to the directory slug (`next-tmp`); changing it immediately keeps the repo identity correct.
- **No premature deps.** Did not install AI SDK / MCP SDK / shadcn / Recharts / Tabler / Base UI / better-sqlite3 / zod — they land in their introducing phase per CLAUDE.md. `migrate.test.ts` will fail on `import Database from "better-sqlite3"` today; that is expected RED state.
- **No `engines.node` / `packageManager` pin yet.** Plan 02 (Task 1) owns the three-way Node/pnpm pin per CONTEXT.md D-03.

## Deviations from Plan

None - plan executed exactly as written.

The plan correctly anticipated the `pnpm create next-app .` non-empty-directory issue and authorised the temp-dir + selective-copy workaround in the Task 1 action description. No Rule 1-4 deviations were required.

## Issues Encountered

- **Scaffold refused non-empty directory** — handled per the plan's documented contingency (temp dir + selective copy + fresh `pnpm install`).
- **`vercel.svg` shipped by Next.js scaffold in `public/`** — kept as-is; `check-no-vercel.sh` only greps `src/` for Vercel-only **API/runtime** imports, not static assets. The svg can be removed in a later cleanup pass if desired.

## Authentication Gates

None.

## Known Stubs

None. Wave 0 deliberately ships only test scaffolds and verifiers — no UI surface, no data wiring, no placeholder data. The "stubs" here are RED tests that will be turned GREEN by Plans 02-04, which is the intended Wave 0 state, not a bug.

## Wave 0 RED State Confirmation

```
$ pnpm exec vitest --run
 Test Files  6 failed (6)
      Tests  15 failed (15)
   Duration  541ms
```

All six test files fail with "Cannot find module" against the not-yet-existent implementations:
- `./env` (Plan 02)
- `./client`, `./migrate`, `./health-probe` (Plan 03)
- `./route`, `@/lib/storage` (Plan 04)
- `.env.example` not yet at repo root (Plan 02)

This is the correct Wave 0 state. Plans 02-04 will turn them GREEN.

## Verification Performed

- `test -f vitest.config.ts && test -f .nvmrc && [ "$(cat .nvmrc)" = "22" ]` → PASS
- `grep -q "/.next/" .gitignore && grep -q "/.data/" .gitignore` → PASS
- `pnpm exec vitest --version` → `vitest/3.2.4 darwin-arm64 node-v22.22.1`
- All 6 test files exist; `pnpm exec vitest --run` exits non-zero with 29 "Cannot find module" occurrences in the log → confirms RED state is real
- All 4 shell scripts exist with `+x`; `bash -n` clean on all 4
- `bash scripts/check-no-vercel.sh` → exit 0 (`✓ No Vercel-only APIs ...`)
- `bash scripts/check-standalone.sh` → exit 1 with the expected message (no build run yet — that's the design)
- `git status --short` shows the prototype files (DataPraat.html, styles.css, *.jsx, etc.) are NOT in the modified set — they remain at their original mtime from the initial commit `65059ee`.

## Self-Check: PASSED

All claimed files verified to exist:
- vitest.config.ts ✓
- .nvmrc ✓
- All 6 test files ✓
- All 4 shell scripts ✓ (with +x)

All claimed commits verified in `git log`:
- b57f2cf ✓ (Task 1)
- 2b4ca8e ✓ (Task 2)
- b0b471f ✓ (Task 3)

## Threat Flags

None. Plan 01 only writes test scaffolds and verifiers — no new network endpoints, auth paths, file access patterns, or schema changes at trust boundaries. The plan's `<threat_model>` already noted T-1-01 (info disclosure via .gitignore) is mitigated by the extended `.gitignore` shipped here.

## Next Plan

**Plan 02: Strict TS + ESLint flat + Prettier + Zod env + minimal layout / page** — picks up the Wave 0 rails and starts the implementation waves.
