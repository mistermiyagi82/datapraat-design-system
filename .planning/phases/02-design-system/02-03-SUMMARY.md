---
phase: 02-design-system
plan: 03
subsystem: custom-primitives
tags: [wave-2, icon, trust-badge, ask-button, verbatim-port, design-system, dutch-voice]

# Dependency graph
requires: [02-01, 02-02]
provides:
  - "Icon primitive at src/components/design/Icon.tsx — 24 SVG icons + IconName literal union (compile-time autocomplete)"
  - "TrustBadge primitive at src/components/design/TrustBadge.tsx — tier formula >=90/>=70/else → good/warn/bad"
  - "AskButton primitive at src/components/design/AskButton.tsx — orb-pill, sizes sm/md/lg, default Dutch label 'Vraag hierover'"
  - "Barrel at src/components/design/index.ts — single import seam for callers"
  - "Wave-0 RED component tests (Icon/TrustBadge/AskButton — 15 cases) all GREEN"
affects: [02-04-internal-design-page, 04-chat-backbone, 06-overzicht-live-vvd]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Record<IconName, JSX.Element> for the icon paths map — Record + literal union forces tsc exhaustiveness"
    - "Pure tierFor() helper extracted from inline ternary for testability"
    - "explicit type=\"button\" on AskButton (Rule-3 fix — prototype omitted, defaulting to submit when nested in <form>)"
    - "stopPropagation BEFORE onClick (matches prototype semantics) — verified via parent-spy test pattern"
    - "role=\"button\" only when onClick present (a11y nicety beyond prototype)"

key-files:
  created:
    - src/components/design/Icon.tsx
    - src/components/design/TrustBadge.tsx
    - src/components/design/AskButton.tsx
    - src/components/design/index.ts
  modified: []

key-decisions:
  - "Icon paths verbatim from shared.jsx:6-31 — no SVG optimisation, no path deduplication. D-07 visual-fidelity contract."
  - "Icon uses Record<IconName, JSX.Element> (not { [k:string]: JSX.Element }) so TS strict reports any missing key at compile time. Eliminates the runtime `paths[name] || null` fallback the prototype needed."
  - "Icon spreads ...rest from Omit<SVGProps<SVGSVGElement>, 'children'> so callers can pass className/aria-hidden/data-* without re-typing."
  - "TrustBadge tier thresholds (90/70) hard-coded per D-08 — product semantics, not styling. tierFor() pure helper for unit-testability."
  - "TrustBadge adds role='button' when onClick is provided (a11y nicety beyond prototype). data-size attribute hooks future size variants without churning the className shape."
  - "AskButton type=\"button\" added explicitly (Rule-3 vs prototype) — prevents accidental form submission. The prototype pattern in shared.jsx:52 omits `type` and inherits the HTML default of `submit`."
  - "AskButton className composition: `${className}` appended AFTER `ask-btn-${size}` so user-passed classes override; .trim() collapses double space when no extra className."
  - "Barrel re-exports the runtime function AND its types via TS 5+ inline `type` modifier — single import line for any combination."
  - "Prettier alphabetised the 3 barrel export lines on save (AskButton, Icon, TrustBadge) — accepted; the functional shape (3 lines, no placeholders) is unchanged and the acceptance grep checks still hit."

requirements-completed: [DS-03]

# Metrics
duration: 3m30s
completed: 2026-04-28
---

# Phase 02 Plan 03: Custom Primitives Summary

**One-liner:** Verbatim TS ports of the prototype's three custom primitives — Icon (24 SVG paths + literal IconName union), TrustBadge (tier 90/70/else), AskButton (orb-pill, 3 sizes, default Dutch label "Vraag hierover") — plus a 3-line barrel. The 3 Wave-0 RED component tests turn GREEN; full phase gate green.

## Performance

- **Duration:** 3m 30s
- **Started:** 2026-04-28T10:50:22Z
- **Completed:** 2026-04-28T10:53:52Z
- **Tasks:** 3 / 3
- **Files created:** 4 (Icon.tsx, TrustBadge.tsx, AskButton.tsx, index.ts)
- **Files modified:** 0

## Accomplishments

- Shipped **`src/components/design/Icon.tsx`** — verbatim TS port of `shared.jsx:Icon` (lines 5–37). 24-name `IconName` literal union exported alongside the component. `Record<IconName, JSX.Element>` paths map forces tsc to verify every key is present (compile-time exhaustiveness — eliminates the prototype's runtime `|| null` fallback). SVG attrs identical to prototype: `viewBox="0 0 16 16"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`. `IconProps extends Omit<SVGProps<SVGSVGElement>, "children">` so callers can pass `className`, `aria-hidden`, `data-*` without re-typing. Default `size = 16`.
- Shipped **`src/components/design/TrustBadge.tsx`** — verbatim TS port of `shared.jsx:TrustBadge` (lines 40–47). Tier formula `score >= 90 → "good"` / `>= 70 → "warn"` / else `"bad"` extracted as a pure `tierFor()` helper. `e.stopPropagation()` runs **before** `onClick?.()` (matches prototype). `role="button"` only when `onClick` is provided (a11y nicety beyond prototype). `data-size={size}` hook future-proofs size variants. Consumes `.trust`, `.trust.good/warn/bad`, `.trust-dot` classes from globals.css Layer 4 (shipped Plan 02-02).
- Shipped **`src/components/design/AskButton.tsx`** — verbatim TS port of `shared.jsx:AskButton` (lines 51–59). Default Dutch label `"Vraag hierover"` (D-09). Sizes `sm | md | lg` map to `.ask-btn-sm/md/lg` classes. **Rule-3 fix vs prototype:** explicit `type="button"` prevents accidental form submission when nested in `<form>` — the prototype omitted `type` and inherited the HTML submit default (logged below). `e.stopPropagation()` runs before `onClick?.(e)`. Decorative `<span className="orb" aria-hidden="true" />` matches prototype. Consumes `.ask-btn`, `.ask-btn-sm/md/lg`, `.ask-btn .orb`, `.ask-btn-label` classes from globals.css Layer 4.
- Shipped **`src/components/design/index.ts`** — 3-line barrel re-exporting `Icon` + `IconName` + `IconProps`, `TrustBadge` + `TrustBadgeProps`, `AskButton` + `AskButtonProps`. Single import seam for Phases 4–7. No placeholders for future primitives (D-10 + CLAUDE.md "no empty stubs"). Prettier alphabetised the export order on save; functional shape unchanged.
- **3 Wave-0 RED → GREEN flips** confirmed: `Icon.test.tsx` (3 cases), `TrustBadge.test.tsx` (5 cases), `AskButton.test.tsx` (7 cases) — 15 component tests all GREEN.
- **Full phase gate green:** `pnpm exec tsc --noEmit` exit 0 · `pnpm exec eslint .` exit 0 (1 pre-existing Phase-1 warning) · `pnpm exec prettier --check src/components/design` exit 0 · `pnpm test:ci` 10 files / 45 tests all GREEN · `pnpm build` exit 0 · `bash scripts/check-standalone.sh` exit 0.

## Task Commits

Each task committed atomically:

1. **Task 1: Implement Icon.tsx (24 SVG paths + IconName union)** — `f17c4bf` (feat)
2. **Task 2: Implement TrustBadge.tsx + AskButton.tsx (verbatim ports)** — `5fcbce4` (feat)
3. **Task 3: Create barrel index.ts and run full Wave-2 verification** — `dbc3217` (feat)

## Files Created

- `src/components/design/Icon.tsx` — 201 lines. 24-name `IconName` union, `Record<IconName, JSX.Element>` paths map, `IconProps extends Omit<SVGProps<SVGSVGElement>, "children">`, default size 16, viewBox 16x16, stroke currentColor 1.5.
- `src/components/design/TrustBadge.tsx` — 39 lines. `tierFor(score: number): Tier` pure helper, `TrustBadgeProps`, `TrustBadge` function, className `trust ${tier}`, `data-size`, `role="button"` when onClick, stopPropagation.
- `src/components/design/AskButton.tsx` — 32 lines. `AskButtonProps`, `AskButton` function, `type="button"` (Rule-3), default label `"Vraag hierover"`, default size `"md"`, className `ask-btn ask-btn-${size} ${className}`, decorative orb with `aria-hidden="true"`, stopPropagation, MouseEvent passed through to caller.
- `src/components/design/index.ts` — 3 lines. Re-exports Icon/TrustBadge/AskButton + their types via TS inline `type` modifier.

## Verbatim port confirmation

The 3 primitives are verbatim TS ports of `shared.jsx:5-59` with one explicit deviation:

| Aspect | Prototype (`shared.jsx`) | Plan 03 port | Diff |
|---|---|---|---|
| Icon — 24 SVG paths | object literal `paths` (lines 6-31) | `Record<IconName, JSX.Element>` map | type-only; values copied char-for-char |
| Icon — `paths[name] \|\| null` runtime fallback | line 34 | dropped | TS Record<IconName,...> + literal union prevents the bug at compile time |
| Icon — props | `{ name, size = 16 }` | `IconProps extends Omit<SVGProps<SVGSVGElement>, "children">` with `name: IconName; size?: number` | typed; spreads `...rest` for caller-passed `className`/`aria-*`/`data-*` |
| TrustBadge — tier inline ternary | line 41 `score >= 90 ? "good" : score >= 70 ? "warn" : "bad"` | `tierFor(score: number): Tier` pure helper | refactor only; identical thresholds |
| TrustBadge — role | none | `role={onClick ? "button" : undefined}` | a11y nicety beyond prototype |
| TrustBadge — data-size | none | `data-size={size}` | hook for future size variants without className churn |
| AskButton — `type` attr | omitted (defaults to `"submit"` when in `<form>`) | **`type="button"`** | **Rule-3 correctness fix — see Deviations §1** |
| AskButton — `aria-hidden` on orb | none | `aria-hidden="true"` | a11y nicety beyond prototype (orb is decorative) |
| AskButton — className join | `\`ask-btn ask-btn-${size} ${className}\`` | same wrapped in `.trim()` | collapses double space when no extra className |

Otherwise identical: same 24 icon names, same tier thresholds, same default labels, same stopPropagation-before-onClick pattern, same className shape consumed by the same globals.css Layer-4 classes from Plan 02-02.

## Wave-0 RED → GREEN evidence

```
$ pnpm exec vitest --run src/components/design
 ✓ src/components/design/Icon.test.tsx (3 tests) 34ms
 ✓ src/components/design/TrustBadge.test.tsx (5 tests) 89ms
 ✓ src/components/design/AskButton.test.tsx (7 tests) 111ms

 Test Files  3 passed (3)
      Tests  15 passed (15)
```

```
$ pnpm test:ci
 ✓ src/lib/format/index.test.ts (12 tests)
 ✓ src/components/design/Icon.test.tsx (3 tests)
 ✓ src/components/design/TrustBadge.test.tsx (5 tests)
 ✓ src/components/design/AskButton.test.tsx (7 tests)
 ✓ src/lib/storage/sqlite/migrate.test.ts (3 tests)
 ✓ scripts/check-env-example.test.ts (1 test)
 [+ 4 more Phase-1 GREEN test files]

 Test Files  10 passed (10)
      Tests  45 passed (45)
```

```
$ pnpm build
 ✓ Compiled successfully in 1358ms
 ✓ Generating static pages (5/5)
Route (app)                                 Size  First Load JS
┌ ○ /                                      127 B         102 kB
├ ○ /_not-found                            993 B         103 kB
└ ƒ /api/health                            127 B         102 kB
```

```
$ bash scripts/check-standalone.sh
✓ .next/standalone/server.js exists
```

## Decisions Made

- **`Record<IconName, JSX.Element>` over `Partial<Record<...>>` or `{[k: string]: ...}`:** Record + literal-union is the only shape that fails `tsc --noEmit` if a key is missing. This compile-time guarantee replaces the prototype's runtime `paths[name] || null` fallback — strictly stronger correctness.
- **`tierFor()` extracted as a pure helper:** trivially testable in isolation if we ever want unit-test parity at the helper level (current tests cover via integration on `<TrustBadge />`); reads better than the inline ternary; zero runtime cost.
- **`role="button"` only when `onClick` is present on TrustBadge:** without `onClick`, the badge is decorative — adding `role="button"` to a non-interactive element is an a11y anti-pattern. Conditional role is the canonical fix.
- **`data-size` attribute on TrustBadge:** hook for the future when v1 grows beyond `"sm"`. Hooks into CSS via `[data-size="..."]` selectors without churning the existing `trust ${tier}` className shape.
- **AskButton accepts `MouseEvent` and forwards `(e)`:** matches prototype line 54 (`onClick?.(e)`). The prototype's onClick consumers use the event for things like targeting `e.currentTarget` for popover anchoring; preserving the signature keeps that path working when Phases 4-7 wire consumers.
- **`<span className="orb" aria-hidden="true" />`:** the orb is a CSS-painted gradient sphere — it conveys nothing semantically; `aria-hidden` keeps it out of the AX tree. Visual fidelity preserved (CSS unchanged from Plan 02-02 Layer 4).
- **Barrel sorted alphabetically by prettier:** the 3 export lines now read `AskButton, Icon, TrustBadge`. Functional shape unchanged: 3 lines, no placeholders, all acceptance greps hit. Accepted as-is rather than fighting prettier with a `// prettier-ignore`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Correctness fix] AskButton missing explicit `type="button"`**

- **Found during:** Task 2 implementation (port from `shared.jsx:51-59`).
- **Issue:** The prototype's `AskButton` is `<button className=...>` with no `type` attribute. HTML's default for `<button>` inside `<form>` is `type="submit"`. When Phase 4 (Chat) or Phase 6 (Overzicht) drops an `AskButton` inside any future form (filter form, prompt form, scenario save form) the click would submit the surrounding form and reload the page.
- **Fix:** Added explicit `type="button"` in `AskButton.tsx`. Greppable: `type="button"` literal at line 22.
- **Files modified:** `src/components/design/AskButton.tsx` (new file — fix landed at file creation).
- **Commit:** `5fcbce4`.
- **Plan acknowledgement:** The plan body itself flagged this as a Rule-3 correctness fix to be applied; this SUMMARY records it as the explicit deviation per the plan's `<output>` instructions.

**2. [Cosmetic] Prettier alphabetised barrel export order**

- **Found during:** Task 3 `pnpm exec prettier --write src/components/design/index.ts`.
- **Issue:** I authored the barrel as `Icon, TrustBadge, AskButton` (component-order); prettier resorted to `AskButton, Icon, TrustBadge` (alphabetical) on save.
- **Fix:** Accepted prettier's output. The acceptance criteria require each export line to be greppable individually (`grep -q 'export { Icon, type IconName ...'` etc.) — each grep still hits regardless of line order. Functional shape (3 lines, types + runtime, no placeholders) unchanged.
- **Files modified:** `src/components/design/index.ts`.
- **Commit:** `dbc3217`.

## Authentication Gates

None.

## Issues Encountered

None beyond the 2 deviations above. The 3 Wave-0 RED tests turned GREEN on first run after each implementation file landed (no debug-iterate cycle on the GREEN step).

## Known Stubs

None. All 4 files ship complete implementations. The 3 primitives are consumed by the existing tests and will be consumed by Plan 02-04's `/internal/design` page (next plan) plus Phases 4–7 downstream.

## CLAUDE.md compliance

- **Tech stack discipline:** No new direct deps added. Only React + TypeScript stdlib types (`SVGProps`, `MouseEvent`, `JSX`).
- **Dutch UI / English framework:** Default label `"Vraag hierover"` is Dutch (D-09). All identifiers, types, comments are English (matches Phase 1 + Phase 2-01/02 convention).
- **CONVENTIONS.md naming:** Component files `PascalCase.tsx` (Icon.tsx, TrustBadge.tsx, AskButton.tsx); types in `PascalCase` (`IconName`, `TrustBadgeProps`); tier helper `camelCase` (`tierFor`).
- **No empty stubs:** Barrel exports exactly the 3 primitives that ship in this plan — no placeholders for "future primitives".
- **No `as any` / `@ts-ignore` / `@ts-expect-error`:** verified across all 4 files.

## Verification Performed

- **Task 1 acceptance:**
  - `src/components/design/Icon.tsx` exists.
  - All required exports present: `export type IconName`, `export interface IconProps`, `export function Icon`.
  - All 24 names from D-07 appear as `paths` keys (verified by inspection of the Record<IconName, JSX.Element> literal — TS exhaustiveness would fail tsc otherwise).
  - SVG attrs `viewBox="0 0 16 16"`, `stroke="currentColor"`, `strokeWidth="1.5"` all present.
  - No `lucide-react` / `@tabler/icons-react` import.
  - No `as any`, `@ts-ignore`, `@ts-expect-error`.
  - `pnpm exec tsc --noEmit` exit 0 → Record<IconName,...> exhaustiveness verified at compile time.
  - `pnpm exec vitest --run src/components/design/Icon.test.tsx` → 3 tests GREEN.
  - `pnpm exec eslint src/components/design/Icon.tsx` exit 0.
  - `pnpm exec prettier --check src/components/design/Icon.tsx` exit 0.
- **Task 2 acceptance:**
  - Both files exist.
  - TrustBadge: `export interface TrustBadgeProps`, `export function TrustBadge`, `score >= 90`, `score >= 70`, `e.stopPropagation()` all present.
  - AskButton: `export interface AskButtonProps`, `export function AskButton`, `"Vraag hierover"`, `type="button"`, `ask-btn ask-btn-`, `e.stopPropagation()` all present.
  - No `@/components/ui/button` / `lucide-react` imports.
  - No `as any`, `@ts-ignore`, `@ts-expect-error`.
  - `pnpm exec tsc --noEmit` exit 0.
  - `pnpm exec vitest --run src/components/design/TrustBadge.test.tsx src/components/design/AskButton.test.tsx` → 5 + 7 = 12 tests GREEN.
  - `pnpm exec eslint src/components/design` exit 0.
  - `pnpm exec prettier --check src/components/design` exit 0 (after one prettier --write on TrustBadge for canonical formatting).
- **Task 3 acceptance:**
  - `src/components/design/index.ts` exists with 3 export lines (alphabetical post-prettier).
  - Each acceptance grep hits: `Icon, type IconName, type IconProps`, `TrustBadge, type TrustBadgeProps`, `AskButton, type AskButtonProps`.
  - File length 3 lines (≤ 5).
  - No placeholders, no future-primitive stubs.
  - `pnpm exec tsc --noEmit` exit 0 → barrel re-exports type-resolve.
  - `pnpm exec vitest --run src/components/design` → 3 test files / 15 tests GREEN.
  - `pnpm test:ci` → 10 test files / 45 tests GREEN (all phases combined).
  - `pnpm exec eslint .` exit 0 (1 pre-existing Phase-1 warning).
  - `pnpm build` exit 0; standalone `.next/standalone/server.js` present.
  - `bash scripts/check-standalone.sh` exit 0.

## Self-Check: PASSED

All claimed files verified to exist:

- `src/components/design/Icon.tsx` — FOUND
- `src/components/design/TrustBadge.tsx` — FOUND
- `src/components/design/AskButton.tsx` — FOUND
- `src/components/design/index.ts` — FOUND

All claimed commits verified in `git log`:

- `f17c4bf` — feat(02-03): port Icon primitive (24 SVG icons + IconName union) — FOUND
- `5fcbce4` — feat(02-03): port TrustBadge + AskButton primitives (orb-pill + tier formula) — FOUND
- `dbc3217` — feat(02-03): add design barrel + green Wave-0 component tests — FOUND

## Threat Flags

None. Plan-level `<threat_model>` already accounts for the only relevant boundaries:

- T-2-04 (className composition) — mitigated: `size` typed `"sm" | "md" | "lg"` (TS strict prevents arbitrary string injection); user-passed `className` rendered as static CSS classes (React JSX escapes attribute values, no innerHTML).
- T-2-05 (TrustBadge score disclosure) — accepted: numeric scores carry no PII; React text rendering auto-escapes.

No new surface introduced. The 3 primitives are pure presentational components — no network calls, no storage, no auth, no parsing of user input.

## Next Plan

**Plan 02-04: `/internal/design` living-reference page + remaining shadcn primitives** — runs `pnpm dlx shadcn@latest add` for the 9 base-vega primitives (with `sonner` replacing `toast` per the Plan 02-01 RESEARCH.md correction), mounts the Sonner Toaster in `src/app/layout.tsx`, builds the `/internal/design` server-component page consuming everything from this plan + Plan 02-02 (tokens/colors swatches, typography samples, Icon grid + 3 TrustBadge tiers + 3 AskButton sizes, shadcn primitives showcase, fmt helpers table), and ships the side-by-side QA reference for prototype parity. DS-04 closes after that plan ships; DS-03 closes here.
