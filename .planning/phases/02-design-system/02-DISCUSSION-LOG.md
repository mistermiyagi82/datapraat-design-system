# Phase 2: Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 02-design-system
**Areas discussed:** Token architecture, Custom primitive porting, Dark mode timing, /internal/design scope (resolved by Claude per user delegation)

---

## Gray-area selection prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Token architecture | How prototype CSS vars map into Tailwind 4 @theme + shadcn expected vars | (delegated) |
| Custom primitive porting | Icon / TrustBadge / AskButton — verbatim port vs rebase on shadcn + Tabler | (delegated) |
| Dark mode timing | Add now or defer | (delegated) |
| /internal/design scope | Single page vs sub-routes; how elaborate | (delegated) |

**User's choice:** "can you please do this by yourself? i just want a good but simple design system. I want to build upon this system."

**Notes:** User delegated all four areas to Claude with the design constraint "good but simple, extensible." Claude locked decisions in CONTEXT.md applying that lens: hybrid token system (prototype names + shadcn alias layer for ergonomic composition), verbatim-port custom primitives (preserves prototype intent + Dutch domain icons), dark mode deferred (CSS-var retrofit clean), single living-reference page (no Storybook overhead).

---

## Token architecture (Claude-decided)

**Resolution:** Hybrid 1:1 port + shadcn alias layer + Tailwind 4 `@theme` mapping. Prototype tokens stay verbatim as the source of truth in `:root`. A second `:root` block aliases shadcn's expected names (`--background: var(--bg)`, etc.) so installed shadcn primitives theme themselves automatically. `@theme` exposes them as Tailwind utilities.

**Why this over alternatives:**
- Pure 1:1 port without aliases → shadcn primitives would need manual restyling on every install. Wastes the shadcn ecosystem.
- Pure shadcn-aligned rename → loses prototype readability, breaks one-to-one cross-referencing of the kept-as-reference HTML/JSX.
- Hybrid → prototype names readable in DataPraat code, shadcn just works, extension is one var line.

---

## Custom primitive porting (Claude-decided)

**Resolution:** Verbatim port of `shared.jsx`'s `Icon` (24 names, custom Dutch domain set), `TrustBadge` (good/warn/bad tiers), `AskButton` (orb-pill custom — not a shadcn variant) to TypeScript at `src/components/design/`. Tabler Icons installed as a fallback well for later phases, not used by Phase 2's own Icon component. Format helpers (`fmtEUR`, `fmtNum`, `fmtCompact`, new `fmtPercent`) at `src/lib/format/`.

**Why this over alternatives:**
- Rebase Icon on Tabler → Tabler doesn't have the prototype's domain icons (overzicht, prognose, klopt-dit, validatie, etc.). Switching means losing the Dutch product voice in the iconography.
- AskButton as shadcn Button variant → the orb-pill visual is structurally different (gradient orb + label, custom hover); wrapping shadcn would require heavy override CSS. Custom component is simpler.
- Locale-parameterised fmt helpers → speculative; Dutch is product-locked.

---

## Dark mode timing (Claude-decided)

**Resolution:** Defer. Logged in `<deferred>` for a future phase.

**Why this over alternatives:**
- Add now → doubles test/QA surface for every primitive; no current requirement; prototype has no dark theme to compare against; would slow Phase 2 by ~30%.
- Defer → CSS-var-driven tokens make retrofit a single `[data-theme="dark"] :root { ... }` block when a customer asks. No work lost.

---

## /internal/design scope (Claude-decided)

**Resolution:** Single page at `src/app/internal/design/page.tsx`, server component, six stacked sections (Tokens & Colors / Typography / Custom primitives / shadcn primitives / Trust mark legend / Format helpers). No Storybook, no sub-routes, no MDX. Unauthenticated in v1 (matches "Auth v1: None" from CLAUDE.md).

**Why this over alternatives:**
- Storybook → big tooling investment; team is small; living-reference HTML already does the job.
- Sub-routes per section → adds nav complexity without information density gain at our scale.
- Rich interactivity → only Dialog/Dropdown/Tabs/Toast triggers are necessarily interactive; rest is plain server-rendered swatches.

---

## Claude's Discretion (recorded in CONTEXT.md §Implementation Decisions)

- Exact `@theme` declaration order and the precise list of shadcn v4 / base-vega variable names (researcher reads the current shadcn registry).
- Pinned versions for `@tabler/icons-react` and shadcn CLI on 2026-04-28.
- Whether `/internal/design` lives under `app/internal/design` or `app/(internal)/design` route group.
- Whether swatch metadata is hand-typed or build-time generated from `globals.css`.
- Exact `next/font` Fraunces axes declaration (`opsz` only or full set).

---

## Deferred Ideas (recorded in CONTEXT.md §Deferred)

- Dark mode (token retrofit later)
- Multi-locale formatters (locale param)
- More shadcn primitives (install per consuming phase)
- Chart primitives (Recharts wrappers — Phase 4/6)
- Storybook / MDX docs site
- Auth gate on `/internal/*`
- Automated a11y / contrast audit (Phase 7 OPS polish)
- Design-token JSON export
- Animation/motion system
