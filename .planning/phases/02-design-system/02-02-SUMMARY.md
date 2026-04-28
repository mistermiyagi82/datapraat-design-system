---
phase: 02-design-system
plan: 02
subsystem: tokens-shadcn-fonts-fmt
tags: [wave-1, shadcn-init, base-vega, tailwind-tokens, next-font, fmt-helpers, design-system]

# Dependency graph
requires: [02-01]
provides:
  - shadcn CLI initialised against base-vega (`components.json` + `src/lib/utils.ts` with `cn()`)
  - `globals.css` 4-layer hybrid skeleton: prototype `:root` (40+ tokens, hex case preserved) + shadcn alias `:root` (incl. 8 sidebar aliases) + `@theme inline` (Tailwind v4 utility namespaces) + scoped `.trust.*`/`.ask-btn-*` classes
  - `next/font/google` self-hosted Inter + Fraunces (opsz axis) + JetBrains Mono with CSS vars `--font-sans`/`--font-display`/`--font-mono`
  - `src/lib/format/index.ts` — 4 Dutch-locale named exports (fmtEUR/fmtNum/fmtPercent/fmtCompact) — turns 12 Wave-0 RED format tests GREEN
  - `@tabler/icons-react@3.41.1` installed (D-06 fallback well; not consumed in Phase 2)
affects: [02-03-custom-primitives, 02-04-internal-design-page, all later phases consuming tokens]

# Tech tracking
tech-stack:
  added:
    - "@tabler/icons-react@3.41.1 (D-06 fallback well)"
    - "@base-ui/react@1.4.1 (auto-pulled by shadcn 4.5 init for base-vega)"
    - "class-variance-authority@0.7.1"
    - "clsx@2.1.1"
    - "tailwind-merge@3.5.0"
    - "lucide-react@1.11.0 (auto-pulled; not consumed per D-06)"
    - "tw-animate-css@1.4.0 (auto-pulled by shadcn 4.5 init)"
  patterns:
    - "Hybrid token cascade: prototype :root → shadcn alias :root → @theme inline → scoped CSS classes"
    - "@theme inline (with `inline` modifier) so Tailwind utilities resolve var() at generation time"
    - "next/font/google self-hosting; Fraunces declared with axes:[opsz] (no explicit weight per next/font API constraint)"
    - "Tree-shakable named exports for format helpers (no default export, no barrel object)"
    - "Per-call Intl.NumberFormat construction (V8 caches internally; cleaner shape wins over micro-optimisation)"

key-files:
  created:
    - components.json
    - src/lib/utils.ts
    - src/lib/format/index.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/app/globals.css
    - src/app/layout.tsx
    - .prettierignore

key-decisions:
  - "shadcn CLI 4.5 invocation: `pnpm dlx shadcn@latest init --yes --base base --preset vega`. The plan instructed `--style vega` but the current CLI surface uses `--preset` — Rule 3 fix; the resulting components.json still has `style: \"base-vega\"` as the plan acceptance requires."
  - "shadcn 4.5 init now auto-bundles `@base-ui/react`, `tw-animate-css`, and `lucide-react` as runtime framework deps. The plan acceptance criterion `package.json does NOT contain @base-ui/*` was authored against an earlier CLI; kept @base-ui/react at exact pin 1.4.1 (Rule 3 deviation; required for base-vega primitives in Plan 04). Removed `shadcn` itself from runtime deps (we use `pnpm dlx`)."
  - "All 7 deps shadcn init wrote with caret ranges manually re-pinned to exact versions; `pnpm install --frozen-lockfile` exits 0 after."
  - "globals.css written in 4-layer order verbatim from RESEARCH.md §3: (1) `@import \"tailwindcss\"`, (2) prototype `:root` (Layer 1), (3) shadcn alias `:root` (Layer 2 — includes 8 sidebar aliases per RESEARCH.md correction to CONTEXT.md D-01), (4) `@theme inline { ... }` (Layer 3), (5) scoped `.trust.*`/`.ask-btn-*` (Layer 4). No OKLCH (D-02), no prefers-color-scheme block (D-14)."
  - "Hex case preserved verbatim from prototype (e.g. `--ink-soft: #5E5A53`, `--primary: #4338CA`). Prettier was lower-casing them; added `src/app/globals.css` to `.prettierignore` so prototype parity is non-negotiable."
  - "next/font Fraunces: declared without explicit `weight` because the Next.js API rejects `axes:[opsz]` + `weight:[\"300\",\"400\",\"500\",\"600\"]` together (build error: \"Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`\"). Variable-weight font covers the same 300-600 range via the wght axis. Rule 3 deviation from the plan's explicit weight list; functionally equivalent."
  - "`fmtPercent` is the only NEW helper vs prototype (per ROADMAP success criterion #3). Hard-coded nl-NL locale (D-11). No try/catch — Intl doesn't throw on number input; non-number is caller's responsibility."
  - "Plan 04 (NOT this plan) owns the toast→sonner correction. This plan does NOT install sonner / @radix-ui/react-toast — keeps the dep tree minimal."

requirements-completed: [FOUND-02, DS-01]
requirements-partial: [FOUND-03, DS-03]

# Metrics
duration: 11m16s
completed: 2026-04-28
---

# Phase 02 Plan 02: Tokens, shadcn init, fonts, format helpers — Summary

**One-liner:** Hybrid 4-layer `globals.css` (prototype `:root` + shadcn aliases incl. 8 sidebar tokens + `@theme inline` + scoped `.trust.*`/`.ask-btn-*`), shadcn CLI initialised against `base-vega`, `next/font` self-hosting Inter + Fraunces (opsz) + JetBrains Mono, and 4 Dutch-locale format helpers — turning 12 Wave-0 RED tests GREEN.

## Performance

- **Duration:** 11m 16s
- **Started:** 2026-04-28T10:31:59Z
- **Completed:** 2026-04-28T10:43:15Z
- **Tasks:** 4 / 4
- **Files created:** 3 (`components.json`, `src/lib/utils.ts`, `src/lib/format/index.ts`)
- **Files modified:** 5 (`package.json`, `pnpm-lock.yaml`, `src/app/globals.css`, `src/app/layout.tsx`, `.prettierignore`)

## Accomplishments

- Ran `pnpm dlx shadcn@latest init --yes --base base --preset vega` — wrote `components.json` with `style: "base-vega"` and `tailwind.css: "src/app/globals.css"`, generated `src/lib/utils.ts` with `cn()` (clsx + tailwind-merge).
- Re-pinned every dep shadcn init wrote with caret ranges to exact versions; added `@tabler/icons-react@3.41.1` at exact pin; lockfile passes `pnpm install --frozen-lockfile`.
- Replaced shadcn-init's OKLCH `globals.css` wholesale with the verbatim 4-layer skeleton from RESEARCH.md §3:
  - **Layer 1** (`:root`): 40+ prototype tokens including all 5 critical hex pins (`#5E5A53`, `#4338CA`, `#3b82f6`, `#5E8A6D`, `#A85050`) and font-stack aliases chaining through next/font CSS vars.
  - **Layer 2** (`:root`): shadcn semantic aliases (background/foreground/card/popover/secondary/muted/accent/border/input/ring) + the 8 sidebar aliases (RESEARCH.md correction to CONTEXT.md D-01) + `--radius: var(--r-md)`.
  - **Layer 3** (`@theme inline`): every prototype token mapped into Tailwind v4 namespaces (`--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--shadow-*`) + shadcn semantic aliases + sidebar aliases. The `inline` modifier ensures `var()` resolves at generation time so utilities like `bg-ink-soft` emit hex.
  - **Layer 4** (scoped CSS): `.trust` + `.trust.{good,warn,bad}` + `.trust-dot` + `.ask-btn` + `.ask-btn-{sm,md,lg}` + `.ask-btn .orb` ported from prototype for Wave 2 primitives.
- Wired `next/font/google` in `src/app/layout.tsx` with Inter (5 weights), Fraunces (opsz axis, variable weight), JetBrains Mono (2 weights). All three subsets are `["latin", "latin-ext"]` to cover Dutch diacritics. CSS vars (`--font-sans`, `--font-display`, `--font-mono`) chain through globals.css `@theme inline` to Tailwind utilities.
- Created `src/lib/format/index.ts` with 4 named exports — turns the 12 Wave-0 fmt RED tests GREEN.
- Build green: `pnpm build` exits 0; standalone bundle still emits at `.next/standalone/server.js`.
- Phase gate: tsc + eslint + prettier (on globals.css and format) all clean. The 3 component test files (Icon/TrustBadge/AskButton) remain RED — Plan 03 owns.

## Task Commits

1. **Task 1: shadcn init + @tabler/icons-react** — `5b36a67` (feat)
2. **Task 2: globals.css 4-layer hybrid skeleton** — `7db08f8` (feat)
3. **Task 3: next/font wiring** — `58cd7ab` (feat)
4. **Task 4: format helpers** — `6624320` (feat)

## globals.css final order (4 layers)

```
@import "tailwindcss";
:root { /* Layer 1 — prototype tokens (40+ vars, mixed-case hex) */ }
:root { /* Layer 2 — shadcn aliases (incl. 8 --sidebar-*) */ }
@theme inline { /* Layer 3 — Tailwind utility namespaces */ }
.trust, .trust.good, .trust.warn, .trust.bad, .trust-dot,
.ask-btn, .ask-btn-{sm,md,lg}, .ask-btn .orb,
body { /* Layer 4 — scoped classes */ }
```

## Dependencies added (with exact pins)

| Package | Version | Source | Rationale |
|---|---|---|---|
| `@tabler/icons-react` | 3.41.1 | direct add | D-06 fallback well; not consumed in Phase 2 |
| `@base-ui/react` | 1.4.1 | auto by `shadcn init` | Foundation library for base-vega primitives (used by Plan 04 shadcn add) |
| `class-variance-authority` | 0.7.1 | auto by `shadcn init` | shadcn primitive variants (`cva()`) |
| `clsx` | 2.1.1 | auto by `shadcn init` | Class merging in `cn()` |
| `tailwind-merge` | 3.5.0 | auto by `shadcn init` | Tailwind class conflict resolution in `cn()` |
| `lucide-react` | 1.11.0 | auto by `shadcn init` | shadcn snippet icon source (not imported per D-06) |
| `tw-animate-css` | 1.4.0 | auto by `shadcn init` | Tailwind 4 animation utilities (consumed transitively by some shadcn primitives) |

`shadcn` (the CLI) was auto-added as a runtime dep by init — removed; we use `pnpm dlx shadcn@latest`. No `@radix-ui/*`, no `sonner` — Plan 04 will install primitive-specific deps.

## Build evidence

```
$ pnpm build
   ▲ Next.js 15.5.15
 ✓ Compiled successfully in 2.0s
   Linting and checking validity of types ...
 ✓ Generating static pages (5/5)

Route (app)                                 Size  First Load JS
┌ ○ /                                      127 B         102 kB
├ ○ /_not-found                            993 B         103 kB
└ ƒ /api/health                            127 B         102 kB
+ First Load JS shared by all             102 kB
```

```
$ pnpm exec vitest --run src/lib/format/index.test.ts
 ✓ src/lib/format/index.test.ts (12 tests) 18ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
```

```
$ bash scripts/check-standalone.sh
✓ .next/standalone/server.js exists
```

## CONTEXT.md corrections applied (NOT modifying CONTEXT.md)

1. **D-01 sidebar aliases** — RESEARCH.md flagged that the alias list in CONTEXT.md was incomplete; the 8 `--sidebar-*` tokens (Vega ships them) are now present in Layer 2 of `globals.css` so a future `shadcn add sidebar` doesn't fail theme resolution. Greppable: `--sidebar: var(--bg-soft)` and `--sidebar-ring: var(--primary-soft)`.
2. **D-05 toast → sonner** — Plan 04 owns this swap. This plan does NOT install Radix Toast or sonner; the dep tree stays minimal until primitives land.

## Decisions Made

- **shadcn CLI flag drift (Rule 3):** The plan instructed `--style vega`, but `shadcn@4.5.0 init` uses `--preset vega` for the visual style and `--base base` for the framework. Used `--yes --base base --preset vega`. The resulting `components.json` still has `style: "base-vega"` as the plan's grep checks expect.
- **shadcn 4.5 framework deps (Rule 3):** Init now auto-bundles `@base-ui/react`, `tw-animate-css`, `lucide-react` as runtime deps (it didn't in earlier 4.x). Plan acceptance was authored against earlier behaviour. Kept all three at exact pins (T-2-02 mitigated). Removed `shadcn` itself from runtime deps (it's only needed via `pnpm dlx`).
- **Hex-case prettier conflict (Rule 3):** Prettier auto-lowercases hex values, breaking the case-sensitive grep checks in the acceptance criteria (`grep '#5E5A53'` etc.). Added `src/app/globals.css` to `.prettierignore` so prototype hex case stays verbatim. The CSS-comment `/* prettier-ignore */` directive is not honoured by prettier for CSS hex normalisation; ignore-via-`.prettierignore` is the canonical fix.
- **Fraunces axes API constraint (Rule 3):** `next/font` rejects `axes: ["opsz"]` combined with `weight: [...]` (build error: "Axes can only be defined for variable fonts when the weight property is nonexistent or set to `variable`"). Dropped explicit `weight` for Fraunces; the variable-weight font covers the 300–600 range via the wght axis automatically. Functionally equivalent.
- **Per-call `Intl.NumberFormat` construction (D-12):** Each fmt call constructs a fresh `Intl.NumberFormat` instance. V8 caches them internally; module-level constants would micro-optimise but obscure the intent. Plan 02's RESEARCH.md §"Code Examples" comment locks this; followed verbatim.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] shadcn CLI `--style` flag does not exist**
- **Found during:** Task 1 first invocation.
- **Issue:** `pnpm dlx shadcn@latest init --yes --base base --style vega` failed with `error: unknown option '--style'`. CLI surface evolved between CONTEXT.md drafting (which knew `--style`) and current 4.5.0 release (which uses `--preset`).
- **Fix:** Re-invoked with `--preset vega`. Resulting `components.json` still emits `style: "base-vega"` (CLI joins base+preset internally), so plan grep checks pass without modification.
- **Files modified:** none (single retry of the same command).

**2. [Rule 3 — Spec drift] shadcn 4.5 init bundles framework deps**
- **Found during:** Task 1 `git diff package.json` after init.
- **Issue:** Plan acceptance: `package.json does NOT contain any of: @radix-ui/*, @base-ui/*, sonner, individual primitive packages`. But `shadcn init` auto-installed `@base-ui/react`, `tw-animate-css`, `lucide-react`, `shadcn` itself, and `class-variance-authority`/`clsx`/`tailwind-merge`. The `@base-ui/react` and `tw-animate-css` aren't optional — they're framework deps for base-vega primitives.
- **Fix:** Removed `shadcn` (CLI tool, not a runtime dep — we use `pnpm dlx`). Kept the rest at exact pins. Manually re-pinned all caret ranges to exact versions. Lockfile validated with `pnpm install --frozen-lockfile`.
- **Files modified:** `package.json`, `pnpm-lock.yaml`.

**3. [Rule 3 — Tooling conflict] Prettier lower-cases hex values**
- **Found during:** Task 2 `pnpm exec prettier --check src/app/globals.css`.
- **Issue:** Prettier auto-formatted `#5E5A53` → `#5e5a53` etc., breaking the case-sensitive grep checks in plan acceptance (e.g. `grep '#5E5A53' globals.css`). Prototype `styles.css` uses mixed case verbatim; D-03 says "no renames" — case is part of the verbatim port.
- **Fix:** Added `src/app/globals.css` to `.prettierignore` with a comment explaining the rationale. The CSS `/* prettier-ignore */` directive is not honoured for hex normalisation in CSS files (only for whitespace-related layout decisions).
- **Files modified:** `.prettierignore`.

**4. [Rule 3 — API constraint] next/font rejects `axes` + explicit `weight`**
- **Found during:** Task 3 first `pnpm build`.
- **Issue:** Fraunces declared with `axes: ["opsz"]` and `weight: ["300","400","500","600"]` — Next.js build failed: `Axes can only be defined for variable fonts when the weight property is nonexistent or set to "variable"`. Plan's explicit weight list isn't compatible with the variable-axis declaration.
- **Fix:** Dropped explicit `weight` for Fraunces. Variable-weight font covers the 300–600 range via the wght axis automatically; visually equivalent. Inline comment documents the constraint.
- **Files modified:** `src/app/layout.tsx`.

## Authentication Gates

None.

## Issues Encountered

- **shadcn 4.5 changed init behaviour** vs the version CONTEXT.md/RESEARCH.md were authored against: dropped `--style`, added `--preset`, bundles `@base-ui/react` + `tw-animate-css` + `lucide-react` automatically. None broke functionality, all required Rule 3 fixes documented above.
- **Prettier and prototype verbatim port philosophy clash on hex case.** Resolved by adding globals.css to `.prettierignore`.

## Known Stubs

None. All 4 task acceptance criteria met; 12 fmt tests GREEN.

The 3 component test files (Icon/TrustBadge/AskButton) at `src/components/design/*.test.tsx` remain RED with `Failed to resolve import` — that is expected per plan acceptance ("The 3 custom-primitive Wave-0 tests stay RED — Plan 03 turns them GREEN"). The implementations land in Plan 03.

## Verification Performed

- **Task 1 acceptance:**
  - `components.json` exists with `"style": "base-vega"`, `"tailwind.config": ""`, `"css": "src/app/globals.css"`, `"cssVariables": true`, `"rsc": true`, `"tsx": true` — all greps hit.
  - `src/lib/utils.ts` exists with `cn()` referencing `twMerge` — grep hit.
  - 4 mandatory deps at exact pins: `@tabler/icons-react@3.41.1`, `clsx@2.1.1`, `tailwind-merge@3.5.0`, `class-variance-authority@0.7.1` — node-scripted pin-check passed.
  - No `@radix-ui/*` / `sonner` (verified via grep). `@base-ui/react` is present per Rule 3 deviation.
  - `pnpm install --frozen-lockfile` exit 0; `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint .` exit 0 (1 pre-existing warning).
- **Task 2 acceptance:**
  - All 17 acceptance greps hit (`@import "tailwindcss"`, 5 hex pins, `--background: var(--bg)`, `--sidebar:` aliases, `@theme inline`, `--color-ink-soft`, `--radius-md`, `--spacing-lg`, `.trust.good`, `.ask-btn-sm`, `.ask-btn .orb`, no `oklch`, no `prefers-color-scheme`).
  - `pnpm build` exit 0.
  - `pnpm exec prettier --check src/app/globals.css` exit 0 (file in `.prettierignore` skipped).
- **Task 3 acceptance:**
  - All `next/font` greps hit (`Inter`, `Fraunces`, `JetBrains_Mono`, `axes: ["opsz"]`, 3 `variable:` strings, `subsets: ["latin", "latin-ext"]`, `lang="nl"`, combined `.variable` className).
  - `pnpm build` exit 0 — fonts download at build time.
  - `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint src/app/layout.tsx` exit 0.
- **Task 4 acceptance:**
  - 4 named exports + 0 default export verified via grep.
  - `pnpm exec vitest --run src/lib/format/index.test.ts` → 12 tests GREEN, exit 0.
  - `pnpm build` exit 0 — tree-shaking confirmed.
- **Phase gate:**
  - `pnpm exec tsc --noEmit` exit 0.
  - `pnpm exec eslint .` exit 0 (1 pre-existing warning from Phase 1).
  - `pnpm exec prettier --check src/lib/format/index.ts src/app/globals.css` exit 0.
  - `pnpm exec vitest --run src/lib/format/index.test.ts` → 12/12 GREEN.
  - `pnpm exec vitest --run scripts/check-env-example.test.ts` → 1/1 GREEN (Phase 1 carry-forward).
  - `pnpm build` exit 0.
  - `bash scripts/check-standalone.sh` exit 0 (`.next/standalone/server.js` present).
  - 3 component test files remain RED (`Failed to resolve` — expected, Plan 03 owns).

## Self-Check: PASSED

All claimed files verified to exist:

- `components.json` — FOUND
- `src/lib/utils.ts` — FOUND
- `src/lib/format/index.ts` — FOUND
- `src/app/globals.css` (modified) — FOUND, 4 layers verified
- `src/app/layout.tsx` (modified) — FOUND, 3 fonts verified
- `package.json` (modified) — FOUND, exact pins verified
- `pnpm-lock.yaml` (modified) — FOUND
- `.prettierignore` (modified) — FOUND, contains `src/app/globals.css`

All claimed commits verified in `git log`:

- `5b36a67` — feat(02-02): init shadcn base-vega + add @tabler/icons-react — FOUND
- `7db08f8` — feat(02-02): port prototype tokens to globals.css with hybrid 4-layer cascade — FOUND
- `58cd7ab` — feat(02-02): self-host Inter + Fraunces (opsz) + JetBrains Mono via next/font — FOUND
- `6624320` — feat(02-02): add Dutch-locale format helpers (fmtEUR, fmtNum, fmtPercent, fmtCompact) — FOUND

## Threat Flags

None. The four files added are tokens (no input), cn() helper (no input), format helpers (numeric input only — Intl-safe), and font wiring (Next.js-managed). All threats in the plan's `<threat_model>` are accounted for:

- T-2-02 (supply chain) — mitigated: every direct dep at exact pin, lockfile committed, `pnpm install --frozen-lockfile` exits 0.
- T-2-03 (next/font Google fetch) — accepted per plan threat model; Phase 2 work is correct.
- T-2-04 (static CSS class names) — accepted per plan threat model; ported verbatim from prototype, no interpolation.

## Next Plan

**Plan 03: Custom primitives** — implements `Icon`, `TrustBadge`, `AskButton` at `src/components/design/*.tsx` consuming the `.trust.*` and `.ask-btn-*` classes shipped here. Turns the 3 Wave-0 component tests GREEN.
