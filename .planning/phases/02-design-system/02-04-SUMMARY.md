---
phase: 02-design-system
plan: 04
subsystem: shadcn-primitives-internal-design
tags: [wave-3, shadcn-add, base-vega, sonner, toaster, internal-design, server-component, client-island, design-system]

# Dependency graph
requires: [02-01, 02-02, 02-03]
provides:
  - "9 shadcn base-vega primitives at src/components/ui/{button,card,input,dialog,dropdown-menu,tabs,tooltip,separator,sonner}.tsx"
  - "Toaster mounted in src/app/layout.tsx for app-wide imperative toast() calls"
  - "/internal/design — living-reference page (server component with single client-island)"
  - "src/app/internal/design/{page.tsx, client-preview.tsx}"
  - "TrustBadge + AskButton marked 'use client' (Rule-1 prerender fix — both unconditionally declare event handlers)"
affects: [03-mcp-foundations, 04-chat-backbone, 05-trust-mark, 06-overzicht-live-vvd, 07-ops-polish]

# Tech tracking
tech-stack:
  added:
    - "sonner@2.0.7 (auto-pulled by shadcn add sonner; re-pinned exact)"
    - "next-themes@0.4.6 (auto-pulled — used by sonner.tsx for theme detection; re-pinned exact)"
  patterns:
    - "shadcn 4.5 base-vega primitives consume @base-ui/react/* (already at exact pin from Plan 02) — no @radix-ui/react-toast pulled (CONTEXT.md D-05 toast→sonner correction applied)"
    - "Single 'use client' island for all interactive shadcn primitives (Pattern 2 from RESEARCH.md) — minimal hydration cost, server-rendered everything else"
    - "Base UI render={<Button .../>} pattern for DialogTrigger/DropdownMenuTrigger/TooltipTrigger (shadcn 4.5 base-vega convention; differs from Radix asChild)"
    - "Hand-typed TOKENS array as source-of-truth duplicate of globals.css :root (D-15 + RESEARCH.md Q8 — no runtime getComputedStyle)"

key-files:
  created:
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/ui/input.tsx
    - src/components/ui/dialog.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/components/ui/tabs.tsx
    - src/components/ui/tooltip.tsx
    - src/components/ui/separator.tsx
    - src/components/ui/sonner.tsx
    - src/app/internal/design/page.tsx
    - src/app/internal/design/client-preview.tsx
    - .planning/phases/02-design-system/deferred-items.md
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/app/layout.tsx
    - src/components/design/TrustBadge.tsx
    - src/components/design/AskButton.tsx
    - src/lib/utils.ts

key-decisions:
  - "Ran `pnpm dlx shadcn@latest add button card input dialog dropdown-menu tabs tooltip sonner separator --yes` — single CLI invocation per RESEARCH.md §2 verbatim. All 9 primitives wrote against base-vega and consume @base-ui/react/* (no @radix-ui/* pulled)."
  - "Re-pinned sonner@2.0.7 and next-themes@0.4.6 to exact versions (shadcn wrote caret ranges); pnpm install --frozen-lockfile passes."
  - "Mounted <Toaster /> from @/components/ui/sonner in layout.tsx after {children} — single canonical hook for app-wide toast() calls. Did NOT add TooltipProvider at layout level (kept narrow scope inside client-preview.tsx)."
  - "[Rule 1 - Prerender bug] Added 'use client' to TrustBadge and AskButton. Both unconditionally declare inline `onClick={(e) => { e.stopPropagation(); onClick?.() }}` regardless of caller. Without 'use client', importing them into the server-component design page caused Next.js prerender to fail with `Event handlers cannot be passed to Client Component props`. Fix preserves the public API and keeps Plan 03's 12 component tests passing."
  - "Server/client split: page.tsx is fully server-rendered (TOKENS swatches, typography samples, Icon grid, TrustBadge tiers, AskButton sizes, Button variants+sizes, Card, Input, Separator, fmt helpers table all SSR). client-preview.tsx is the only 'use client' file — wraps Dialog/DropdownMenu/Tabs/Tooltip/Sonner with TooltipProvider."
  - "Used Base UI render={<Component />} pattern on DialogTrigger/DropdownMenuTrigger/TooltipTrigger because shadcn 4.5 base-vega Triggers expect Base UI's render prop (not Radix's asChild). Discovered by inspecting the shadcn-installed dialog.tsx (which uses `render={<Button .../>}` for DialogClose internally)."
  - "Applied prettier to shadcn-installed ui/* files (shadcn output is not prettier-aligned). 9 files reformatted in commit 6d66c27 — no functional changes."
  - "Fixed src/lib/utils.ts prettier non-compliance in passing (Plan 02 SUMMARY claimed prettier passed but only ran narrow checks; the 4-line file was missing trailing semicolons). Out-of-scope-of-this-plan but trivial Rule-3 cleanup."

requirements-completed: [FOUND-03, DS-02, DS-04]

# Metrics
duration: 9m26s
completed: 2026-04-28
---

# Phase 02 Plan 04: shadcn primitives + /internal/design Summary

**One-liner:** 9 shadcn base-vega primitives installed (sonner replacing toast per CONTEXT.md D-05 correction), `<Toaster />` mounted at root, and `/internal/design` server-component shipped with 6 anchor sections + a single `client-preview.tsx` island for interactive primitives — plus a Rule-1 fix making TrustBadge/AskButton client components since they unconditionally declare event handlers. Phase 2 ships.

## Performance

- **Duration:** ~9m 26s
- **Started:** 2026-04-28T10:59:12Z
- **Completed:** 2026-04-28T11:08:38Z
- **Tasks:** 3 / 3 (Task 3 auto-approved per `workflow.auto_advance: true`)
- **Files created:** 12 (9 shadcn primitives + 2 design page files + 1 deferred-items log)
- **Files modified:** 6 (package.json, pnpm-lock.yaml, layout.tsx, TrustBadge.tsx, AskButton.tsx, utils.ts)

## Accomplishments

- Installed 9 shadcn base-vega primitives via `pnpm dlx shadcn@latest add button card input dialog dropdown-menu tabs tooltip sonner separator --yes` in one CLI run. All 9 consume `@base-ui/react/*` (already at exact pin from Plan 02 — no new Base UI packages pulled). Critically: **no `@radix-ui/react-toast` was installed** — sonner replaces toast per CONTEXT.md D-05 correction.
- Re-pinned auto-pulled deps to exact versions: `sonner@2.0.7`, `next-themes@0.4.6` (used by `sonner.tsx` for theme detection). `pnpm install --frozen-lockfile` passes.
- Mounted `<Toaster />` from `@/components/ui/sonner` in `src/app/layout.tsx` after `{children}` — single app-wide hook for imperative `toast()` calls.
- Built **`src/app/internal/design/page.tsx`** as a server component with 6 stacked sections (anchor IDs `#tokens`, `#typography`, `#custom`, `#shadcn`, `#trust`, `#format`) + "Internal reference — link from team docs only" banner per CONTEXT.md D-16.
- Section 1 (Tokens & Colors): hand-typed `TOKENS` array with 31 swatches grouped Neutrals / Ink / Lines / Brand / Charts (PxQ) / Status / Gold — duplicates `globals.css` `:root` for inspection per D-15 + RESEARCH.md Q8.
- Section 2 (Typography): 8 type samples covering page-title, kpi-value (tabular-nums), card-title, body, section-label (uppercase), caption, Fraunces display (`fontVariationSettings: '"opsz" 32'`), JetBrains Mono mono-numeric.
- Section 3 (Custom primitives): 24-icon grid using all `IconName` values, 3 TrustBadge tiers (95/80/60 → good/warn/bad), 3 AskButton sizes (sm/md/lg).
- Section 4 (shadcn primitives): **BOTH** Button variants row (default / secondary / outline / ghost / destructive / link) AND Button sizes row (sm / md / lg / icon with `aria-label="zoeken"` + `<Icon name="search" />`) per D-15 explicit requirement. Card with header+content. Input with placeholder. ClientPreview island for interactive primitives.
- Section 5 (Trust mark legend): Dutch copy explaining ≥90 / ≥70 / <70 tier thresholds.
- Section 6 (Format helpers): 4-row table calling `fmtEUR(7_200_000)` / `fmtNum(28_400)` / `fmtPercent(0.85)` / `fmtCompact(7_200_000)` at SSR time.
- Built **`src/app/internal/design/client-preview.tsx`** as the single `"use client"` island — wraps Dialog (open trigger), DropdownMenu (3-action menu), Tabs (3 tabs: overzicht/prognose/trust), Tooltip (hover), and Sonner toast trigger inside one `TooltipProvider`. Uses Base UI `render={<Button .../>}` pattern for triggers (shadcn 4.5 base-vega convention).
- **[Rule 1] Added `"use client"` to TrustBadge and AskButton** — both Plan 03 components unconditionally declare inline `onClick={(e) => { e.stopPropagation(); onClick?.() }}` regardless of whether a caller passes `onClick`. Without the directive, the design page failed Next.js prerender with `Event handlers cannot be passed to Client Component props`. The fix preserves the public API; Plan 03's 12 component tests continue passing.
- **[Rule 1 - tooling cleanup] Fixed `src/lib/utils.ts` prettier non-compliance** in passing (4-line file missing trailing semicolons). Plan 02 SUMMARY claimed prettier passed but only ran narrow checks (`globals.css`, `format/index.ts`).
- Phase gate green: `tsc --noEmit` exit 0 · `eslint .` exit 0 (1 pre-existing config warning) · 45 tests across 10 files all GREEN · `next build` exit 0 with `/internal/design` route compiled (76.5 kB / 188 kB First Load JS, prerendered as static) · standalone bundle still emits.

## Task Commits

Each task committed atomically:

1. **Task 1: 9 shadcn primitives + Toaster mount** — `6d66c27` (feat)
2. **Task 2: /internal/design page.tsx + client-preview.tsx + Rule-1 fixes** — `04ee519` (feat)
3. **Task 3: Human-verify checkpoint** — auto-approved per `workflow.auto_advance: true`. No code commit (verification only).

## Dependencies pulled by `shadcn add` (the @radix-ui vs @base-ui mix per RESEARCH.md §10)

shadcn 4.5 base-vega style pulled **only `@base-ui/react/*` imports** for all 9 primitives. The package was already installed at exact pin `@base-ui/react@1.4.1` from Plan 02 (added during `shadcn init` for base-vega framework support).

| Primitive | Imports from |
|-----------|--------------|
| `button` | `@base-ui/react/button` |
| `card` | (none — pure HTML wrapper) |
| `input` | (none — pure HTML wrapper) |
| `dialog` | `@base-ui/react/dialog` |
| `dropdown-menu` | `@base-ui/react/menu` |
| `tabs` | `@base-ui/react/tabs` |
| `tooltip` | `@base-ui/react/tooltip` |
| `separator` | `@base-ui/react/separator` |
| `sonner` | `sonner@2.0.7` + `next-themes@0.4.6` + `lucide-react` (for the icon set) |

**Net dependency additions for Plan 04:** `sonner@2.0.7`, `next-themes@0.4.6`. No `@radix-ui/*` packages, no `@radix-ui/react-toast` (the toast→sonner correction is therefore confirmed at the dependency level — greppable: `! grep "react-toast" package.json` exits 1).

## CONTEXT.md corrections applied (NOT modifying CONTEXT.md)

Per Plan 02-01 SUMMARY's "Accepted Rule-3 Corrections from RESEARCH.md" — these are research-flagged corrections to CONTEXT.md decisions, applied across Plans 02 and 04:

1. **D-05 toast → sonner (applied this plan):** shadcn deprecated `toast` in favor of `sonner` ([shadcn issue #7120](https://github.com/shadcn-ui/ui/issues/7120)). Plan 04 ran `pnpm dlx shadcn@latest add sonner` (not `add toast`). Confirmed: `package.json` does NOT contain `@radix-ui/react-toast`. Imperative `toast()` import path: `import { toast } from "sonner"` (NOT `from "@/components/ui/sonner"` — only `Toaster` is from there).
2. **D-01 +8 sidebar aliases (applied Plan 02-02):** Vega ships 8 `--sidebar-*` variables; Layer 2 of `globals.css` now includes them so a future `shadcn add sidebar` doesn't fail theme resolution. Referenced here for the SUMMARY chain.

## Phase gate evidence

```
$ pnpm exec tsc --noEmit
(no output, exit 0)

$ pnpm exec eslint .
/Users/daan/.../eslint.config.mjs
  18:1  warning  Assign array to a variable before exporting as module default  import/no-anonymous-default-export
✖ 1 problem (0 errors, 1 warning)   ← pre-existing Phase 1 warning

$ pnpm test:ci
 Test Files  10 passed (10)
      Tests  45 passed (45)
   Duration  4.29s

$ pnpm build
Route (app)                                 Size  First Load JS
┌ ○ /                                      127 B         102 kB
├ ○ /_not-found                            993 B         103 kB
├ ƒ /api/health                            127 B         102 kB
└ ○ /internal/design                     76.5 kB         188 kB

$ bash scripts/check-standalone.sh
✓ .next/standalone/server.js exists
```

`pnpm exec prettier --check .` flags 16 pre-existing `.planning/*` files (modified externally during phase iteration). `src/lib/utils.ts` was the only in-source-tree non-compliance and was fixed in this plan. Out-of-scope `.planning/*` non-compliance documented in `deferred-items.md`.

## Decisions Made

- **Single CLI invocation for the 9 primitives:** RESEARCH.md §2 prescribed the verbatim command; the `--yes` flag avoided per-primitive prompts. Faster than 9 separate calls and produces a single `package.json` diff.
- **Re-pin auto-pulled caret ranges to exact:** `sonner@^2.0.7` → `2.0.7`, `next-themes@^0.4.6` → `0.4.6`. Phase 1's exact-pin policy holds; T-2-02 supply-chain mitigation requires no caret tolerance on direct deps.
- **Layout-level Toaster, not client-preview-level:** the canonical placement is one `<Toaster />` at the layout root. Client-preview's toast trigger (in section 4 of the design page) finds it via the implicit sonner emitter.
- **Did NOT mount TooltipProvider at layout level:** narrow scope (only inside `client-preview.tsx`). Wider scope risks breaking when Phases 4-7 use radically-different tooltip configs.
- **Rule-1 'use client' on TrustBadge + AskButton:** the alternative (making the inline onClick conditional on `props.onClick`) was considered but is intrusive — it changes the runtime behaviour (`stopPropagation` only fires when caller-onClick is present) and breaks the prototype contract that *every* TrustBadge/AskButton click stops propagation. The `"use client"` directive is the minimal correct fix and keeps the components useful from any caller (server or client).
- **Base UI render prop for triggers:** verified by inspecting the shadcn-installed `dialog.tsx` (which uses `render={<Button .../>}` for its own DialogClose). Differs from the Radix `asChild` idiom but is what shadcn 4.5 base-vega ships.
- **Hand-typed TOKENS array (not getComputedStyle):** D-15 + RESEARCH.md Q8 explicitly resolved this — runtime DOM reads aren't possible in a server component anyway, and the metadata duplicates `:root` so a future change-detector can compare statically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Prerender bug] TrustBadge and AskButton failed Next.js prerender**

- **Found during:** Task 2 first `pnpm build` after writing `page.tsx`.
- **Issue:** Build error: `Error: Event handlers cannot be passed to Client Component props. {className: ..., data-size: "sm", onClick: function onClick, role: ..., children: ...}`. Both `TrustBadge` and `AskButton` (from Plan 03) declare an *inline* `onClick={(e) => { e.stopPropagation(); onClick?.() }}` unconditionally — even when no caller-supplied `onClick` exists. Importing them into a server component (the design page) caused Next.js to try to serialize the synthesized event handler for hydration and fail.
- **Fix:** Added `"use client"` directive to `src/components/design/TrustBadge.tsx` and `src/components/design/AskButton.tsx`. Plan 03's contracts are preserved (the inline event handler still fires `stopPropagation` for every click, matching the prototype semantics); no public API change.
- **Files modified:** `src/components/design/TrustBadge.tsx`, `src/components/design/AskButton.tsx`.
- **Commit:** `04ee519` (Task 2).
- **Why this didn't surface in Plan 03:** Plan 03's tests render the components inside RTL (which always uses a client root), so the prerender path was never exercised. The first time TrustBadge/AskButton are rendered as descendants of a server component is on Plan 04's `/internal/design` page.

**2. [Rule 3 - Tooling alignment] shadcn output is not prettier-aligned**

- **Found during:** Task 1 `pnpm exec prettier --check src/components/ui`.
- **Issue:** All 9 shadcn-installed primitives use no trailing semicolons (different from prettier's default config with `semi: true`). Failed prettier check.
- **Fix:** Ran `pnpm exec prettier --write src/components/ui` to apply project formatting. No functional changes (whitespace + semicolons only). Re-running `prettier --check` exits 0.
- **Files modified:** all 9 of `src/components/ui/*.tsx`.
- **Commit:** `6d66c27` (Task 1).

**3. [Rule 3 - Tooling cleanup] src/lib/utils.ts prettier non-compliance**

- **Found during:** Task 3 phase-gate `pnpm exec prettier --check .`.
- **Issue:** Plan 02 SUMMARY claimed prettier passed but only ran narrow checks (`globals.css`, `format/index.ts`). `src/lib/utils.ts` (created by `shadcn init` in Plan 02) was missing trailing semicolons.
- **Fix:** Ran `pnpm exec prettier --write src/lib/utils.ts`. Trivial 4-line cleanup.
- **Files modified:** `src/lib/utils.ts`.
- **Commit:** included in the SUMMARY/state final commit.

**4. [Out-of-scope finding] 16 .planning/*.md files fail prettier**

- **Found during:** Task 3 phase-gate.
- **Issue:** External edits during phase iteration left 16 `.planning/*` files prettier-non-compliant.
- **Action:** Logged in `.planning/phases/02-design-system/deferred-items.md` per the executor's SCOPE BOUNDARY rule. Recommend a future ops pass either reformat or add `.planning/**/*.md` to `.prettierignore`.

## Authentication Gates

None. `/internal/design` is unauthenticated in v1 per CONTEXT.md D-16 (matches CLAUDE.md "Auth v1: None / shared-link"). The page banner reads "Internal reference — link from team docs only" — share via team docs only until auth lands in a later phase.

## Issues Encountered

- **`@base-ui/react/*` vs `@radix-ui/react-*` mix:** plan acceptance was authored anticipating either. Reality: shadcn 4.5 base-vega routes 100% through `@base-ui/react/*` for all 8 interactive/structural primitives (Card and Input are pure HTML wrappers). No Radix peer deps were pulled. Documented in the dep table above.
- **Base UI Trigger API differs from Radix:** initial draft used `<DialogTrigger asChild><Button .../></DialogTrigger>`. Build/typecheck flagged the Trigger.Props shape — Base UI uses `render={<Button />}` instead. Switched all three triggers (Dialog/DropdownMenu/Tooltip).

## Known Stubs

None. The `/internal/design` page is a functioning living-reference. All 6 sections render real content (real swatches, real type samples, real interactive primitives).

## CLAUDE.md compliance

- **Tech-stack discipline:** No AI SDK / MCP SDK / Recharts installed (still out of phase per CONTEXT.md `<deferred>`). Only `sonner@2.0.7` + `next-themes@0.4.6` added.
- **Dutch UI / English framework:** Banner copy ("Internal reference…"), trust mark legend (≥90/≥70/<70), placeholder ("Stel je vraag…"), tab labels (Overzicht/Prognose/Trust), card title (Voorbeeldkaart), button-icon `aria-label="zoeken"`, dropdown items (Eerste/Tweede/Derde actie), toast text — all Dutch. Type and component names — English.
- **No empty stubs:** all 9 shadcn primitives ship with real implementations from the registry; the design page renders all 6 sections; no placeholder text.
- **No `as any` / `@ts-ignore` / `@ts-expect-error`:** verified across all new files.

## Verification Performed

- **Task 1 acceptance:**
  - All 9 files exist at `src/components/ui/{button,card,input,dialog,dropdown-menu,tabs,tooltip,separator,sonner}.tsx`.
  - `src/components/ui/sonner.tsx` exports `Toaster` (greppable).
  - `src/app/layout.tsx` imports `Toaster` from `@/components/ui/sonner` and renders `<Toaster />` inside `<body>`.
  - `package.json` contains `sonner@2.0.7` exactly; does NOT contain `react-toast`.
  - 5 base-vega peer paths verified by inspecting primitive imports — all `@base-ui/react/*`.
  - `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint .` exit 0; `pnpm build` exit 0; `pnpm exec prettier --check src/app/layout.tsx src/components/ui` exit 0.
- **Task 2 acceptance:**
  - `page.tsx` is a server component (no `"use client"` — verified `grep -c '"use client"' = 0`).
  - `client-preview.tsx` has `"use client"` (verified `grep -c = 1`).
  - All 6 anchor IDs present (`id="tokens"` / `id="typography"` / `id="custom"` / `id="shadcn"` / `id="trust"` / `id="format"`).
  - All required imports present (design barrel, ui primitives, format helpers, ClientPreview).
  - "Internal reference" banner literal present.
  - 5 critical hex pins present (`#FCFBF8`, `#5E5A53`, `#4338CA`, `#3b82f6`, `#5E8A6D`).
  - Button variants: 6 variants visible (`default`, `variant="secondary"`, `variant="outline"`, `variant="ghost"`, `variant="destructive"`, `variant="link"`).
  - Button sizes (D-15 explicit): `size="sm"`, `size="lg"`, `size="icon"` all present + `aria-label="zoeken"` + `<Icon name="search" />`.
  - `client-preview.tsx` uses `TooltipProvider` and `import { toast } from "sonner"`.
  - `pnpm exec tsc --noEmit` exit 0; `pnpm exec eslint src/app/internal` exit 0; `pnpm build` exit 0 with `/internal/design` route in output.
- **Task 3 (auto-approved, full phase gate):**
  - `pnpm exec tsc --noEmit` exit 0.
  - `pnpm exec eslint .` exit 0 (1 pre-existing Phase 1 warning).
  - `pnpm test:ci` 10 files / 45 tests all GREEN (Plan 03's TrustBadge/AskButton tests still pass after `"use client"` addition).
  - `pnpm build` exit 0; `/internal/design` route prerendered as static (76.5 kB / 188 kB First Load JS).
  - `bash scripts/check-standalone.sh` exit 0.
  - `pnpm exec prettier --check .` flags 16 `.planning/*` files (pre-existing, out of scope, logged to `deferred-items.md`) and `src/lib/utils.ts` (fixed in this plan).

## Self-Check: PASSED

All claimed files verified to exist:

- `src/components/ui/button.tsx` — FOUND
- `src/components/ui/card.tsx` — FOUND
- `src/components/ui/input.tsx` — FOUND
- `src/components/ui/dialog.tsx` — FOUND
- `src/components/ui/dropdown-menu.tsx` — FOUND
- `src/components/ui/tabs.tsx` — FOUND
- `src/components/ui/tooltip.tsx` — FOUND
- `src/components/ui/separator.tsx` — FOUND
- `src/components/ui/sonner.tsx` — FOUND
- `src/app/internal/design/page.tsx` — FOUND
- `src/app/internal/design/client-preview.tsx` — FOUND
- `src/app/layout.tsx` (modified — Toaster mounted) — FOUND
- `src/components/design/TrustBadge.tsx` (modified — `"use client"`) — FOUND
- `src/components/design/AskButton.tsx` (modified — `"use client"`) — FOUND
- `src/lib/utils.ts` (modified — prettier cleanup) — FOUND
- `package.json` (modified — sonner + next-themes) — FOUND
- `pnpm-lock.yaml` (modified) — FOUND
- `.planning/phases/02-design-system/deferred-items.md` — FOUND

All claimed commits verified in `git log`:

- `6d66c27` — feat(02-04): add 9 shadcn primitives (sonner replacing toast) + mount Toaster — FOUND
- `04ee519` — feat(02-04): build /internal/design server component + client-preview island — FOUND

## Threat Flags

None new. Plan-level `<threat_model>` already accounts for all relevant boundaries:

- **T-2-01** (`/internal/design` info disclosure) — accepted v1 per CONTEXT.md D-16. Banner "Internal reference — link from team docs only" rendered. Page contains no PII / secrets / build SHA / env state — only design tokens and primitive demos.
- **T-2-02** (supply-chain — sonner + next-themes) — mitigated: both at exact pins (`2.0.7` / `0.4.6`); `pnpm-lock.yaml` committed; `pnpm install --frozen-lockfile` exits 0.
- **T-2-04** (static CSS class names) — accepted: ported verbatim from prototype, no template interpolation, no user input touches className.

## Phase 2 Closure

**All Phase 2 requirements complete:**

| Req | Status | Closing plan |
|-----|--------|--------------|
| FOUND-02 (tokens in @theme) | ✅ Complete | 02-02 |
| FOUND-03 (shadcn CLI works) | ✅ Complete | 02-04 (this plan) |
| DS-01 (tokens ported) | ✅ Complete | 02-02 |
| DS-02 (9 primitives) | ✅ Complete | 02-04 (this plan) |
| DS-03 (3 custom + 4 fmt) | ✅ Complete | 02-03 |
| DS-04 (/internal/design) | ✅ Complete | 02-04 (this plan) |

**Phase 2 leaves Phases 3 + 4 unblocked** per ROADMAP "Parallelization" section. Next step: `gsd-verifier` for Phase 2 sign-off.

## Next Plan

Phase 2 is the last plan in this phase. Next phase per ROADMAP: **Phase 3 — MCP Foundations** (or **Phase 4 — Chat Backbone**, since they parallelize after Phase 2).
