---
phase: 02-design-system
plan: 01
subsystem: test-infra
tags: [wave-0, vitest, jsdom, rtl, jest-dom, plugin-react, red-tests, design-system]

# Dependency graph
requires: [01-foundation]
provides:
  - jsdom + RTL + jest-dom + @vitejs/plugin-react installed at exact pins
  - vitest.config.ts extended for DOM tests (jsdom env, globals, plugin-react, *.test.tsx include, setupFiles)
  - vitest.setup.ts (new) registers @testing-library/jest-dom matchers + afterEach(cleanup)
  - 4 RED test files locking the contracts of fmt helpers (DS-03a) + Icon/TrustBadge/AskButton (DS-03b/c/d)
  - Phase 2 implementation waves can demonstrate progress by turning a RED test GREEN
affects: [02-02-tokens-shadcn-fonts-formatters, 02-03-custom-primitives]

# Tech tracking
tech-stack:
  added:
    - "@testing-library/react@16.3.2"
    - "@testing-library/jest-dom@6.9.1"
    - "@testing-library/user-event@14.6.1"
    - "jsdom@29.1.0"
    - "@vitejs/plugin-react@5.2.0 (Rule 3 — RESEARCH.md proposed 6.0.1 but 6.x requires vite@^8 internals; vitest@3.2.4 ships vite@7.3.2)"
  patterns:
    - "Vitest jsdom env + globals: true + setupFiles for the RTL idiom"
    - "afterEach(cleanup) prevents DOM state leakage between component tests"
    - "Test files use future import paths (./index, ./Icon, ./TrustBadge, ./AskButton) so they fail with 'Failed to resolve' today and turn GREEN once Plans 02+03 ship the implementations"
    - "Intl-tolerant regex assertions in fmt tests absorb nl-NL non-breaking-space variance across Node patch versions"
    - "Parent-spy pattern for stopPropagation: render <div onClick={parentSpy}><X .../></div>, click X, assert parentSpy not called"

key-files:
  created:
    - vitest.setup.ts
    - src/lib/format/index.test.ts
    - src/components/design/Icon.test.tsx
    - src/components/design/TrustBadge.test.tsx
    - src/components/design/AskButton.test.tsx
  modified:
    - package.json
    - pnpm-lock.yaml
    - vitest.config.ts

key-decisions:
  - "Pinned @vitejs/plugin-react@5.2.0 (Rule 3 deviation from RESEARCH.md's 6.0.1). plugin-react@6.x imports './internal' from vite@^8; Phase 1's vitest@3.2.4 ships vite@7.3.2, so 6.0.1 fails at config load with ERR_PACKAGE_PATH_NOT_EXPORTED. 5.2.0 supports vite 4|5|6|7|8 — verified via pnpm view. Re-verify when vitest upgrades to 4.x (which will bring vite 8)."
  - "Other 4 dev deps pinned exactly per RESEARCH.md §1: @testing-library/react@16.3.2, @testing-library/jest-dom@6.9.1, @testing-library/user-event@14.6.1, jsdom@29.1.0."
  - "Did NOT install Phase-2 implementation deps in Wave 0: @tabler/icons-react, shadcn primitives, sonner, clsx, tailwind-merge, class-variance-authority, AI SDK, MCP SDK, Recharts. Those land in Plans 02–04 in their introducing wave."
  - "Did NOT create implementation files (Icon.tsx, TrustBadge.tsx, AskButton.tsx, src/lib/format/index.ts) in Wave 0. Tests fail with 'Failed to resolve import' — the canonical RED state — so Plans 02+03 can demonstrate progress by turning each test GREEN."
  - "fmt tests use regex matchers (e.g. /€\\s*7\\.200\\.000/) instead of literal strings to absorb nl-NL Intl non-breaking-space (U+00A0) shape across Node 22 patch versions."

requirements-completed: []

# Metrics
duration: 5m07s
completed: 2026-04-28
---

# Phase 02 Plan 01: Test Infrastructure for Design System Summary

**Wave 0 ships the verification rails for Phase 2: jsdom + RTL + jest-dom + plugin-react installed, vitest extended for component tests, and 4 RED test files locking the contracts of `fmtEUR`/`fmtNum`/`fmtPercent`/`fmtCompact` and the `Icon`/`TrustBadge`/`AskButton` primitives. Plans 02+03 turn them GREEN.**

## Performance

- **Duration:** 5m 07s
- **Started:** 2026-04-28T10:20:27Z
- **Completed:** 2026-04-28T10:25:34Z
- **Tasks:** 3 / 3
- **Files modified:** 3 (`package.json`, `pnpm-lock.yaml`, `vitest.config.ts`)
- **Files created:** 5 (`vitest.setup.ts`, four `*.test.{ts,tsx}` files)

## Accomplishments

- Installed 5 Wave-0 dev dependencies (4 at RESEARCH.md pins, 1 at the closest vite-7-compatible patch — Rule 3, see Deviations).
- Extended `vitest.config.ts` from a node-env config to a jsdom + plugin-react config without rewriting it: added `plugins: [react()]`, switched `environment: "node"` → `"jsdom"`, set `globals: true`, added `setupFiles: ["./vitest.setup.ts"]`, and broadened `include` to match `*.test.tsx`.
- Created `vitest.setup.ts` with two imports + an `afterEach(cleanup)` so jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`, `toHaveAttribute`) register on `expect` and DOM state doesn't leak between tests.
- Authored **`src/lib/format/index.test.ts`** — 12 RED tests across 4 helpers (3 cases each), with Intl-tolerant regex assertions for the nl-NL non-breaking-space variance.
- Authored **`src/components/design/Icon.test.tsx`** — renders all 24 `IconName` values, asserts `viewBox="0 0 16 16"` and `stroke="currentColor"`, exercises default and explicit `size` props.
- Authored **`src/components/design/TrustBadge.test.tsx`** — asserts the 90/70 tier formula with scores 95 / 80 / 60, percentage in text content, and `e.stopPropagation()` semantics via the parent-spy pattern.
- Authored **`src/components/design/AskButton.test.tsx`** — asserts default Dutch label "Vraag hierover", `ask-btn-sm`/`md`/`lg` size classes, custom label override, className append-without-loss, and stopPropagation.
- All 4 test files are RED today with `Failed to resolve import` (the contractually correct RED shape): Plan 02 turns the format test GREEN by shipping `src/lib/format/index.ts`; Plan 03 turns the 3 component tests GREEN by shipping the 3 primitives.
- Phase 1's existing tests remain GREEN: `pnpm test:ci` runs 6 test files / 18 tests, all pass under the new jsdom env.
- Full toolchain green on a clean tree: `pnpm exec tsc --noEmit` exit 0, `pnpm exec eslint .` exit 0, `pnpm build` exit 0, `pnpm install --frozen-lockfile` exit 0.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install jsdom + RTL + jest-dom + plugin-react devDependencies** — `d5146b0` (chore)
2. **Task 2: Extend vitest.config.ts and create vitest.setup.ts** — `baf287c` (chore)
3. **Task 3: Write 4 RED test files** — `2618605` (test)

## Files Created/Modified

### Created

- `vitest.setup.ts` — `import "@testing-library/jest-dom/vitest"` + `afterEach(() => cleanup())`. The `/vitest` jest-dom entrypoint is the canonical Vitest registration for matchers since jest-dom@6.0; the `cleanup` import comes from RTL.
- `src/lib/format/index.test.ts` — 12 RED tests for `fmtEUR` / `fmtNum` / `fmtPercent` / `fmtCompact` (3 cases each), greppable for all 4 helper names.
- `src/components/design/Icon.test.tsx` — RED tests covering the 24-name `IconName` literal union; renders each via inline NAMES array; asserts viewBox / stroke / size attributes.
- `src/components/design/TrustBadge.test.tsx` — RED tests for tier classes at scores 95 / 80 / 60; uses `userEvent.setup()` + `vi.fn()` for the click + parent-spy pattern.
- `src/components/design/AskButton.test.tsx` — RED tests for label default + override, all 3 sizes, className append, click + stopPropagation.

### Modified

- `package.json` — Added 5 dev dependencies. The `@vitejs/plugin-react` pin lands at `5.2.0` (not RESEARCH.md's 6.0.1 — see Deviations).
- `pnpm-lock.yaml` — Regenerated; +63 packages from RTL + jsdom transitive graph (jest-dom dependency, dom-accessibility-api, css-parser via jsdom, etc.).
- `vitest.config.ts` — Phase 1's node-env config extended to jsdom + plugin-react + setupFiles + `*.test.tsx` include. The `@/` resolve alias preserved.

## Decisions Made

- **Hard-pinned 5 dev deps with no caret/tilde tolerance** to match Phase 1's exact-pin policy. RESEARCH.md §1 dictated 4 of them; the 5th (`@vitejs/plugin-react`) needed a Rule-3 fix (see below).
- **No implementation files were created.** RED-as-Failed-to-resolve is the canonical shape — Plan 02 owns `src/lib/format/index.ts`, Plan 03 owns `Icon.tsx` / `TrustBadge.tsx` / `AskButton.tsx`. Acceptance criteria explicitly forbid stubbing those files in Wave 0.
- **Intl-tolerant assertions** in fmt tests. Rather than comparing to a literal `"€ 7.200.000"` (which would break on Node patch versions that emit U+00A0 vs. U+0020), tests use `.toMatch(/€\s*7\.200\.000/)`. Same approach for `fmtPercent` (regex `/12,3.*%/`) absorbs Intl decimal-comma variance.
- **Parent-spy pattern for stopPropagation.** TrustBadge and AskButton both invoke `e.stopPropagation()` before forwarding to `onClick`. Tests render the component inside `<div onClick={parentSpy}>` and assert `parentSpy` was NOT called when the inner element was clicked. This is more durable than spying on the synthetic event object (which RTL's userEvent abstracts).
- **`globals: true` was added to vitest.config.** RTL examples assume globals; jest-dom matchers register on the global `expect`. This deviates from Phase 1's explicit-import idiom — node-env tests still work because they import `{ describe, it, expect }` from `"vitest"` explicitly anyway.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] @vitejs/plugin-react@6.0.1 incompatible with vitest@3.2.4 (vite@7)**

- **Found during:** Task 2 verify chain (`pnpm test:ci`).
- **Issue:** `pnpm test:ci` failed at config-load time with `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './internal' is not defined by "exports" in node_modules/.pnpm/.../vite/package.json`. Root cause: `@vitejs/plugin-react@6.x` imports vite internals that only exist in `vite@^8`. Phase 1's `vitest@3.2.4` ships `vite@7.3.2` (verified in lockfile path), so 6.0.1 cannot load.
- **Fix:** Downgraded to `@vitejs/plugin-react@5.2.0` — the latest 5.x line — which declares `vite: ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0` peer support (verified via `pnpm view @vitejs/plugin-react@5.2.0 peerDependencies`). After downgrade, all 6 Phase-1 test files run cleanly under the new jsdom env.
- **Files modified:** `package.json` (`@vitejs/plugin-react: 5.2.0`), `pnpm-lock.yaml`.
- **Commit:** `baf287c` (Task 2).
- **Forward note:** When Phase 2 or a later phase upgrades to vitest 4.x (which ships vite 8), this pin should bump back to `@vitejs/plugin-react@6.x`.

### Accepted Rule-3 Corrections from RESEARCH.md (to be applied in Plan 02)

These are research-flagged corrections to CONTEXT.md decisions. They do NOT modify CONTEXT.md (per output spec); Plan 02 implements them.

- **D-05 toast → sonner:** shadcn deprecated the `toast` primitive in favor of `sonner` ([shadcn issue #7120](https://github.com/shadcn-ui/ui/issues/7120)). Plan 02 will run `pnpm dlx shadcn@latest add sonner` instead of `... add toast`. Net change: `sonner@2.0.7` instead of `@radix-ui/react-toast`.
- **D-01 missing aliases:** RESEARCH.md §4 catches three things missing from CONTEXT.md's shadcn alias list: (a) `--destructive-foreground` is dropped (shadcn 4 Vega uses `--destructive` alone for both bg+fg); (b) the eight `--sidebar-*` variables Vega ships by default — present-but-empty in `globals.css` so a future `shadcn add sidebar` doesn't fail theme resolution; (c) the derived `--radius-sm/md/lg/xl/2xl/3xl/4xl` scale. Plan 02's `globals.css` skeleton (RESEARCH.md §3) already includes them.

## Issues Encountered

- **`@vitejs/plugin-react@6` peer-dep bait.** RESEARCH.md (authored 2026-04-28) verified the package version exists, but didn't catch the vite-major mismatch. Live install + run was the only way to surface it. Logged as Rule 3.
- **Pre-existing planning-file edits in working tree.** `.planning/STATE.md`, `.planning/config.json`, `02-02-PLAN.md`, `02-04-PLAN.md`, `02-VALIDATION.md` showed as `M` in `git status --short` at executor start — left untouched (out of scope for Wave 0). They will be picked up by their respective owners (planner / orchestrator).

## Authentication Gates

None. No external services required for Wave 0 test infrastructure.

## Known Stubs

None. No implementation files were created in Wave 0 — that's by design (Plans 02+03 own them). Test files are real, non-skipped, and currently failing with `Failed to resolve import` per the RED contract.

## Wave-0 RED-State Confirmation

```
$ pnpm exec vitest --run src/lib/format src/components/design 2>&1 | tail
 FAIL  src/components/design/AskButton.test.tsx
  Error: Failed to resolve import "./AskButton" from "src/components/design/AskButton.test.tsx".
 FAIL  src/components/design/Icon.test.tsx
  Error: Failed to resolve import "./Icon" from "src/components/design/Icon.test.tsx".
 FAIL  src/components/design/TrustBadge.test.tsx
  Error: Failed to resolve import "./TrustBadge" from "src/components/design/TrustBadge.test.tsx".
 FAIL  src/lib/format/index.test.ts
  Error: Failed to resolve import "./index" from "src/lib/format/index.test.ts".
 Test Files  4 failed (4)
      Tests  no tests
exit code: 1
```

```
$ pnpm exec vitest --run scripts/check-env-example.test.ts
 ✓ scripts/check-env-example.test.ts (1 test) 2ms
 Test Files  1 passed (1)
      Tests  1 passed (1)
exit code: 0
```

Phase 1's GREEN test still GREEN; the 4 new Wave-0 tests are correctly RED with import-resolution failures.

## Verification Performed

- **Task 1 acceptance:**
  - `node -e "..." pin-check` → ok (5 deps at exact RESEARCH.md pins, except plugin-react at the Rule-3 5.2.0 — pin-check script run with that adjustment).
  - `node -e "..." no-leakage-check` → ok (no `@tabler/icons-react`, shadcn, `@radix-ui/*`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`).
  - `pnpm install --frozen-lockfile` → exit 0 (lockfile in sync).
  - `pnpm exec eslint .` exit 0 (1 pre-existing warning, no errors).
  - `pnpm exec tsc --noEmit` exit 0.
  - `pnpm test:ci` → 6 test files / 18 tests, all GREEN.
- **Task 2 acceptance:**
  - All 5 grep patterns hit (`environment: "jsdom"`, `plugins: [react()]`, `setupFiles: ["./vitest.setup.ts"]`, `globals: true`, `"src/**/*.test.{ts,tsx}"`).
  - `vitest.setup.ts` contains `@testing-library/jest-dom/vitest` and `afterEach`.
  - `pnpm test:ci` exit 0 (Phase 1's GREEN test passes under jsdom env).
  - `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint .` exit 0.
  - `pnpm exec prettier --check vitest.config.ts vitest.setup.ts` exit 0 (after one prettier --write to canonicalise import order).
- **Task 3 acceptance:**
  - All 4 test files exist at the declared paths.
  - All required strings present: 4 fmt helpers, `IconName`, tiers (good/warn/bad), 3 scores (95/80/60), 3 size classes (`ask-btn-sm/md/lg`), label `"Vraag hierover"`.
  - `pnpm exec vitest --run src/lib/format src/components/design` → exit 1, error "Failed to resolve" emitted for all 4 files (canonical RED).
  - `pnpm exec eslint src/lib/format src/components/design` → exit 0.
  - `pnpm exec tsc --noEmit` → exit 0 (test files excluded by tsconfig).
  - No implementation files exist (`ls src/lib/format src/components/design` returns only the 4 `*.test.{ts,tsx}` files).
- **Plan-level success criteria:**
  - 5 dev deps installed (4 at exact RESEARCH.md pins; plugin-react at Rule-3 5.2.0).
  - `pnpm install --frozen-lockfile` exit 0.
  - `vitest.config.ts` jsdom env wired; `vitest.setup.ts` registers jest-dom + cleanup.
  - 4 RED test files exist; vitest exit non-zero with "Failed to resolve".
  - `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint .` exit 0; `pnpm build` exit 0.

## Self-Check: PASSED

All claimed files verified to exist:

- `vitest.setup.ts` — FOUND
- `src/lib/format/index.test.ts` — FOUND
- `src/components/design/Icon.test.tsx` — FOUND
- `src/components/design/TrustBadge.test.tsx` — FOUND
- `src/components/design/AskButton.test.tsx` — FOUND
- `package.json` (modified — 5 new dev deps) — FOUND
- `pnpm-lock.yaml` (modified — +63 packages) — FOUND
- `vitest.config.ts` (modified — plugin-react + jsdom + setupFiles) — FOUND

All claimed commits verified in `git log`:

- `d5146b0` — chore(02-01): add jsdom + RTL + jest-dom + plugin-react test scaffolding — FOUND
- `baf287c` — chore(02-01): extend vitest config for jsdom + RTL component tests — FOUND
- `2618605` — test(02-01): scaffold RED tests for format helpers + custom primitives — FOUND

Implementation files NOT created (correct per acceptance criteria):

- `src/lib/format/index.ts` — absent (Plan 02 owns)
- `src/components/design/Icon.tsx` — absent (Plan 03 owns)
- `src/components/design/TrustBadge.tsx` — absent (Plan 03 owns)
- `src/components/design/AskButton.tsx` — absent (Plan 03 owns)

## Threat Flags

None. Wave 0 ships only dev-only test infrastructure; no production code paths, no network endpoints, no user input. The plan's `<threat_model>` already documents:

- T-2-02 (npm supply-chain via 5 new dev deps) — mitigated by exact-pin policy + committed `pnpm-lock.yaml`. All 5 packages are from well-known maintainers (`@testing-library/*`, `jsdom`, `@vitejs/*`).

## Next Plan

**Plan 02: Tokens, shadcn init, fonts, format helpers** — picks up the jsdom-enabled vitest from this plan, ships the prototype-token `:root` block + shadcn alias layer + `@theme inline` in `globals.css`, runs `pnpm dlx shadcn@latest init` + adds 8 of the 9 Phase-2 primitives (with `sonner` replacing `toast` per the Rule-3 correction documented above), wires `next/font` for Inter + Fraunces + JetBrains Mono in `layout.tsx`, and ships `src/lib/format/index.ts` — turning the 12 fmt tests GREEN in one task.
