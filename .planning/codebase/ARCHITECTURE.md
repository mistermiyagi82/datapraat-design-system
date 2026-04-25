# Architecture

**Analysis Date:** 2026-04-25

## Pattern Overview

**Overall:** Browser-rendered React prototype using in-page Babel transpilation. No build system, no bundler, no `package.json`. The repo is a **design-system / clickable prototype** intended as a visual reference for a downstream Next.js production build (see `HANDOFF.md`).

**Key Characteristics:**
- Single-page React app (`DataPraat.html`) with all logic in `.jsx` files loaded via `<script type="text/babel" src="…">`
- **No ES modules, no imports.** Cross-file sharing happens by attaching components to `window.*` (a global registry pattern)
- **Single mock-data store** in `data.js` exposed as `window.DataPraatData` — every page reads from it; no fetching, no mutations
- React (18.3.1) + ReactDOM + Babel Standalone are loaded from unpkg CDN
- All styling is global CSS in `styles.css` consumed via CSS custom properties (`--primary`, `--ink`, `--chart-cost`, etc.)
- Multiple HTML files exist in parallel — each is its own self-contained "demo surface" (the prototype, the marketing site, the logo exploration, the printable one-pager)

## Layers

**HTML Entry Layer:**
- Purpose: Each `.html` is a standalone, openable document. There is no router; navigation between HTML files is only via opening another file in the browser.
- Location: project root
- Contains: `DataPraat.html` (the React prototype), `Logos.html` (logo exploration React app), `website.html` / `website v2.html` (static marketing pages), `woorden-modus-verkenning.html` (static page that loads `styles.css`), `DataPraat one-pager.html` and `DataPraat one-pager-print.html` (static one-pagers, fully self-contained CSS in `<style>`)

**Shell / Layout Layer (only consumed by `DataPraat.html`):**
- Purpose: Application chrome — sidebar nav, top bar, floating launcher
- Location: `shell.jsx`
- Exports: `window.Sidebar`, `window.MainHeader`, `window.Launcher`
- Depends on: `window.Icon` (from `shared.jsx`), `window.DataPraatData` (chat history, gemeente list)

**Shared Primitives Layer:**
- Purpose: Atoms and helpers used by every page
- Location: `shared.jsx`
- Exports: `window.Icon` (single SVG-icon component switching on `name` prop), `window.TrustBadge`, `window.AskButton`, `window.fmtEUR`, `window.fmtNum`, `window.fmtCompact`
- Depends on: React only

**Chart Primitives Layer:**
- Purpose: Hand-rolled mini SVG charts (no Recharts/D3 — pure inline SVG)
- Location: `charts.jsx`
- Exports: `window.BarChart`, `window.DoughnutChart`, `window.ForecastChart`, `window.SpreadChart`, `window.VolumeChart`, `window.PathwayChart`
- Depends on: `window.fmtCompact`

**Page Layer:**
- Purpose: One component per top-level navigation destination
- Location:
  - `pages.jsx` — `OverzichtPage`, `PrognosePage`, `ValidatiePage`, `BenchmarkPage`, `VerwijzersPage`
  - `klopt-dit.jsx` — `KloptDitPage` (plain-Dutch trust/lineage/validation unified view)
  - `scenario.jsx` — `ScenarioPage` ("wat als…?" forecast tweaker with knobs and presets)
  - `chat.jsx` — `ChatView` (full-page chat) and `AskDrawer` (right-side suggestion sheet)
  - `trust.jsx` — `TrustInspector` (drawer), `LineagePage`, `GlossaryPage`
  - `overzicht-modes.jsx` — alternative renderings of the Overzicht page in 11 different "tones" (Verhaal, Schaal, Verkeerslicht, Vergelijkend, Metafoor, Bullets, Dagboek, Weer, Brief, Dialoog, Poster) plus the `ModeSwitcher` dropdown that selects between them
- All page files attach their components to `window.*Page`/etc.

**Data Layer:**
- Purpose: Single static mock dataset for the fictional gemeente "Riemsterdal"
- Location: `data.js`
- Exports: `window.DataPraatData` — an object literal with `gemeente`, `overzichtKPIs`, `maandUitgaven`, `topCategorieen`, `forecastSeries`, `forecastBreaches`, `validatieIssues`, `benchmarkPeers`, `benchmarkSpread`, `benchmarkEigen`, `benchmarkVolume`, `verwijzers`, `chatHistory`, `suggestedQuestions`, `glossary45A12`, `trustInspector`
- Loaded as a plain `<script>` (not Babel) so it executes before the JSX modules

## Data Flow

**Page render flow (DataPraat.html only):**

1. `DataPraat.html` loads CDN React + Babel, then `data.js` (sets `window.DataPraatData`)
2. JSX files load in dependency order: `shared.jsx` → `charts.jsx` → `shell.jsx` → `overzicht-modes.jsx` → `pages.jsx` → `trust.jsx` → `klopt-dit.jsx` → `chat.jsx` → `scenario.jsx`. Each file attaches its exports to `window.*`.
3. The inline `<App/>` `<script type="text/babel">` block (`DataPraat.html` lines 31–159) defines the single root component, mounts it via `ReactDOM.createRoot(...)`
4. `App` holds top-level UI state in React `useState` — the active page, the inspected metric, the open drawer topic, the chat context, the tweaks panel
5. Each page reads `window.DataPraatData` directly inside its body — no props, no context, no store

**State & navigation:**

- `page` state in `App` is the router. Switch statements in `App` (`DataPraat.html` lines 91–104) map `page` strings to `<window.XxxPage/>` JSX
- `page` is persisted to `localStorage` under key `dp_page`
- Sidebar collapsed state is persisted under `dp_sb_collapsed` (set in `shell.jsx`)
- Overzicht "mode" (cijfers / verhaal / schaal / …) is persisted under `dp_overzicht_mode` (set in `pages.jsx`)
- Cmd/Ctrl+K is a global shortcut that switches to the chat page
- Drawers (`TrustInspector`, `AskDrawer`) are conditionally rendered when `inspectMetric` or `askTopic` state is non-null — they are not routed
- Chat seeding uses two side-channels: `window.__dpPendingQ` (the pending question to inject) and `window.__chatSeed` / `localStorage["dp_chat_seed"]` (initial messages)

**No data flow exists between HTML files.** `website.html`, `website v2.html`, `Logos.html`, `woorden-modus-verkenning.html`, and the one-pagers each open in isolation.

## Key Abstractions

**`window.*` global registry:**
- Purpose: Replace ES `import`/`export`. Every JSX file ends with `window.X = X;` lines so the next file can read them.
- Examples: `shared.jsx` (lines 70–75), `pages.jsx` (lines 442–446), `shell.jsx` (lines 194–196)
- Pattern: All cross-file references inside JSX use `<window.OverzichtPage …/>` rather than direct identifier — the JSX-level qualifier makes the global lookup explicit and survives Babel transpilation order.

**Universal "Ask" affordance:**
- Purpose: A single `AskButton` component (the orb-pill labelled "Vraag hierover") is reused on every KPI tile and chart card. Clicks bubble up to `App`, which sets `askTopic` state, which mounts `AskDrawer`. From there a question can be promoted to a full chat session.
- Files: `shared.jsx` (the button), `chat.jsx` (the drawer + full chat), `pages.jsx` / `overzicht-modes.jsx` / `scenario.jsx` (consumers)

**Trust hierarchy:**
- `TrustBadge` (inline pill) → `TrustInspector` (right drawer) → `KloptDitPage` (full-page plain-Dutch explanation) → `LineagePage` (full lineage view)
- The badge tier is computed inline: `score >= 90 → good`, `>= 70 → warn`, otherwise `bad` (`shared.jsx` line 41)

**"Modes" — multiple renderings of the same data:**
- The Overzicht page has 12 tonal variants. The default is `cijfers` (numbers/charts). The other 11 (`verhaal`, `schaal`, `verkeerslicht`, `vergelijkend`, `metafoor`, `bullets`, `dagboek`, `weer`, `brief`, `dialoog`, `poster`) live in `overzicht-modes.jsx` and are picked through `ModeSwitcher`. Each mode reads from the same `window.DataPraatData` and re-presents it.
- `OverzichtPage` (`pages.jsx` lines 4–47) early-returns into the matching `<window.XxxMode/>` when `mode !== "cijfers"`.

## Entry Points

**`DataPraat.html`:**
- Location: project root
- Triggers: opening the file in a browser
- Responsibilities: load CDN deps, load all JSX files in order, mount `<App/>` into `#root`, define the inline `App` router

**`Logos.html`:**
- Location: project root
- Triggers: opening the file in a browser
- Responsibilities: separate React app that loads only `design-canvas.jsx` and renders inline-defined `LogoBoard` + concept components. Uses the "omelette" host bridge (`window.omelette`) for state persistence — see `design-canvas.jsx` line 101.

**`website.html`, `website v2.html`, `woorden-modus-verkenning.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`:**
- Location: project root
- Triggers: opening directly
- Responsibilities: static HTML — no React. `woorden-modus-verkenning.html` links to the shared `styles.css`; the others define all CSS inline via `<style>` so they are fully self-contained.

## Error Handling

**Strategy:** Best-effort, prototype-grade. There is no error-boundary, no try/catch around fetches (there are no fetches), no logging.

**Patterns:**
- `try/catch` only around `JSON.parse` of localStorage values to fall back to defaults (`shell.jsx` lines 6–9, `chat.jsx` lines 6–11)
- Optional chaining and nullish coalescing for "safe" data lookups (e.g. `window.DataPraatData.trustInspector[metricId] || …uitgaven_ytd` in `trust.jsx` line 5)
- Charts assume non-null inputs and would throw on missing data

## Cross-Cutting Concerns

**Iframe edit-mode protocol:**
- `DataPraat.html` lines 53–68 implement a `postMessage` contract with a parent window (presumably an editor tooling host). Messages: `__edit_mode_available`, `__activate_edit_mode`, `__deactivate_edit_mode`, `__edit_mode_set_keys`. The "Tweaks" panel (density toggle) writes back to the parent via this channel.
- A magic comment range `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` (line 34) marks where the host can patch defaults.

**Persistence:** localStorage only. Keys: `dp_page`, `dp_sb_collapsed`, `dp_overzicht_mode`, `dp_chat_seed`.

**Styling tokens:** All visual decisions go through CSS custom properties defined at `:root` in `styles.css` (lines 1–80) — colors, spacing, radius, fonts, shadows. Components reference them as `var(--primary)`, `var(--chart-cost)`, etc.

**Localization:** Hard-coded Dutch (NL) throughout. Number formatting uses `Intl.NumberFormat("nl-NL", …)` in `shared.jsx`.

**Chat / Claude integration:** `chat.jsx` defines a `systemPrompt` constant (`chat.jsx` lines 33+) but the file is a UI mockup — there is no actual Anthropic API call wired in this codebase.

---

*Architecture analysis: 2026-04-25*
