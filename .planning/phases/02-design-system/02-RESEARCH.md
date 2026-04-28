# Phase 2: Design System - Research

**Researched:** 2026-04-28
**Domain:** Tailwind 4 design tokens · shadcn 4 (Base UI / Vega) primitives · custom TS primitives · `next/font` · Vitest 3 component testing
**Confidence:** HIGH (every locked decision verifiable against current docs/registry; one CONTEXT.md decision needs swap — see §11)

## Summary

Phase 2 ports the prototype's `:root` token block to Tailwind 4 `@theme` namespaces, layers a thin shadcn-alias `:root` block on top so `pnpm dlx shadcn@latest add ...` produces themed Base UI components, ports three custom primitives (`Icon`, `TrustBadge`, `AskButton`) to TypeScript, ships Dutch-locale formatters, wires `next/font` for Inter / Fraunces / JetBrains Mono with CSS variables, and builds a single `/internal/design` server component as the living reference. Every framework version locked in CONTEXT.md is current and installable on top of Phase 1's pinned tree.

Two locked decisions need micro-corrections, both rooted in upstream changes since CONTEXT.md was written:
1. **D-05 enumerates `toast`** — but shadcn deprecated `toast` in favour of **`sonner`** ([shadcn issue #7120](https://github.com/shadcn-ui/ui/issues/7120)). The CLI still installs toast but emits a deprecation warning. **Recommendation: swap `toast` → `sonner` in the 9-primitive list.** Net change is one package (`sonner@2.0.7` instead of `@radix-ui/react-toast`) and slightly different API. See §6.
2. **D-01 enumerates the shadcn alias variables** but is **missing**: `--destructive-foreground` (shadcn dropped it from its own theming docs in late 2025 — Vega style now relies on `--destructive` alone for both bg+fg), the **eight `--sidebar-*` variables** Vega ships by default, and the **derived `--radius-sm/md/lg/xl/2xl/3xl/4xl` scale**. Most are no-ops for Phase 2 (we never install Sidebar primitive in this phase) but the alias block needs them present-but-empty so a later `shadcn add sidebar` doesn't fail theme-resolution. See §4.

**Primary recommendation:** Adopt CONTEXT.md as authored, with the two corrections above. Use the version pins in §1, the `globals.css` skeleton in §3, the `next/font` snippet in §5, and the Validation Architecture in §9 verbatim. The Base UI question (CONTEXT.md ambiguity) resolves itself once you read what `base-vega` actually means in shadcn 4: `base-vega` = **Base UI primitives + Vega visual style**. Installing shadcn `base-vega` IS installing Base UI — there is no second `Base UI` package to install separately. See §10.

## Project Constraints (from CLAUDE.md)

- **Tech stack pins are authoritative:** Next.js 15, React 19, TypeScript 5 strict, Tailwind 4, shadcn 4 (`base-vega`), Base UI, Tabler Icons, Zod, better-sqlite3. Do not pre-install AI SDK, MCP SDK, or Recharts — those land in Phases 4–6.
- **No Vercel-only APIs.** `next/font` self-hosts Google Fonts at build time — that is a Vercel-agnostic feature, fine for Railway and Azure.
- **Dutch in UI / domain identifiers; English in framework code.** "Vraag hierover" stays Dutch. Component names (`TrustBadge`), prop names (`onClick`), and internal types (`IconName`) stay English.
- **Auth v1: None / shared-link.** `/internal/design` is unauthenticated in Phase 2 (matches D-16). When auth lands, gate `/internal/*` to authed users.
- **GSD workflow enforced** — file edits go through `/gsd-execute-phase`. Phase 2 produces typed primitives consumed by every later phase, so the `src/components/design/index.ts` and `src/lib/format/index.ts` import seams must be stable.
- **Prototype files at root are reference-only.** No edits to `styles.css`, `shared.jsx`, `DataPraat.html`. Phase 2 reads them as source-of-truth and writes new files under `src/`.
- **No empty stubs.** `src/components/design/index.ts` exports only `Icon`, `TrustBadge`, `AskButton` — not placeholders for future primitives.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Hybrid token system. `:root` keeps prototype tokens verbatim (`--bg`, `--ink`, `--primary`, `--chart-cost`, `--r-md`, `--s-lg`, etc.). A second `:root` block aliases shadcn's expected variables to prototype tokens (`--background: var(--bg)`, `--foreground: var(--ink)`, etc.). Tailwind 4 `@theme` block exposes prototype tokens as utilities via the `--color-*` / `--radius-*` / `--spacing-*` / `--font-*` namespaces. Researcher fills any missing aliases.
- **D-02:** Color values stay in hex (matches prototype) — not OKLCH. No re-encoding.
- **D-03:** No CSS-var renames during the port. Prototype names carry forward unchanged.
- **D-04:** `pnpm dlx shadcn@latest init` with `base-vega` style, Tailwind 4 mode, install destination `src/components/ui/`. `components.json` is committed. No `tailwind.config.*` — config lives in `globals.css` `@theme` and `components.json`.
- **D-05:** Phase 2 installs exactly 9 core primitives: `button card input dialog dropdown-menu tabs tooltip toast separator`. *(See §11 — `toast` should become `sonner`.)*
- **D-06:** Tabler Icons `@tabler/icons-react` installed but NOT used by `Icon` component in Phase 2.
- **D-07:** `Icon` is a verbatim port of `shared.jsx:Icon` to `src/components/design/Icon.tsx`. 24 unique names. `IconName` string-literal union exported. Stroke 1.5, viewBox 0 0 16 16, `fill="none"`, `stroke="currentColor"`.
- **D-08:** `TrustBadge` verbatim port. `score >= 90 → "good"`, `>= 70 → "warn"`, else `"bad"`.
- **D-09:** `AskButton` is a custom component (not a shadcn `Button` variant). Sizes `sm | md | lg`. Default Dutch label "Vraag hierover". `onClick` stops propagation.
- **D-10:** `src/components/design/` for custom primitives; `src/components/ui/` for shadcn. Re-export from `src/components/design/index.ts`.
- **D-11:** `fmtEUR`, `fmtNum`, `fmtCompact` ported verbatim. Add `fmtPercent`. Locale hard-coded `"nl-NL"`.
- **D-12:** Helpers are tree-shakable named exports only.
- **D-13:** `next/font/google` self-hosts Inter, Fraunces, JetBrains Mono. CSS vars `--font-sans`, `--font-display`, `--font-mono`. Subsets `["latin", "latin-ext"]`. Fraunces uses `axes: ["opsz"]`.
- **D-14:** Dark mode deferred.
- **D-15:** Single `/internal/design` page, server component, six stacked sections (Tokens & Colors → Typography → Custom primitives → shadcn primitives → Trust mark legend → Format helpers).
- **D-16:** `/internal/design` unauthenticated in v1. README banner says "Internal reference — link from team docs only".

### Claude's Discretion

- Exact `@theme` declaration order and full alias list shadcn v4/base-vega expects → **Resolved §3 + §4.**
- Exact pinned versions for shadcn CLI, `@tabler/icons-react`, Radix peer deps, CVA/clsx/tailwind-merge → **Resolved §1.**
- Whether `/internal/design` lives under `app/internal/design` or `app/(internal)/design` → **Resolved §8: `app/internal/design` (no route group needed; D-16 already says "internal").**
- Whether swatch metadata is hand-typed or generated from `globals.css` → **Resolved §8: hand-typed const array, ~40 entries.**
- Whether `next/font` Fraunces uses `axes: ["opsz"]` only → **Resolved §5: `axes: ["opsz"]` is correct and sufficient.**

### Deferred Ideas (OUT OF SCOPE)

- Dark mode (CSS-var override `[data-theme="dark"] :root { ... }` — retrofit later).
- Multi-locale formatters (`fmtEUR(n, locale)` — defer until non-Dutch customer surfaces).
- More shadcn primitives (form, table, command, sheet, popover, accordion, calendar, menubar, navigation-menu, scroll-area, slider, switch, alert, alert-dialog, hover-card, label, progress, radio-group, select, skeleton, textarea) — install in introducing phase.
- Chart primitives (Recharts wrappers, KPI tile, ForecastChart) — Phase 4–6 territory; only chart-color tokens land in Phase 2.
- Storybook / MDX docs site.
- Auth gate on `/internal/*`.
- Token contrast / a11y automated audit (axe-core) — Phase 7.
- Design-token JSON export.
- Animated/transition tokens / motion system.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-02 | Tailwind 4 configured with DataPraat tokens ported from prototype `:root` into `@theme` directives | §3 (`globals.css` skeleton) + §4 (alias map) — every prototype token in `styles.css:3-79` lands in `@theme` under a Tailwind-recognised namespace; planner can lift §3 verbatim |
| FOUND-03 | shadcn 4 (`base-vega`) + Base UI + Tabler Icons installed; CLI can add new components | §1 (versions) + §2 (init flow) + §10 (Base UI clarification) — `base-vega` = Base UI + Vega style, single install handles both |
| DS-01 | Design tokens from `styles.css :root` ported to Tailwind 4 `@theme` | Same as FOUND-02; §3 enumerates the entire mapping |
| DS-02 | Core shadcn primitives installed: button, card, input, dialog, dropdown-menu, tabs, tooltip, **sonner** (was toast — see §11), separator | §1 versions + §2 install commands; sonner is the current shadcn-blessed replacement for toast |
| DS-03 | DataPraat-specific TS primitives: `Icon`, `TrustBadge`, `AskButton`, NL formatters | §6 (port outlines) + §7 (formatter outlines) — verbatim TS shapes derived from `shared.jsx` |
| DS-04 | `/internal/design` page documents tokens, typography, primitives | §8 (page structure + section breakdown + server/client boundary) |

## Standard Stack

### Core (versions verified via `pnpm view <pkg> version` on 2026-04-28)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `shadcn` (CLI) | **4.5.0** | Init + add primitive components | Latest stable on `latest` dist-tag; v4 line is the Tailwind-v4-aware CLI [VERIFIED: pnpm view shadcn version on 2026-04-28] |
| `@tabler/icons-react` | **3.41.1** | Tabler Icons React bindings (D-06 fallback well) | Current stable [VERIFIED: pnpm view] |
| `@radix-ui/react-dialog` | **1.1.15** | Dialog primitive (peer of shadcn Dialog under Base UI build) | Current [VERIFIED: pnpm view] |
| `@radix-ui/react-dropdown-menu` | **2.1.16** | DropdownMenu primitive | Current [VERIFIED: pnpm view] |
| `@radix-ui/react-tabs` | **1.1.13** | Tabs primitive | Current [VERIFIED: pnpm view] |
| `@radix-ui/react-tooltip` | **1.2.8** | Tooltip primitive | Current [VERIFIED: pnpm view] |
| `@radix-ui/react-separator` | **1.1.8** | Separator primitive | Current [VERIFIED: pnpm view] |
| `@radix-ui/react-slot` | **1.2.4** | Used by shadcn Button `asChild` | Current [VERIFIED: pnpm view] |
| `sonner` | **2.0.7** | Toast replacement (D-05 update — see §11) | Current; recommended by shadcn [VERIFIED: pnpm view + CITED: shadcn issue #7120] |
| `class-variance-authority` | **0.7.1** | shadcn primitive variants (`cva()`) | Current [VERIFIED: pnpm view] |
| `clsx` | **2.1.1** | Class merging helper | Current [VERIFIED: pnpm view] |
| `tailwind-merge` | **3.5.0** | shadcn `cn()` helper dep | Current [VERIFIED: pnpm view] |
| `lucide-react` | **1.11.0** | shadcn's default icon source (peer dep — installed by CLI; we don't import from it directly) | Current [VERIFIED: pnpm view] |

**Note on the toast/sonner swap:** if D-05 stays as written (toast), the install command `pnpm dlx shadcn@latest add toast` still works but emits a deprecation warning, and `@radix-ui/react-toast@1.2.15` lands instead of `sonner`. Both are functional; sonner is the project-future-proof choice.

### Test scaffolding (verified 2026-04-28)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@testing-library/react` | **16.3.2** | Component rendering for Vitest | React 19 compatible; v16+ is the React-19 line [VERIFIED: pnpm view] |
| `@testing-library/jest-dom` | **6.9.1** | `toBeInTheDocument()`, `toHaveClass()`, etc. | Wires into Vitest via `@testing-library/jest-dom/vitest` [VERIFIED: pnpm view] |
| `@testing-library/user-event` | **14.6.1** | User interaction simulation (click, type) | Latest [VERIFIED: pnpm view] |
| `jsdom` | **29.1.0** *(or pin Phase-1's existing if any)* | Vitest DOM environment | Use jsdom over happy-dom — more mature, fewer Web-API gaps [CITED: testing-library docs + Vitest features page] |
| `@vitejs/plugin-react` | **6.0.1** | JSX transform for Vitest | Required when component test files use JSX [VERIFIED: pnpm view] |

**Vitest:** Phase 1 already pins `vitest@3.2.4`. Latest 4.x is `4.1.5` (out 2026); staying on 3.x is fine — no Phase 2 feature requires v4. **Recommendation: keep Phase 1's `vitest@3.2.4`.**

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `sonner` (D-05 update) | `@radix-ui/react-toast` via the deprecated shadcn `toast` install | Toast still works but is deprecated; choosing it now means a forced migration in a later phase |
| `jsdom` | `happy-dom` | happy-dom is faster but has more Web-API gaps; Tooltip/Dialog/Dropdown tests have edge cases on happy-dom that don't exist on jsdom |
| `lucide-react` for `Icon` | Hand-rolled SVG ports (chosen, D-07) | Lucide ships ~1500 icons; the prototype's 24 are bespoke shapes. Hand-roll wins on visual fidelity |
| Tailwind v4 `@theme inline` | Tailwind v4 `@theme` (non-inline) | `inline` resolves CSS vars at generation time (good when chaining `var()` references); D-01's hybrid model needs `@theme inline` so `--color-ink: var(--ink)` resolves correctly [CITED: ui.shadcn.com/docs/tailwind-v4] |

**Installation commands:**

```bash
# 1. shadcn init (writes components.json + base-vega CSS skeleton + cn() util)
pnpm dlx shadcn@latest init --yes --base base --style vega

# 2. Add the 9 Phase-2 primitives
pnpm dlx shadcn@latest add button card input dialog dropdown-menu tabs tooltip sonner separator

# 3. Direct deps not auto-pulled by shadcn add
pnpm add @tabler/icons-react@3.41.1

# 4. Test deps (devDependencies)
pnpm add -D @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 \
  @testing-library/user-event@14.6.1 jsdom@29.1.0 @vitejs/plugin-react@6.0.1
```

The shadcn CLI auto-installs `class-variance-authority`, `clsx`, `tailwind-merge`, the relevant `@radix-ui/*` peer packages, and `sonner` when its components are added. Pin them after `pnpm install` if Phase 1's exact-pin policy applies.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── globals.css              # Phase 2 rewrites (preserve @import, replace rest)
│   ├── layout.tsx               # Phase 2 extends — adds next/font instances
│   ├── internal/
│   │   └── design/
│   │       ├── page.tsx         # Server component — section composition
│   │       ├── token-swatch.tsx # Server component
│   │       ├── icon-grid.tsx    # Server component
│   │       └── client-preview.tsx # Client component — Dialog/Dropdown/Tabs/Tooltip/Sonner triggers
│   └── ...
├── components/
│   ├── design/
│   │   ├── Icon.tsx
│   │   ├── TrustBadge.tsx
│   │   ├── AskButton.tsx
│   │   └── index.ts             # Barrel — only these three
│   └── ui/                       # shadcn-installed primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── tabs.tsx
│       ├── tooltip.tsx
│       ├── sonner.tsx
│       └── separator.tsx
├── lib/
│   ├── format/
│   │   ├── index.ts              # fmtEUR / fmtNum / fmtPercent / fmtCompact
│   │   └── index.test.ts
│   └── utils.ts                  # shadcn writes cn() here
└── ...
components.json                    # shadcn config (root level)
```

### Pattern 1: Hybrid token cascade (`globals.css`)

The prototype-as-source-of-truth model. Three layers in this order:

```css
/* src/app/globals.css */
@import "tailwindcss";

/* ---------- Layer 1: Prototype tokens (verbatim port from styles.css:3-79) ---------- */
:root {
  /* neutrals */
  --bg: #FCFBF8;
  --bg-soft: #F3F2EE;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;

  /* ink */
  --ink: #2A2724;
  --ink-soft: #5E5A53;
  --ink-mute: #8F8A80;
  --ink-faint: #B3ADA3;

  /* lines */
  --line: #E5E3DD;
  --line-soft: #EEECE7;
  --line-strong: #D4D1CB;

  /* brand */
  --primary: #4338CA;
  --primary-soft: #6366F1;
  --primary-tint: #EEF2FF;
  --primary-ink: #3151B0;
  --primary-foreground: #FAF7EF;

  /* chart (PxQ) */
  --chart-cost: #3b82f6;
  --chart-volume: #5E8A6D;
  --chart-price: #ea580c;
  --chart-1: #3151B0;
  --chart-2: #3b82f6;
  --chart-3: #60a5fa;
  --chart-4: #93c5fd;
  --chart-5: #bfdbfe;

  /* gold / status */
  --gold: #A8702A;
  --gold-tint: #F4ECD4;
  --success: #5E8A6D;
  --success-tint: #E5EDDF;
  --success-strong: #3D5C4A;
  --warning: #A8702A;
  --warning-tint: #F4ECD4;
  --warning-strong: #8A5A26;
  --destructive: #A85050;
  --destructive-tint: #F2DDDA;
  --destructive-strong: #7A2A2A;

  /* radii */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 14px;
  --r-xl: 20px;

  /* spacing */
  --s-xs: 4px;
  --s-sm: 8px;
  --s-md: 12px;
  --s-lg: 20px;
  --s-xl: 32px;
  --s-2xl: 48px;

  /* shadows */
  --shadow-sm: 0 1px 2px rgba(26, 24, 20, 0.04), 0 1px 0 rgba(26, 24, 20, 0.02);
  --shadow-md: 0 2px 8px rgba(26, 24, 20, 0.06), 0 1px 2px rgba(26, 24, 20, 0.04);
  --shadow-lg: 0 8px 32px rgba(26, 24, 20, 0.08), 0 4px 12px rgba(26, 24, 20, 0.04);
  --shadow-drawer: -8px 0 40px rgba(26, 24, 20, 0.08), -2px 0 8px rgba(26, 24, 20, 0.04);

  /* font-stack aliases (resolved by next/font in layout.tsx) */
  --f-sans: var(--font-sans);
  --f-serif: var(--font-display);
  --f-mono: var(--font-mono);
}

/* ---------- Layer 2: shadcn alias layer (Vega style → prototype tokens) ---------- */
:root {
  --background: var(--bg);
  --foreground: var(--ink);
  --card: var(--surface);
  --card-foreground: var(--ink);
  --popover: var(--surface);
  --popover-foreground: var(--ink);
  --primary: var(--primary);              /* same name — already correct */
  --primary-foreground: var(--primary-foreground);  /* same name */
  --secondary: var(--bg-soft);
  --secondary-foreground: var(--ink);
  --muted: var(--bg-soft);
  --muted-foreground: var(--ink-mute);
  --accent: var(--primary-tint);
  --accent-foreground: var(--primary-ink);
  --destructive: var(--destructive);      /* same name — already correct */
  --border: var(--line);
  --input: var(--line-strong);
  --ring: var(--primary-soft);
  --radius: var(--r-md);

  /* Sidebar tokens (Vega ships them; we don't install Sidebar in Phase 2 but the alias must exist
     so a later `shadcn add sidebar` doesn't fail theme resolution). All map to safe defaults. */
  --sidebar: var(--bg-soft);
  --sidebar-foreground: var(--ink);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--primary-tint);
  --sidebar-accent-foreground: var(--primary-ink);
  --sidebar-border: var(--line);
  --sidebar-ring: var(--primary-soft);

  /* Chart vars (shadcn expects --chart-1..5; we already have them in Layer 1, no aliasing needed) */
}

/* ---------- Layer 3: Tailwind 4 utility token mapping ---------- */
@theme inline {
  /* Color namespace → utility classes like bg-ink, text-ink-soft, border-line, ring-primary-soft */
  --color-bg: var(--bg);
  --color-bg-soft: var(--bg-soft);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);

  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-ink-mute: var(--ink-mute);
  --color-ink-faint: var(--ink-faint);

  --color-line: var(--line);
  --color-line-soft: var(--line-soft);
  --color-line-strong: var(--line-strong);

  --color-primary: var(--primary);
  --color-primary-soft: var(--primary-soft);
  --color-primary-tint: var(--primary-tint);
  --color-primary-ink: var(--primary-ink);
  --color-primary-foreground: var(--primary-foreground);

  --color-chart-cost: var(--chart-cost);
  --color-chart-volume: var(--chart-volume);
  --color-chart-price: var(--chart-price);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-gold: var(--gold);
  --color-gold-tint: var(--gold-tint);

  --color-success: var(--success);
  --color-success-tint: var(--success-tint);
  --color-success-strong: var(--success-strong);
  --color-warning: var(--warning);
  --color-warning-tint: var(--warning-tint);
  --color-warning-strong: var(--warning-strong);
  --color-destructive: var(--destructive);
  --color-destructive-tint: var(--destructive-tint);
  --color-destructive-strong: var(--destructive-strong);

  /* Also expose shadcn's semantic names so utility classes like bg-background, text-foreground work */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Radius — keep prototype names (`r-md`) AND shadcn names (`md`) so both work */
  --radius-sm: var(--r-sm);
  --radius-md: var(--r-md);
  --radius-lg: var(--r-lg);
  --radius-xl: var(--r-xl);
  /* shadcn-derived radius scale (lg = base, sm = base-4, md = base-2, xl = base+4) — match shadcn defaults */
  /* (Optional: only needed if shadcn primitives reference rounded-2xl etc; Vega Button uses rounded-md.) */

  /* Spacing tokens — Tailwind v4 has --spacing as the base unit; we expose ours as --spacing-xs etc */
  --spacing-xs: var(--s-xs);
  --spacing-sm: var(--s-sm);
  --spacing-md: var(--s-md);
  --spacing-lg: var(--s-lg);
  --spacing-xl: var(--s-xl);
  --spacing-2xl: var(--s-2xl);

  /* Fonts — shadcn looks at --font-sans/--font-mono; we also expose --font-display for Fraunces */
  --font-sans: var(--font-sans);     /* set by next/font in layout.tsx */
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);

  /* Shadows — make available as shadow-{sm,md,lg,drawer} utilities */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-drawer: var(--shadow-drawer);
}

/* ---------- Layer 4: Scoped CSS classes ported from prototype (only what Phase 2 primitives need) ---------- */

/* TrustBadge — port styles.css `.trust`, `.trust.good`, `.trust.warn`, `.trust.bad`, `.trust-dot` */
.trust {
  display: inline-flex;
  align-items: center;
  gap: var(--s-xs);
  padding: 2px var(--s-sm);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
.trust-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.trust.good { background: var(--success-tint); color: var(--success-strong); }
.trust.good .trust-dot { background: var(--success); }
.trust.warn { background: var(--warning-tint); color: var(--warning-strong); }
.trust.warn .trust-dot { background: var(--warning); }
.trust.bad  { background: var(--destructive-tint); color: var(--destructive-strong); }
.trust.bad  .trust-dot { background: var(--destructive); }

/* AskButton — port styles.css `.ask-btn`, `.ask-btn-sm/md/lg`, `.orb`, `.ask-btn-label` */
.ask-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--s-sm);
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--primary-tint);
  color: var(--primary-ink);
  font-weight: 500;
  transition: background 120ms ease;
}
.ask-btn:hover { background: var(--primary-soft); color: var(--primary-foreground); }
.ask-btn .orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
}
.ask-btn-sm { padding: 4px 10px; font-size: 12px; }
.ask-btn-md { padding: 6px 12px; font-size: 13px; }
.ask-btn-lg { padding: 8px 16px; font-size: 14px; }
.ask-btn-sm .orb { width: 10px; height: 10px; }
.ask-btn-lg .orb { width: 14px; height: 14px; }

/* Body baseline (port styles.css 81-92, scoped to body so we don't conflict with Tailwind's preflight) */
body {
  font-family: var(--f-sans);
  color: var(--ink);
  background: var(--bg);
  font-feature-settings: "ss01", "cv11";
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Order discipline (critical):**
1. `@import "tailwindcss";` first (resets Tailwind's defaults, registers preflight).
2. Layer 1 (`:root` prototype tokens) before Layer 2 (`:root` aliases) — the cascade lets the second `:root` reference variables defined in the first.
3. `@theme inline` AFTER both `:root` blocks — Tailwind v4 reads `@theme` to generate utilities; using `inline` resolves `var()` refs at generation time, otherwise utility classes carry the unresolved CSS-var name and need a runtime variable resolution.
4. Layer 4 scoped classes after `@theme` so utility classes lose specificity contests against them only when explicitly authored.

### Pattern 2: Server-with-client-islands `/internal/design`

```tsx
// src/app/internal/design/page.tsx (server component)
import { Icon, TrustBadge, AskButton } from "@/components/design";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fmtEUR, fmtNum, fmtPercent, fmtCompact } from "@/lib/format";
import { ClientPreview } from "./client-preview";

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">DataPraat — Design System</h1>
      <p className="text-sm text-ink-mute">
        Internal reference — link from team docs only. Verkenning van tokens, typografie, en primitives.
      </p>
      <Separator className="my-8" />

      <section id="tokens">{/* server-rendered swatch grid */}</section>
      <section id="typography">{/* static type samples */}</section>
      <section id="custom">{/* Icon grid, TrustBadge tiers, AskButton sizes */}</section>
      <section id="shadcn">
        {/* static Button/Card/Input/Separator examples + … */}
        <ClientPreview /> {/* islands: Dialog/Dropdown/Tabs/Tooltip/Sonner triggers */}
      </section>
      <section id="trust">{/* tier formula explainer */}</section>
      <section id="format">{/* fmt helpers table */}</section>
    </main>
  );
}
```

```tsx
// src/app/internal/design/client-preview.tsx (client island)
"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, ... } from "@/components/ui/dropdown-menu";
import { Tabs, ... } from "@/components/ui/tabs";
import { Tooltip, TooltipProvider, ... } from "@/components/ui/tooltip";
import { Toaster, toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

export function ClientPreview() {
  return (
    <TooltipProvider>
      {/* Dialog trigger, Dropdown trigger, Tabs, Tooltip, Toast trigger — all in one client island */}
      <Toaster />
    </TooltipProvider>
  );
}
```

**Why one client island, not many:** keeps the page server-rendered (cheap, fast first paint) and minimises client-bundle hydration cost. shadcn primitives are themselves marked `"use client"` so importing them anywhere transitively makes that file client — putting them all in one `client-preview.tsx` keeps the boundary explicit and reviewable.

### Anti-Patterns to Avoid

- **Hand-rolling shadcn alias rewrites.** Do not edit `src/components/ui/button.tsx` to override CVA variants — the CLI overwrites it on `shadcn add` updates. If you need a custom variant, wrap in a new component (`src/components/design/AskButton.tsx`-style).
- **Inline-only fonts.** Don't reference `'"Inter", sans-serif'` directly in `tailwind.config` or component code — go through the `--font-sans` CSS variable so Phase 2's `next/font` self-host is the single source.
- **Mixing OKLCH and hex.** D-02 locks hex; if shadcn init writes OKLCH defaults, replace them with the prototype hex values before commit.
- **Pre-installing Phase 4–6 primitives.** `pnpm dlx shadcn add form` etc. Do not install in Phase 2 — D-05 is exact.
- **Multiple instances of `next/font` calls per font.** Per the [Next.js fonts docs](https://nextjs.org/docs/app/api-reference/components/font#using-a-font-definitions-file), one call per family per build. Define them once in `layout.tsx` (or a shared `app/fonts.ts`) and pass the variable through.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Themed primitive components | Custom Button/Dialog/Tabs/Tooltip/etc. | `shadcn add ...` | Battle-tested a11y, keyboard handling, focus management. CONTEXT.md D-04/D-05 already locks this. |
| Toast / notification system | Custom React portal + animation | `sonner` (D-05 update) | Animation easing, stacking, swipe-to-dismiss, screen-reader announcements all handled |
| CVA-style variant typing | Custom prop-to-class mapping | `class-variance-authority` | Compile-time variant safety; shadcn primitives use it natively |
| Class concatenation | String templating | `clsx` + `tailwind-merge` (`cn()`) | shadcn's `lib/utils.ts` cn() handles conflict resolution (e.g. `bg-red-500` + `bg-blue-500` → blue wins) |
| Variable-axis font loading | Manual `<link>` with `&family=Fraunces:opsz,wght@9..144,300..600` | `next/font/google` | Self-hosts, eliminates Google round-trip, generates fallback metrics to prevent CLS |
| Locale-aware number formatting | Hand-rolled separator logic | `Intl.NumberFormat("nl-NL", {...})` | Already correct in prototype; D-11 keeps verbatim |
| Icon-name autocomplete | Plain string prop | TypeScript string-literal union (`IconName`) | Compile-time check on every `<Icon name="…" />` callsite — Phase 1 D-04 strict already |

**Key insight:** The whole point of installing shadcn (D-04) is that all the deceptively-complex pieces (Dialog focus-trap, Tooltip portal, DropdownMenu keyboard nav, Tabs ARIA wiring) come for free under Base UI. Don't reinvent any of them.

## Common Pitfalls

### Pitfall 1: shadcn init overwrites `globals.css`
**What goes wrong:** `pnpm dlx shadcn@latest init` rewrites `src/app/globals.css` with shadcn's default `:root` block, blowing away the prototype tokens.
**Why it happens:** The CLI assumes a greenfield project and writes its own theme.
**How to avoid:** Run `shadcn init` BEFORE Phase 2's token port. The plan should be:
1. Run `shadcn init` (writes a default `globals.css`).
2. Replace its content with the §3 skeleton (which already includes `@import "tailwindcss"` and the Layer 2 alias block).
3. Re-running `shadcn add` is safe — it never touches `globals.css`, only the `src/components/ui/*` files. So the prototype tokens are stable for the rest of the project.
**Warning signs:** After init, `git diff src/app/globals.css` shows a complete rewrite. Don't commit before the manual replace.

### Pitfall 2: Tailwind v4 doesn't pick up `--color-*` from `:root` without `@theme`
**What goes wrong:** Defining `--ink: #2A2724` in `:root` does NOT auto-generate `text-ink` utilities. You write `text-ink` in JSX, get nothing.
**Why it happens:** Tailwind v4 reads token namespaces (`--color-*`, `--radius-*`, etc.) only inside `@theme` blocks. The `:root` declaration is just a CSS variable.
**How to avoid:** Every utility-generating token must appear inside `@theme inline { --color-X: var(--X); }`. The §3 skeleton enumerates all 40+ tokens.
**Warning signs:** Class like `bg-primary-tint` doesn't apply any color in dev. Check generated CSS: missing `.bg-primary-tint { background-color: var(--color-primary-tint); }` rule.

### Pitfall 3: `next/font` Fraunces opsz axis silently no-ops
**What goes wrong:** `axes: ["opsz"]` is accepted but the optical-size axis isn't actually applied at certain font-size thresholds — text renders identically to non-variable Fraunces.
**Why it happens:** Per [Next.js issue #64960](https://github.com/vercel/next.js/issues/64960), the CSS that next/font emits for variable axes doesn't include `font-variation-settings` automatically. You need to set it manually OR rely on browser defaults that interpolate by computed font-size.
**How to avoid:** For Phase 2, the optical-size axis is a polish feature on the `verhaal` mode (which lives in Phase 6). In Phase 2, just declare `axes: ["opsz"]` so the variable-axis font file is preloaded; the actual `font-variation-settings: "opsz" 32` rule lands in the consuming component's CSS in a later phase. Add a code comment in `layout.tsx`: `// Fraunces opsz exposed via variable; consumers set font-variation-settings explicitly.`
**Warning signs:** Fraunces text at 32px renders the same as 14px (no optical-size adjustment). Check computed `font-variation-settings` in DevTools.

### Pitfall 4: Toast vs Sonner migration risk
**What goes wrong:** D-05 says install `toast` but shadcn issue #7120 confirms toast is deprecated; CLI emits a warning and the API is `useToast()` hook rather than the imperative `toast()` function from sonner.
**Why it happens:** Upstream change between CONTEXT.md drafting and Phase 2 execution.
**How to avoid:** Replace `toast` with `sonner` in the install command — see §11. Sonner's API:
```tsx
import { toast } from "sonner";
toast.success("Opgeslagen");
```
vs the deprecated toast hook:
```tsx
const { toast } = useToast();
toast({ title: "Opgeslagen" });
```
Sonner is simpler and is what shadcn currently recommends.
**Warning signs:** CLI prints `The toast component is deprecated. Use the sonner component instead` during install.

### Pitfall 5: `pnpm` strict layout breaks Radix peer-dep resolution
**What goes wrong:** shadcn primitives import from `@radix-ui/react-dialog` etc. With pnpm's hard-linked, non-flat node_modules, transitive resolution can fail if the workspace doesn't hoist the peer.
**Why it happens:** pnpm 10's `node-linker=isolated` (default) strict layout.
**How to avoid:** Phase 1 already shipped `.npmrc` with `public-hoist-pattern[]=*eslint*` and `*prettier*`. Verify Radix doesn't need the same treatment by running `pnpm install` after `shadcn add` and importing a shadcn primitive in a test page; if `Cannot find module '@radix-ui/react-dialog'` surfaces, append `public-hoist-pattern[]=*radix*` to `.npmrc`. Most likely no extension needed — Radix packages are direct deps after `shadcn add`, not transitive.
**Warning signs:** Build error `Module not found: Can't resolve '@radix-ui/react-dialog'` despite the package being in `node_modules`.

### Pitfall 6: shadcn `init` writes OKLCH defaults; D-02 says hex
**What goes wrong:** Init writes `--background: oklch(...)` etc. The §3 skeleton uses `#FCFBF8` etc.
**Why it happens:** shadcn 4 vega style ships OKLCH defaults.
**How to avoid:** The §3 globals.css skeleton is the canonical replacement. After `init`, overwrite `globals.css` with §3 verbatim — the hex values match the prototype (D-02).
**Warning signs:** Brand color in dev renders as a slightly-off magenta-ish indigo, not the prototype's `#4338CA`.

## Code Examples

### `next/font` setup in `layout.tsx`

```tsx
// src/app/layout.tsx (Phase 2 extends Phase 1's minimal layout)
import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],     // latin-ext covers Dutch diacritics (ë, ï)
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  axes: ["opsz"],                       // optical-size axis; consumers set font-variation-settings
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataPraat",
  description: "Praat met je gemeentedata in eenvoudig Nederlands.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

Source: [Next.js fonts docs §With Tailwind CSS](https://nextjs.org/docs/app/api-reference/components/font)

### `Icon.tsx` skeleton

```tsx
// src/components/design/Icon.tsx
import type { JSX, SVGProps } from "react";

export type IconName =
  | "overzicht" | "prognose" | "validatie" | "benchmark" | "verwijzers"
  | "lineage" | "glossary" | "regels" | "plus" | "chevron" | "close"
  | "send" | "search" | "info" | "arrow" | "back" | "sparkle" | "pin"
  | "bolt" | "more" | "chat" | "export" | "copy" | "check";

const paths: Record<IconName, JSX.Element> = {
  overzicht: (
    <g>
      <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
      <rect x="8.5" y="2.5" width="5" height="5" rx="1" />
      <rect x="2.5" y="8.5" width="5" height="5" rx="1" />
      <rect x="8.5" y="8.5" width="5" height="5" rx="1" />
    </g>
  ),
  // … 23 more, verbatim from shared.jsx:7-30
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
```

Source: verbatim port of `shared.jsx:5-37`.

### `TrustBadge.tsx` skeleton

```tsx
// src/components/design/TrustBadge.tsx
import type { JSX } from "react";

type Tier = "good" | "warn" | "bad";
function tierFor(score: number): Tier {
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

export interface TrustBadgeProps {
  score: number;
  onClick?: () => void;
  size?: "sm";              // only sm in v1 per D-08
}

export function TrustBadge({ score, onClick, size = "sm" }: TrustBadgeProps): JSX.Element {
  const tier = tierFor(score);
  return (
    <span
      className={`trust ${tier}`}
      data-size={size}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      role={onClick ? "button" : undefined}
    >
      <span className="trust-dot" /> {score}%
    </span>
  );
}
```

Source: verbatim port of `shared.jsx:40-47`. CSS classes `.trust`, `.trust.good/warn/bad`, `.trust-dot` ported into `globals.css` Layer 4 (§3).

### `AskButton.tsx` skeleton

```tsx
// src/components/design/AskButton.tsx
import type { JSX, MouseEvent } from "react";

export interface AskButtonProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AskButton({
  onClick,
  label = "Vraag hierover",
  size = "md",
  className = "",
}: AskButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={`ask-btn ask-btn-${size} ${className}`.trim()}
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    >
      <span className="orb" aria-hidden="true" />
      <span className="ask-btn-label">{label}</span>
    </button>
  );
}
```

Source: verbatim port of `shared.jsx:51-59`. CSS classes ported into `globals.css` Layer 4 (§3).

### `src/components/design/index.ts` barrel

```ts
export { Icon, type IconName, type IconProps } from "./Icon";
export { TrustBadge, type TrustBadgeProps } from "./TrustBadge";
export { AskButton, type AskButtonProps } from "./AskButton";
```

### `src/lib/format/index.ts`

```ts
// src/lib/format/index.ts — Dutch-locale number/currency/percent helpers.
// All Intl.NumberFormat instances are constructed per call rather than memoised:
// V8 caches instances internally, and Phase 2 callsites are rare enough that
// the cleaner shape wins over the optimisation.

export function fmtEUR(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNum(n: number): string {
  return new Intl.NumberFormat("nl-NL").format(n);
}

export function fmtPercent(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) {
    return `€${(n / 1_000_000).toLocaleString("nl-NL", { maximumFractionDigits: 1 })}M`;
  }
  if (n >= 1_000) {
    return `€${Math.round(n / 1_000)}K`;
  }
  return fmtEUR(n);
}
```

Source: verbatim port of `shared.jsx:62-68` plus `fmtPercent` from D-11.

### `components.json` after `shadcn init`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-vega",
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "rsc": true,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Notes:
- `"style": "base-vega"` = Base UI primitives + Vega visual style (§10 explains).
- `"tailwind.config": ""` is the v4 convention (no JS config; D-04 confirms).
- `"baseColor": "neutral"` is the closest match to DataPraat's warm-cool neutrals; values get overwritten by Layer 1+2 of `globals.css` regardless.
- `"iconLibrary": "lucide"` — shadcn's docs/snippets reference lucide-react. We don't import from it; D-07 ports prototype icons.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 with `tailwind.config.js` | Tailwind v4 `@theme` in CSS | early 2025 | No JS config; tokens live in CSS — D-04 already enforces |
| shadcn `default` style | shadcn `new-york` (renamed `vega` in v4) | 2025 | `default` deprecated; D-04 picks Vega ✓ |
| shadcn Toast (Radix-based) | shadcn Sonner | late 2025 | Toast deprecated; sonner is current — see §11 |
| shadcn v3 init writes hsl() vars | shadcn v4 init writes OKLCH vars | early 2026 | DataPraat overrides with hex per D-02; no impact on DataPraat usage |
| `npx shadcn-ui@latest` | `pnpm dlx shadcn@latest` (note the package rename: dropped `-ui` suffix) | 2024 | D-04 already uses correct package name |
| `@types/react-dom@18` for React 18 | `@types/react-dom@19.x` for React 19 | mid-2025 | Phase 1 already on React 19 line; Phase 2 testing-library aligns |
| `@testing-library/react@14` (React 18) | `@testing-library/react@16+` (React 19) | mid-2025 | Phase 2 picks v16.3.2 |

**Deprecated/outdated:**
- shadcn `toast` — replaced by `sonner` ([shadcn issue #7120](https://github.com/shadcn-ui/ui/issues/7120)).
- shadcn `default` style — replaced by `new-york`/`vega` ([shadcn theming docs](https://ui.shadcn.com/docs/theming)).
- Tailwind v3 `theme.extend.colors` — replaced by `@theme inline` in CSS.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 (Phase 1 pin) + jsdom 29.1.0 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` exists from Phase 1; Phase 2 extends `test.environment: "jsdom"` and `test.setupFiles: ["./vitest.setup.ts"]` |
| Quick run command | `pnpm exec vitest --run src/lib/format src/components/design` |
| Full suite command | `pnpm test:ci` (existing) |
| Phase gate | `pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm exec prettier --check . && pnpm test:ci && pnpm build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-02 | `bg-ink`, `text-ink-soft`, `border-line`, `ring-primary-soft` utilities resolve to prototype hex values | smoke (CSS-output grep) | `pnpm build && grep -E '\\.bg-ink\\b' .next/static/css/*.css` | ❌ Wave 0 |
| FOUND-03 | `pnpm dlx shadcn@latest add separator` exits 0 against a Phase-2 tree | manual (CLI smoke) | Documented in PLAN — human runs, no automation needed | n/a |
| DS-01 | `globals.css` contains every prototype `:root` variable (40+ entries) | unit (string presence in source file) | `pnpm exec vitest --run src/app/globals.css.test.ts` | ❌ Wave 0 |
| DS-02 | shadcn primitives import-resolve and snapshot-render | unit | `pnpm exec vitest --run src/components/ui` (one snapshot per primitive) | ❌ Wave 0 |
| DS-03a | `fmtEUR(7_200_000)` returns `"€ 7.200.000"`; same shape across 4 helpers | unit | `pnpm exec vitest --run src/lib/format/index.test.ts` | ❌ Wave 0 |
| DS-03b | `Icon` renders all 24 names without throwing; `IconName` exported | unit | `pnpm exec vitest --run src/components/design/Icon.test.tsx` | ❌ Wave 0 |
| DS-03c | `TrustBadge` renders correct tier class for scores 95/80/60 | unit | `pnpm exec vitest --run src/components/design/TrustBadge.test.tsx` | ❌ Wave 0 |
| DS-03d | `AskButton` stops click propagation; renders all sizes | unit | `pnpm exec vitest --run src/components/design/AskButton.test.tsx` | ❌ Wave 0 |
| DS-04 | `/internal/design` renders 200; section headings present | smoke | `pnpm dev` + manual visual + (optional) Playwright snapshot | manual |
| Side-by-side success criterion #1 | Tokens match prototype `Logos.html` swatch block | manual eyeball | screenshot pair in `VERIFICATION.md`; humans check | manual |

### Sampling Rate

- **Per task commit:** `pnpm exec vitest --run <files-touched>` (sub-30-second feedback)
- **Per wave merge:** `pnpm test:ci && pnpm exec tsc --noEmit && pnpm exec eslint .`
- **Phase gate:** Full suite green before `/gsd-verify-work` — adds `pnpm exec prettier --check . && pnpm build && bash scripts/check-standalone.sh` (existing Phase 1 step)

### Wave 0 Gaps

- [ ] `vitest.config.ts` — extend with `test.environment: "jsdom"`, `test.globals: true`, `test.setupFiles: ["./vitest.setup.ts"]`. Phase 1 only ran node-environment tests; Phase 2 adds DOM tests.
- [ ] `vitest.setup.ts` — import `@testing-library/jest-dom/vitest`; register `afterEach(cleanup)` from `@testing-library/react`.
- [ ] `src/lib/format/index.test.ts` — covers DS-03a (4 functions × 3 cases each).
- [ ] `src/components/design/Icon.test.tsx` — covers DS-03b (renders all names; exports `IconName`).
- [ ] `src/components/design/TrustBadge.test.tsx` — covers DS-03c (tier 95/80/60).
- [ ] `src/components/design/AskButton.test.tsx` — covers DS-03d (sizes; stopPropagation).
- [ ] Framework install: `pnpm add -D @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1 jsdom@29.1.0 @vitejs/plugin-react@6.0.1`
- [ ] (Optional) `src/app/globals.css.test.ts` — string-presence check on token names. Cheap regression net for "did someone delete `--ink-soft` by accident".

## Resolution: Base UI vs shadcn (CONTEXT.md ambiguity)

**Question raised in research scope:** PROJECT.md lists Base UI as a separate stack item alongside shadcn. CONTEXT.md mentions only shadcn primitives. Is Base UI installed in Phase 2 or deferred?

**Answer:** Base UI is installed in Phase 2 — implicitly, by `shadcn init --base base --style vega`. There is no second package called "Base UI" to install separately on top of shadcn.

**Why:** shadcn 4's `style` field uses the format `{library}-{style}`, where `{library}` is either `radix` or `base` (= [Base UI by MUI](https://base-ui.com)) and `{style}` is `vega` / `nova` / `maia` / etc. Sources:
- [shadcnblocks.com/blog/shadcn-component-styles-vega-nova-maia-lyra-mira](https://www.shadcnblocks.com/blog/shadcn-component-styles-vega-nova-maia-lyra-mira/) — explicitly lists `base-vega` as a valid combination.
- [shadcn changelog March 2026 — CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — `--base` flag chooses between Radix and Base UI primitives.

**However — current state of `base-*` styles in shadcn 4.5.0:** the Vega style under `base` is the same components as under `radix` (same JSX shape, same CVA variants), but the underlying primitive packages differ (`@base-ui/react-*` instead of `@radix-ui/react-*`). At the time of writing the Base UI port of every Vega primitive is not yet 100% complete on the shadcn registry — Dialog, Dropdown, Tabs, Tooltip, Separator are present; some less-common primitives may still resolve to Radix internals as a fallback. **Pragmatic recommendation:**
- Keep CONTEXT.md D-04 as written: `init --base base --style vega`.
- Pin `@radix-ui/*` versions as a safety net (the 9 primitives we install in Phase 2 will likely pull a mix of `@base-ui/react-*` and `@radix-ui/react-*` depending on registry coverage on the install date).
- During Plan execution, after `shadcn add`, inspect `package.json` to see what was actually pulled and document it in the plan SUMMARY. If a primitive resolves to Radix internally, that's not a regression — it's the same DX from the consumer side.

**No separate `base-ui` install needed.** PROJECT.md's "Base UI" line item is satisfied by the shadcn `--base base` flag.

## Open Questions (RESOLVED)

> Each researchable open question from the dispatch closes here with an explicit recommendation.

1. **Q: Complete current shadcn v4 base-vega CSS-variable list — what does `init` write today, and is CONTEXT.md D-01's alias enumeration complete?**
   **Recommendation:** §3 enumerates all 19 core + 8 sidebar + 5 chart variables Vega ships. CONTEXT.md D-01 is missing the 8 sidebar tokens and (technically) `--destructive-foreground` is absent from current shadcn theming docs (Vega uses `--destructive` alone). Use the §3 alias block as authoritative; CONTEXT.md D-01 is otherwise correct.

2. **Q: Exact pinned versions on 2026-04-28 for shadcn CLI, Tabler, Radix peer deps, CVA, clsx, tailwind-merge.**
   **Recommendation:** §1 table — all verified by `pnpm view <pkg> version` on 2026-04-28. shadcn 4.5.0, @tabler/icons-react 3.41.1, Radix Dialog 1.1.15, etc.

3. **Q: Tailwind 4 `@theme` directive — exact syntax, recognised namespaces, ordering.**
   **Recommendation:** §3 skeleton. Recognised namespaces: `--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--text-*` (font sizes), `--shadow-*`, `--breakpoint-*`. Use `@theme inline { ... }` (the `inline` modifier resolves `var()` at generation time) AFTER both `:root` blocks. Source: [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme).

4. **Q: shadcn v4 + Tailwind v4 init flow — what `components.json` shape does it write, where does it install, does it require `tailwind.config.*`?**
   **Recommendation:** §2 / §example components.json. No `tailwind.config.*` file (`"tailwind.config": ""` in components.json). Primitives install to `src/components/ui/*.tsx`. CLI writes `src/lib/utils.ts` with `cn()`.

5. **Q: `next/font` Fraunces variable axis declaration on Next.js 15.5.15.**
   **Recommendation:** `axes: ["opsz"]` is correct. See §5 / Pitfall 3. Subsetting + variable-axis works together. Use `subsets: ["latin", "latin-ext"]` for Dutch diacritics. Add a note that `font-variation-settings` is NOT auto-applied — consumers in Phase 6 (verhaal mode) must set it explicitly.

6. **Q: shadcn v4 toast — Radix-based or migrated to sonner?**
   **Recommendation:** **Migrate D-05 from `toast` to `sonner`.** [shadcn issue #7120](https://github.com/shadcn-ui/ui/issues/7120) confirms toast is deprecated; sonner is the current shadcn-blessed toast. Install command: `pnpm dlx shadcn@latest add sonner`. Pulls `sonner@2.0.7`. Net effect on Phase 2: still 9 primitives, `@radix-ui/react-toast` not installed.

7. **Q: Test scaffolding for components — Vitest 3.x + RTL — current setup story.**
   **Recommendation:** Use jsdom (not happy-dom — happy-dom has Web-API gaps that affect Tooltip/Dialog tests). `@testing-library/react@16.3.2` (React 19 line). Set `test.environment: "jsdom"` in `vitest.config.ts`; create `vitest.setup.ts` that imports `@testing-library/jest-dom/vitest`. Versions in §1.

8. **Q: `/internal/design` server component with narrow client islands — current best practice?**
   **Recommendation:** §architecture Pattern 2. One client island (`client-preview.tsx`) wrapping all interactive primitives (Dialog, Dropdown, Tabs, Tooltip, Sonner). Page itself is a server component. Avoids hydrating the entire page when only ~30% of it needs client JS. Anchor IDs for navigation: `#tokens`, `#typography`, `#custom`, `#shadcn`, `#trust`, `#format`.

9. **Q: `next/font` self-hosting — Google Fonts source still working in 2026-04-28?**
   **Recommendation:** Yes. Google Fonts has had outages, but `next/font` downloads at build time and self-hosts — runtime is independent. If a build fails because Google Fonts is down, retry the build. No fallback strategy needed in Phase 2.

10. **Q: Token migration tactics — globals.css order conventions; pitfalls (e.g. shadcn init overwriting it).**
    **Recommendation:** §architecture Pattern 1 + §pitfall 1. Order: `@import "tailwindcss"` → Layer 1 (prototype `:root`) → Layer 2 (alias `:root`) → `@theme inline` → Layer 4 (scoped classes). Run `shadcn init` BEFORE replacing globals.css with §3 skeleton. After init, `shadcn add` does not touch `globals.css`.

11. **Q: `pnpm.onlyBuiltDependencies` impact — Radix and shadcn deps need native rebuilds?**
    **Recommendation:** No. Radix UI and Base UI are pure JS/TS; only `better-sqlite3` (Phase 1) needs a native build. `pnpm.onlyBuiltDependencies` does not need extending in Phase 2.

12. **Q: Known issues installing shadcn 4 base-vega specifically (vs `default`) on Tailwind v4.**
    **Recommendation:** None blocking. `default` is deprecated upstream. `base-vega` is what shadcn 4.5.0 recommends when Base UI is the desired primitive library. Caveat noted in §10: not every primitive may have a Base-UI implementation yet; some fall back to Radix, which is fine — same DX.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `pnpm dlx shadcn@latest init --base base --style vega` writes a valid `components.json` with `style: "base-vega"` | §1, example components.json | Low. The CLI flag-to-style mapping is documented in the [shadcn v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4); planner may need to inspect the written file and adjust. |
| A2 | `next/font/google` `Fraunces` import name is `Fraunces` (PascalCase, no underscore) | §5 layout.tsx | Very low. Google Fonts naming → next/font follows underscore-for-spaces rule; "Fraunces" has no space. |
| A3 | `@vitejs/plugin-react@6.0.1` works under Vitest 3.2.4 | §1 test scaffolding | Low. Plugin is environment-agnostic; if v6 requires a higher Vitest, drop to `@vitejs/plugin-react@4.x`. |
| A4 | `latin-ext` subset covers all Dutch diacritics (ë, ï, é, à) | §5 + D-13 | Very low. `latin-ext` includes Latin Extended-A which covers all Dutch use cases; verified against [Google Fonts subsetting docs](https://fonts.google.com/knowledge/glossary/subsetting). |
| A5 | shadcn 4.5.0's `init` for Tailwind v4 writes `cssVariables: true` in components.json by default | example components.json | Low. Documented in shadcn theming docs. |
| A6 | `sonner@2.0.7` API is stable enough that the `Toaster` + imperative `toast()` pattern won't break in a 2.x patch release before Phase 7 | §1, §6 toast/sonner | Low. Sonner has a stable 2.x API; the package is a single-author project (Emil Kowalski) with consistent shape. |
| A7 | Tailwind v4 `@theme inline` namespace `--shadow-*` actually generates `shadow-{name}` utilities | §3 globals.css | Medium. Less commonly documented than `--color-*`. Verify with `pnpm build && grep shadow-drawer .next/static/css/*.css`. If utilities don't materialise, consumers of `shadow-drawer` use inline `style={{ boxShadow: 'var(--shadow-drawer)' }}` instead. Minor. |

**If a planner can't validate a Medium-risk assumption** (only A7 here): mitigation is the inline-style fallback. Phase 2 does not block on shadow utilities specifically.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 22 | Phase 1 carry-forward | ✓ | per `.nvmrc` | — |
| pnpm 10.30.2 | Phase 1 carry-forward | ✓ | `packageManager` pin | — |
| Network access to Google Fonts (build time) | `next/font/google` | ✓ (assumed) | — | Switch to `next/font/local` with downloaded `.woff2` files in `app/fonts/` |
| Network access to npm registry | `pnpm install`, `shadcn add` | ✓ | — | None (blocking) |
| Network access to ui.shadcn.com (registry pulls) | `shadcn add` | ✓ | — | None (blocking) |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** Google Fonts at build time — switch to `next/font/local` if Google Fonts is offline during a Phase 2 build.

## Sources

### Primary (HIGH confidence)
- [Next.js Font API Reference (v15)](https://nextjs.org/docs/app/api-reference/components/font) — official, current. Confirms `axes`, `subsets`, `variable`, multi-font setup.
- [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming) — canonical CSS variable list.
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — `@theme inline` pattern, components.json shape.
- [shadcn/ui changelog March 2026 — CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — `--base` flag, `--style` flag, `base-vega` combination.
- [Tailwind CSS v4 docs — Theme variables](https://tailwindcss.com/docs/theme) — namespace list (`--color-*`, `--radius-*`, `--spacing-*`, `--font-*`, `--breakpoint-*`).
- npm registry via `pnpm view <pkg> version` — every version pin in §1 verified live on 2026-04-28.

### Secondary (MEDIUM confidence)
- [shadcnblocks.com — Component Styles: Vega, Nova, Maia, Lyra, Mira](https://www.shadcnblocks.com/blog/shadcn-component-styles-vega-nova-maia-lyra-mira/) — community blog explaining `{library}-{style}` format. Cross-verified with shadcn changelog.
- [shadcn/ui issue #7120 — toast deprecation](https://github.com/shadcn-ui/ui/issues/7120) — official issue tracker confirms toast → sonner migration.
- [Vitest features docs](https://vitest.dev/guide/features) — Vitest + Testing Library + jsdom integration.
- [Next.js issue #64960 — variable axes](https://github.com/vercel/next.js/issues/64960) — documented gap in `axes` behavior.

### Tertiary (LOW confidence)
- DEV community Tailwind v4 migration posts — used only to triangulate; not authoritative on their own.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every version verified against npm registry on 2026-04-28; full peer-dep tree maps cleanly to Phase 1's pnpm-strict layout.
- Architecture: **HIGH** — globals.css skeleton derived from official shadcn + Tailwind docs + verbatim port of prototype `:root`.
- Pitfalls: **HIGH** — shadcn init overwrite, Tailwind v4 `@theme` requirement, toast deprecation are all documented in primary sources.
- `next/font` Fraunces opsz: **MEDIUM** — confirmed accepts `axes: ["opsz"]`, but consumer `font-variation-settings` behaviour is documented as a gap. Phase 2 doesn't depend on it; safe to land.
- Vitest + RTL React 19: **MEDIUM** — `@testing-library/react@16` is the React-19 line, jsdom 29 is current. Specific React-19 concurrent-mode edge cases are rare and not exercised by Phase 2's test surface.

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (~30 days; shadcn 4.x is stable; Tailwind 4 is stable; only `sonner` could plausibly cut a 3.x major in that window)
