# Phase 2: Design System - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

DataPraat's visual language is encoded as Tailwind 4 `@theme` tokens, shadcn 4 `base-vega` primitives, three custom DataPraat primitives (`Icon`, `TrustBadge`, `AskButton`), Dutch-locale formatters (`fmtEUR`, `fmtNum`, `fmtPercent`, `fmtCompact`), and a `/internal/design` living-reference page. Every later phase consumes these primitives instead of hand-rolling styles.

Requirements covered: FOUND-02, FOUND-03, DS-01, DS-02, DS-03, DS-04.

</domain>

<decisions>
## Implementation Decisions

### Token architecture
- **D-01:** **Hybrid token system: prototype tokens stay as the source of truth, shadcn names alias to them.**
  - `src/app/globals.css` keeps a `:root` block that ports the prototype `styles.css` `:root` verbatim — same names (`--bg`, `--bg-soft`, `--surface`, `--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint`, `--line`, `--line-soft`, `--line-strong`, `--primary`, `--primary-soft`, `--primary-tint`, `--primary-ink`, `--primary-foreground`, `--chart-cost`, `--chart-volume`, `--chart-price`, `--chart-1..5`, `--gold`, `--gold-tint`, `--success`, `--success-tint`, `--success-strong`, `--warning`, `--warning-tint`, `--warning-strong`, `--destructive`, `--destructive-tint`, `--destructive-strong`, `--r-sm/md/lg/xl`, `--s-xs/sm/md/lg/xl/2xl`, `--shadow-sm/md/lg/drawer`).
  - On top of that, a thin **shadcn alias layer** maps shadcn's expected CSS variable names to prototype tokens so `pnpm dlx shadcn@latest add button` produces themed components without re-styling: `--background: var(--bg)`, `--foreground: var(--ink)`, `--card: var(--surface)`, `--card-foreground: var(--ink)`, `--popover: var(--surface)`, `--popover-foreground: var(--ink)`, `--primary: var(--primary)` (already matches), `--primary-foreground: var(--primary-foreground)` (already matches), `--secondary: var(--bg-soft)`, `--secondary-foreground: var(--ink)`, `--muted: var(--bg-soft)`, `--muted-foreground: var(--ink-mute)`, `--accent: var(--primary-tint)`, `--accent-foreground: var(--primary-ink)`, `--destructive: var(--destructive)`, `--destructive-foreground: var(--destructive-strong)`, `--border: var(--line)`, `--input: var(--line-strong)`, `--ring: var(--primary-soft)`, `--radius: var(--r-md)`. Researcher confirms the canonical shadcn v4 / base-vega variable list — fill any missing aliases.
  - Tailwind 4 `@theme {}` block exposes prototype tokens as Tailwind utility classes via the `--color-*`, `--radius-*`, `--spacing-*`, `--font-*` namespaces. Example: `--color-ink: var(--ink); --color-ink-soft: var(--ink-soft); --color-chart-cost: var(--chart-cost); --radius-md: var(--r-md);`. Researcher proposes the full `@theme` mapping; planner finalises.
  - **Why hybrid:** prototype names stay readable in DataPraat-authored code (`bg-ink-soft`, `border-line`); shadcn primitives just work because they see the names they expect; CSS variables compose cleanly so a future Postgres-style theme override (e.g. customer branding) is one `<div style="--primary: ...">` away.

- **D-02:** **Color values stay in hex (matches prototype) — not OKLCH.** Tailwind v4 defaults its built-in palette to OKLCH, but our tokens are authored in hex in `styles.css` and the prototype renders identically across browsers today. Re-encoding to OKLCH is wasted churn and risks visual drift on the side-by-side comparison. If we ever need P3-wide-gamut, we can convert in a later phase.

- **D-03:** **No CSS-var renames during the port.** Every prototype token name carries forward unchanged. This means future cross-references between the prototype HTML/JSX (kept as reference per CLAUDE.md) and the new app stay one-to-one, and any token-rename refactor can be scheduled deliberately rather than being a side effect of Phase 2.

### shadcn install strategy
- **D-04:** **`pnpm dlx shadcn@latest init` with `base-vega` style, Tailwind 4 mode, install destination `src/components/ui/`.** `components.json` is committed and editable; the shadcn CLI is the canonical way to add new primitives in this and later phases. Use the v4 init flow (no `tailwind.config.js`) — config lives in `globals.css` `@theme` and `components.json`.
- **D-05:** **Phase 2 installs exactly the 9 core primitives**: `button card input dialog dropdown-menu tabs tooltip toast separator` (matches ROADMAP success criterion #2). Other shadcn primitives (form, table, command, sheet, popover, etc.) land in the phase that first needs them — no pre-installation.
- **D-06:** **Tabler Icons `@tabler/icons-react` is installed but NOT used in Phase 2's custom Icon component.** It's a fallback well for later phases that need generic icons we didn't port from the prototype. The prototype's 25 hand-authored 16x16 stroke icons cover everything Phase 2 ships.

### Custom primitives (`src/components/design/`)
- **D-07:** **`Icon` component is a verbatim port** of `shared.jsx:Icon` to TypeScript at `src/components/design/Icon.tsx`. The `paths` lookup map carries the same 25 names: `overzicht, prognose, validatie, benchmark, verwijzers, lineage, glossary, regels, plus, chevron, close, send, search, info, arrow, back, sparkle, pin, bolt, more, chat, export, copy, check` (note: 24 unique names — the prototype list is 25 but `arrow`/`back` are mirrored. Carry the full set including `back`.). Props: `{ name: IconName; size?: number /* default 16 */; className?: string }`. `IconName` is a string-literal union exported alongside the component for autocomplete + compile-time safety. Stroke 1.5, viewBox 0 0 16 16, `fill="none"`, `stroke="currentColor"` — identical to prototype. Storage: object literal mapping `IconName -> JSX.Element`.
- **D-08:** **`TrustBadge` is a verbatim port** of `shared.jsx:TrustBadge` to TS at `src/components/design/TrustBadge.tsx`. Props: `{ score: number; onClick?: () => void; size?: "sm" /* only sm in v1 */ }`. Tier formula stays exact: `score >= 90 → "good"`, `score >= 70 → "warn"`, otherwise `"bad"`. Visual: dot + percentage pill using the prototype's `.trust.good/.warn/.bad` CSS classes (port the relevant block from `styles.css` into `globals.css` or co-locate in a `TrustBadge.module.css`).
- **D-09:** **`AskButton` is a custom component (not a shadcn `Button` variant).** Port `shared.jsx:AskButton` to TS at `src/components/design/AskButton.tsx`. Sizes `sm | md | lg` with corresponding `.ask-btn-sm/.ask-btn-md/.ask-btn-lg` classes (port from prototype). Default label `"Vraag hierover"` (Dutch). The orb-pill visual (gradient orb + label) is unique enough that wrapping shadcn Button would require heavy override work. Keep the shape, drop into a typed component. `onClick` stops propagation (matches prototype).
- **D-10:** **Files live under `src/components/design/`** — the namespace separates DataPraat custom primitives from shadcn-installed ones in `src/components/ui/`. Each primitive exports as the default export and is also re-exported from `src/components/design/index.ts` so call sites can `import { Icon, TrustBadge, AskButton } from "@/components/design"`.

### Format helpers (`src/lib/format/`)
- **D-11:** **Port `fmtEUR`, `fmtNum`, `fmtCompact` verbatim** from `shared.jsx:61-68` to TS at `src/lib/format/index.ts`. Add `fmtPercent` (mentioned in ROADMAP success criterion #3): `(n: number) => Intl.NumberFormat("nl-NL", { style: "percent", maximumFractionDigits: 1 }).format(n)`. Locale stays hard-coded `"nl-NL"` — no locale param yet (YAGNI; multi-locale would be its own phase).
- **D-12:** **Helpers are tree-shakable named exports only** — `export function fmtEUR(n: number): string {}` etc. No barrel default export. Each is `O(1)` and side-effect-free, so the test scaffold can dot-test each with a couple of cases.

### Fonts
- **D-13:** **`next/font/google` self-hosts Inter, Fraunces, JetBrains Mono.** In `src/app/layout.tsx`, declare three `next/font` instances exposing CSS variables: `--font-sans` (Inter, weights 300/400/500/600/700), `--font-display` (Fraunces, weights 300/400/500/600 with `axes: ["opsz"]` for the optical-size axis), `--font-mono` (JetBrains Mono, weights 400/500). The prototype `styles.css` already references `"Fraunces"` and `var(--f-sans)` — the new `globals.css` aliases `--f-sans: var(--font-sans)`, `--f-serif: var(--font-display)`, `--f-mono: var(--font-mono)` so prototype patterns keep working when ported. Add `subset: ["latin", "latin-ext"]` to cover Dutch diacritics (ë in "Jeugdbescherming" etc.).

### Dark mode
- **D-14:** **Deferred to a later phase.** Prototype has no dark-theme block, no requirement asks for it, and Phase 2 is about establishing the light-theme contract first. CSS-var-driven tokens make retrofit a one-block addition (`[data-theme="dark"] :root { ... }`) when a customer asks. Logged in `<deferred>` below.

### `/internal/design` page (DS-04)
- **D-15:** **Single living-reference page at `src/app/internal/design/page.tsx`**, server component, stacked sections in this order:
  1. **Tokens & Colors** — palette swatches grouped by category (Neutrals · Ink · Lines · Brand · Charts (PxQ) · Status · Gold). Each swatch shows: visual square, CSS var name (mono), and computed hex value. Render via a small `<TokenSwatch name="--ink-soft">` helper that reads from a static metadata array (no runtime `getComputedStyle` call — the metadata duplicates `:root` and is the source of truth for the swatches; planner notes this so the next-phase change-detector can compare).
  2. **Typography** — sample lines for `.page-title` (24/600/-0.015em Inter), `.kpi-value` (28/600 tabular-nums Inter), `.card-title` (14/600 Inter), body (14/1.5 Inter), section labels (11/500 uppercase 0.06–0.12em Inter), captions/meta (11–12.5 / `var(--ink-mute)`), and a Fraunces display sample at 32/500 (used in the prototype's overzicht-modes "verhaal" view).
  3. **Custom primitives** — `Icon` grid showing every name + label, `TrustBadge` in good/warn/bad tiers (e.g. 95 / 80 / 60), `AskButton` in sm/md/lg.
  4. **shadcn primitives** — Button (variants: default, secondary, outline, ghost, destructive, link · sizes: sm, md, lg, icon), Card, Input, Dialog (open trigger), DropdownMenu (open trigger), Tabs, Tooltip (hover example), Toast (trigger), Separator.
  5. **Trust mark legend** — a small explainer of what `>=90 good`, `>=70 warn`, `<70 bad` means, with the current tier formula.
  6. **Format helpers** — table showing `fmtEUR(7_200_000)`, `fmtNum(28_400)`, `fmtPercent(0.85)`, `fmtCompact(7_200_000)`.

  No Storybook, no MDX, no per-section sub-routes. One scrollable page with `<h2>` section headings, anchor links via `id` attributes, and the existing site nav suppressed (it's an internal route). The page renders fully without any client interactivity except the Dialog/Dropdown/Tabs/Toast triggers (those are necessarily client components, scoped narrowly).

- **D-16:** **`/internal/design` is unauthenticated in v1** (matches CLAUDE.md "Auth v1: None / shared-link"). Add a small README-style note at the top of the page that says "Internal reference — link from team docs only". When auth lands later, gate `/internal/*` to authed users.

### File layout (consolidated)
- `src/app/globals.css` — `@import "tailwindcss"` + `:root { ... prototype tokens ... }` + `:root { ... shadcn aliases ... }` + `@theme { ... Tailwind utility token mapping ... }` + scoped CSS classes ported from prototype that the custom primitives need (`.trust.good/warn/bad`, `.ask-btn`, `.ask-btn-sm/md/lg`, `.kpi-value`, `.page-title`, etc. — only the ones Phase 2 primitives use; rest land in their consuming phase).
- `components.json` — shadcn config, root level.
- `src/components/ui/` — shadcn-installed primitives (button, card, input, dialog, dropdown-menu, tabs, tooltip, toast, separator).
- `src/components/design/{Icon,TrustBadge,AskButton}.tsx` + `index.ts` barrel.
- `src/lib/format/index.ts` — `fmtEUR`, `fmtNum`, `fmtPercent`, `fmtCompact`.
- `src/app/internal/design/page.tsx` — the living reference.
- `src/app/layout.tsx` — extend with `next/font` setup; pass font CSS vars to `<html>`.

### Claude's Discretion
- Exact `@theme` declaration order and the precise list of token aliases shadcn v4/base-vega expects (researcher reads the current shadcn registry).
- Exact pinned versions for `@tabler/icons-react`, shadcn CLI, plus any peer deps shadcn pulls in (Radix UI sub-packages — should already match Base UI from PROJECT.md or be replaceable). Researcher checks current stable on 2026-04-28.
- Whether `/internal/design` lives under `app/internal/design` or `app/(internal)/design` (route group). Planner's call.
- Whether the swatch metadata is hand-typed in the page or generated from `globals.css` at build time — leaning hand-typed since the token list is small (~40 entries) and updates rarely. Planner's call.
- Whether `next/font` Fraunces variable axis declaration is `axes: ["opsz"]` or full `slnt`/`opsz` axes — verify against current `next/font` docs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level
- `.planning/PROJECT.md` — Stack pins (Tailwind 4, shadcn 4 base-vega, Base UI, Tabler Icons), Dutch UI / English framework rule.
- `.planning/REQUIREMENTS.md` §Foundation, §Design system — FOUND-02, FOUND-03, DS-01, DS-02, DS-03, DS-04.
- `.planning/ROADMAP.md` §"Phase 2: Design System" — Goal + 4 success criteria.
- `.planning/STATE.md` — Last activity, current position.

### Phase 1 carry-forward
- `.planning/phases/01-foundation/01-CONTEXT.md` — Locked decisions D-01 through D-15, tsconfig exclude policy for tests, pnpm onlyBuiltDependencies pattern, .npmrc public-hoist-pattern (which shadcn's Radix peer deps may need).
- `.planning/phases/01-foundation/01-RESEARCH.md` §Stack — version pin matrix that established Tailwind 4.2.4 and Next 15.5.15.
- `.planning/phases/01-foundation/01-02-SUMMARY.md` — How `next.config.ts` and `globals.css` look today (Phase 2 extends, doesn't rewrite).
- `.planning/phases/01-foundation/01-04-SUMMARY.md` — Existing `src/app/api/health/route.ts` as a Route Handler reference pattern.

### Prototype source of truth
- `styles.css` (root) — **Token source of truth**. The `:root` block (lines 3–80ish) is what gets ported. Phase 2 must produce identical visual output on every token rendered side-by-side.
- `shared.jsx` (root) — Source for `Icon` (lines 5–37, 24 names), `TrustBadge` (lines 40–47), `AskButton` (lines 51–59), `fmtEUR`/`fmtNum`/`fmtCompact` (lines 62–68).
- `COMPONENTS.md` (root) — Documented design tokens and primitive usage from the prototype era. Read for intent, not for code.
- `HANDOFF.md` (root) — Stack-target document the prototype was built against; confirms Tailwind 4 + shadcn 4 + Recharts intent.
- `uploads/datapraat-brand-guide-v1.1.md` — Brand values, indigo primary rationale, "warm-cool neutrals". Read for tone if `/internal/design` copy needs voice.
- `.planning/codebase/CONVENTIONS.md` — Established patterns: `--ink-soft` ink ladder, BEM-ish CSS with `.x.modifier`, `dp_*` localStorage prefix, density attribute.
- `.planning/codebase/STACK.md` — Confirms current repo state: prototype + Phase 1 Next.js side-by-side.

### External docs (researcher verifies on 2026-04-28)
- Tailwind CSS v4 release notes — `@theme` directive, no JS config.
- shadcn 4 docs — `init` flow with Tailwind 4 mode, `base-vega` style registry, Radix peer dep list.
- `@tabler/icons-react` README — current pinned version + tree-shaking story.
- `next/font` docs — Google Fonts setup, variable-axis fonts (Fraunces opsz), CSS variable export.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (this repo)
- **`shared.jsx`** is the literal port source. It exists as reference, not import — Phase 2 rewrites the same shapes in TypeScript. Keep behaviour identical (tier thresholds, label defaults, click semantics).
- **`styles.css`** is the literal token source. The `:root` block and the named CSS rules for `.trust.*`, `.ask-btn-*`, `.kpi-*`, `.page-title`, `.card-title`, `.sb-*` are referenced patterns; Phase 2 ports the ones its primitives need.
- **`src/app/globals.css`** (created in Phase 1 by `create-next-app`) — currently has Tailwind v4 imports + minimal preflight. Phase 2 extends it.
- **`src/app/layout.tsx`** (Phase 1) — has `<html lang="nl">` already; Phase 2 adds `next/font` wrappers.
- **`src/components/design/`** doesn't exist yet — Phase 2 creates it. CLAUDE.md "no empty stubs" still applies: only ship Icon/TrustBadge/AskButton, not a placeholder index of more.

### Established Patterns (Phase 1)
- TypeScript strict, no `any`. Custom Icon's `IconName` union is the established way to keep `<Icon name="…">` autocomplete-friendly.
- File names are kebab-case; component files use PascalCase only when they export a single React component (e.g. `TrustBadge.tsx`). Match Phase 1's convention (`page.tsx`, `layout.tsx`, `route.ts` lowercase; component files PascalCase).
- Vitest is the test runner — Phase 2 adds tests for `fmtEUR`/`fmtNum`/`fmtPercent`/`fmtCompact` and a snapshot test for `<Icon>`/`<TrustBadge>`/`<AskButton>` rendering. New tests follow `*.test.ts(x)` naming.
- ESLint + Prettier still gate the tree. `pnpm.onlyBuiltDependencies` may need extending if shadcn pulls in a native binding (unlikely for Radix-on-React; researcher confirms).
- `.npmrc` public-hoist-pattern already covers eslint/prettier — verify it doesn't trip up Radix peer-dep resolution.

### Integration Points
- `src/app/layout.tsx` is the seam for fonts + the dark-mode hook (`<html data-theme="...">` attribute, Phase 2 leaves as light-only).
- `src/app/globals.css` is the seam for tokens — every later phase imports it transitively via `layout.tsx`.
- `src/components/design/index.ts` is the import seam later phases will hit (`import { TrustBadge } from "@/components/design"`).
- `src/lib/format/index.ts` is the seam for any later locale work.
- `src/components/ui/*` is shadcn's territory — Phase 4 (Chat) and Phase 6 (Overzicht) add primitives by running the CLI; Phase 2 doesn't pre-install them.

</code_context>

<specifics>
## Specific Ideas

- **Side-by-side swatch test (success criterion #1):** the `/internal/design` Tokens & Colors section IS the side-by-side reference — the planner can reuse it as the QA check ("compare these swatches to the prototype `Logos.html` palette block in a browser, eyeball test, take a screenshot for VERIFICATION.md").
- **Icon set is 24 unique names, not arbitrary.** `arrow` and `back` are mirror images (same shape, different rotation in the prototype's actual usage). Both ship in Phase 2 — the consuming phases pick the right one.
- **TrustBadge tier thresholds** (90 / 70) are part of the product semantics, not a styling choice. Don't make them configurable in v1 — they appear in user-visible help text in later phases.
- **AskButton's "Vraag hierover" label** is the Dutch product voice. Localisable once we add `i18n`, but the default never becomes English.
- **Health response shape stays untouched** — Phase 2 doesn't modify `/api/health`, just consumes the same env / build-info pattern if `/internal/design` ever wants to display "build SHA" (it shouldn't in v1; defer to OPS-03).
- **Demo page on success criterion #3** ("…used in at least one demo page") is satisfied by `/internal/design` itself. No separate demo route needed.

</specifics>

<deferred>
## Deferred Ideas

- **Dark mode** — clean retrofit later as `[data-theme="dark"] :root { ... }` token override. Not blocked by anything Phase 2 ships.
- **Multi-locale formatters** — make `fmtEUR`/`fmtNum` accept a `locale` param when a non-Dutch customer surfaces. Until then, hard-code `"nl-NL"`.
- **More shadcn primitives** (form, table, command, sheet, popover, accordion, calendar, menubar, navigation-menu, scroll-area, slider, switch, alert, alert-dialog, hover-card, label, progress, radio-group, select, skeleton, sonner, textarea) — install in the phase that first uses them, not now.
- **Chart primitives** (Recharts wrappers, KPI tile, ForecastChart, etc.) — that's Phase 4 (Chat) / Phase 6 (Overzicht) territory; Phase 2 only ships the chart-color tokens, not the components.
- **Storybook / MDX docs site** — `/internal/design` is enough for now; if the team grows beyond ~3 contributors, revisit.
- **Auth gate on `/internal/*`** — Phase 2 leaves it open (matches "Auth v1: None"); the gate lands in the auth phase.
- **Token contrast tests / a11y audit** (axe-core)** — manual eyeball check is acceptable for v1; automated audit lands in Phase 7 OPS polish.
- **Design-token JSON export** for downstream tools (Figma plugin, etc.) — speculative; revisit when a designer asks.
- **Animated/transition tokens** — prototype has none beyond CSS `transition: …` defaults; no scope to add a motion system in Phase 2.

</deferred>

---

*Phase: 02-design-system*
*Context gathered: 2026-04-28*
