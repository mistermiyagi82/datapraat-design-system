<!-- GSD:project-start source:PROJECT.md -->
## Project

**DataPraat**

DataPraat is a conversational data product that lets municipal staff "talk to their data" — ask questions in plain Dutch and get back live charts, validations, and what-if scenarios. It is sold to **data consultancies and data companies** who deliver it to their **municipal customers**. The Zeeuwse Jeugdzorg (VVD) dataset is the first demo / reference deployment, not the product identity — the app is dataset-agnostic and configured per customer via MCP servers.

This repo is the **fresh DataPraat product app**: a single Next.js 15 application that hosts both the marketing site and the application surface, sharing one design system. It uses the proven `vibathon-knowledgegraph` repo as an architectural blueprint but rebuilds clean on current versions of every major library.

**Core Value:** **A municipality user opens DataPraat, asks a question about their data in plain Dutch, and gets back a correct, trust-marked chart with conversation continuity.** If chat-with-generative-charts doesn't work end-to-end, nothing else matters.

### Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript 5 (strict), Tailwind 4, shadcn 4 (`base-vega`), Base UI, AI SDK 5, MCP SDK, Recharts 3, Tabler Icons, Zod, better-sqlite3 — Updated from vibathon's pinned versions because the user explicitly asked to refresh React/shadcn/Recharts/etc. Use current stable releases at project start.
- **Runtime**: Node 22 — Matches vibathon and Railway/Azure base images.
- **Hosting (v1)**: Railway with Nixpacks + `/data` volume — Mirrors vibathon. Proven path. Migrates to Azure Container Apps + Azure Files cleanly.
- **Hosting (later)**: Azure (Container Apps or App Service) — Customer environments are Azure. Avoid Vercel-specific APIs (Edge runtime, KV, Blob) so the lift is mechanical, not a rewrite.
- **Persistence**: sqlite (better-sqlite3) on volume — Cheap, simple, fits both Railway and Azure Files. Behind a storage abstraction so swap to Postgres is a one-day migration.
- **Language**: Dutch in UI copy and domain identifiers; English in framework/utility code (matches prototype convention documented in `.planning/codebase/CONVENTIONS.md`).
- **Auth (v1)**: None / shared-link — Demo audience. Architect for NextAuth or similar later.
- **Build philosophy**: Clean rebuild, prototype is reference-only — Don't try to port `window.*` globals or Babel-Standalone patterns. Use ES modules, RSC, and proper TS imports.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- HTML5 — Standalone prototype/demo pages at the project root (`DataPraat.html`, `Logos.html`, `website.html`, `website v2.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, `woorden-modus-verkenning.html`)
- JSX (React, in-browser Babel-compiled) — Component source files at the project root (`shared.jsx`, `shell.jsx`, `charts.jsx`, `pages.jsx`, `chat.jsx`, `trust.jsx`, `klopt-dit.jsx`, `scenario.jsx`, `overzicht-modes.jsx`, `design-canvas.jsx`)
- CSS3 — Single token-driven stylesheet `styles.css` (1698 lines) plus large inline `<style>` blocks in marketing/print HTML pages
- JavaScript (ES2020+) — Mock data attached to `window.DataPraatData` in `data.js`
- Markdown — Design documentation at the project root (`COMPONENTS.md`, `HANDOFF.md`) and brand guides under `uploads/` (`uploads/datapraat-brand-guide-v1.1.md`, `uploads/datapraat-brand-guide-v1.1-19f5247b.md`, `uploads/datapraat-build-spec.md`, `uploads/brand-guide-template.md`)
- TypeScript — Not present in this repo (only mentioned in `HANDOFF.md` as a target stack for the future Next.js implementation)
## Runtime
- Browser-only. Pages are designed to be opened directly via `file://` or served by any static HTTP server. No Node.js runtime is invoked.
- None. There is no `package.json`, `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Dependencies are loaded from CDN at runtime.
- None.
## Frameworks
- React 18.3.1 (UMD development build) — Loaded from `https://unpkg.com/react@18.3.1/umd/react.development.js` in `DataPraat.html` (line 12) and `Logos.html` (line 159)
- ReactDOM 18.3.1 (UMD development build) — Loaded from `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js` in `DataPraat.html` (line 13) and `Logos.html` (line 160). Mounted via `ReactDOM.createRoot(document.getElementById("root")).render(<App/>)` (e.g. `DataPraat.html` line 159, `Logos.html` line 1486)
- Babel Standalone 7.29.0 — Loaded from `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js`. JSX files are referenced with `<script type="text/babel" src="...jsx">` and transpiled in-browser at page load.
- React hooks are pulled from the global `React` namespace (e.g. `shared.jsx` line 2: `const { useState, useEffect, useRef, useMemo, useCallback } = React;`). No ES module imports — every `.jsx` file relies on globals exposed by previously-loaded scripts.
- Not detected. No test runner, no test files, no test config.
- None. There is no bundler (Vite, Webpack, esbuild, Rollup, Parcel), no transpiler step, no task runner, no Tailwind/PostCSS pipeline. CSS is hand-authored against custom properties; JSX is transformed in-browser by `@babel/standalone`. Cache-busting is done with manual querystring versions like `styles.css?v=22` (`DataPraat.html` line 11) and `styles.css?v=18` (`woorden-modus-verkenning.html` line 10).
## Key Dependencies
- `react@18.3.1` — Component runtime. SRI hash `sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L`.
- `react-dom@18.3.1` — DOM renderer. SRI hash `sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm`.
- `@babel/standalone@7.29.0` — In-browser JSX/ES transform. SRI hash `sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y`.
- None. shadcn/ui, Radix, lucide-react, Recharts, framer-motion, etc. are listed only as future targets in `HANDOFF.md`. The current code uses no third-party UI primitives.
- Hand-rolled SVG charts in `charts.jsx`. Comment on line 3: `// ---- Mini SVG charts (no external lib) ----`. Bar/line/donut/forecast charts are constructed from raw `<svg>`, `<rect>`, `<polyline>`, `<circle>` elements using inline scaling math.
- Hand-rolled inline SVG `<Icon>` component in `shared.jsx` (lines 5–35). Icon shapes are inlined as JSX `<g>`/`<path>` definitions on a 16×16 viewBox with `strokeWidth="1.5"`. No icon library is loaded. Names include: `overzicht`, `prognose`, `validatie`, `benchmark`, `verwijzers`, `lineage`, `glossary`, `regels`, `plus`, `chevron`, `close`, `send`, `search`, `info`, `arrow`, `back`, `sparkle`, `pin`, `bolt`, `more`, `chat`, `export`, `copy`, `check`.
## CSS Approach
## Fonts
- **Inter** — Primary sans. Weights vary per page: 300/400/500/600/700 (most pages) and 300/400/500/600/700/800 (`Logos.html`).
- **Fraunces** — Display serif. Loaded with optical-size axis (`opsz,wght@9..144,...`). Weights 300–600 on most pages; 400–700 on `Logos.html`.
- **JetBrains Mono** — Mono. Weights 400/500 (most pages); 400/500/600 on `Logos.html`.
- `--f-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;`
- `--f-serif: "Inter", ui-sans-serif, system-ui, sans-serif;` (note: `--f-serif` falls back to Inter despite the name; "Fraunces" is referenced directly in component selectors, e.g. `styles.css` lines 808, 946, 1109, 1193 — `font-family: "Fraunces", ui-serif, Georgia, serif;`)
- `--f-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;`
- Page-scoped overrides on the marketing pages also reference `--f-display` and `--f-body` (`styles.css` lines 1295, 1385, 1616).
## Configuration
- None. No `.env`, no `.env.example`. The `.gitignore` (`.gitignore`) only ignores `.DS_Store`.
- All "data" is mocked in `data.js` and bound to `window.DataPraatData` (line 4 of `data.js`).
- No build configs. No `tsconfig.json`, no `vite.config.*`, no `webpack.config.*`, no `babel.config.*`, no `tailwind.config.*`, no `postcss.config.*`, no `eslint.config.*`, no `.prettierrc`, no `.editorconfig`, no `.nvmrc`.
- The only "config" is the manual `?v=N` cache-busting suffix on `styles.css` link tags.
## Platform Requirements
- Modern browser with ES2020+ support and access to `unpkg.com` and `fonts.googleapis.com` (Babel Standalone, React UMD, and Google Fonts all require live network access).
- Optional: any static file server (e.g. `python -m http.server`, `npx serve`) — needed if the browser blocks `<script src="...jsx">` on `file://` due to CORS/MIME restrictions.
- Not deployed from this repo. `HANDOFF.md` describes a future production rebuild on Next.js 15 + Tailwind + shadcn/ui + Recharts. The current artifact is a design/prototype handoff package only.
## Repository Role
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language & Module Style
- `shared.jsx:2` — `const { useState, useEffect, useRef, useMemo, useCallback } = React;`
- `shell.jsx:2` — `const { useState: useStateSB, useRef: useRefSB, useEffect: useEffectSB } = React;` (suffix `SB` = Sidebar)
- `chat.jsx:5` — uses `React.useState(...)` inline (no destructure)
- `pages.jsx:7` — uses `React.useState(...)` inline
## Component Shape
## Hooks Usage
- `useState` with **lazy initializer reading `localStorage`**, wrapped in `try/catch`:
- `useEffect` paired with `localStorage.setItem` to **persist state on change**: `pages.jsx:8`, `DataPraat.html:46`, `DataPraat.html:49-51`.
- **Outside-click detection** uses a `useRef` + `mousedown` listener inside `useEffect`, registered on `window` and torn down in cleanup (`shell.jsx:14-21`, `overzicht-modes.jsx:23-28`). Re-use this pattern for new dropdowns/menus.
- **Keyboard shortcuts** registered on `window.addEventListener("keydown", …)` inside `useEffect` (`DataPraat.html:71-81`).
- **`React.useMemo` for derived strings** (`chat.jsx:18-27`).
- **`React.useRef` for scroll containers** with auto-scroll-to-bottom in `useEffect` (`chat.jsx:15`, `chat.jsx:29-31`).
- **Async work inside event handlers**, not `useEffect` — see `send` in `chat.jsx:72-92`. `try / catch / finally` is the standard error shape.
## Data Layer
## JSX Style
- **Double quotes for JSX attribute strings**, double quotes for JS string literals.
- **Inline styles are heavy and accepted.** Many components mix `className` for "structural" styles with `style={{...}}` for one-off positioning (e.g. `chat.jsx:99`, `trust.jsx:12-31`). Use inline styles for ad-hoc tweaks; promote to `styles.css` once a pattern repeats.
- **Inline event handlers as arrow functions are normal**: `onClick={() => onNav(e.id)}` (`shell.jsx:129`).
- **Conditional rendering uses `&&` and ternaries inline**, including multi-branch ternaries (`shell.jsx:96-99`, `chat.jsx:235-237`).
- **Lists keyed by index `i`** when the array is static-shaped (`charts.jsx:13`, `chat.jsx:115`); keyed by domain id when stable (`shell.jsx:91` `key={g.naam}`, `pages.jsx:71` `key={k.id}`).
- **CSS variables referenced from JSX** as `"var(--primary)"` for SVG `fill`/`stroke` (`charts.jsx:14`, `charts.jsx:27`).
- **Density attribute on `<html>`**: `data-density="comfortable" | "compact"` set imperatively in `DataPraat.html:50`. CSS responds via `[data-density="compact"]` selectors.
## Naming Conventions
| Kind | Case | Example |
|------|------|---------|
| Component | `PascalCase` | `Sidebar`, `BarChart`, `OverzichtPage`, `TrustInspector`, `AskDrawer`, `ModeSwitcher` |
| Component file | `kebab-case.jsx` | `klopt-dit.jsx`, `overzicht-modes.jsx`, `design-canvas.jsx`; single-word files lowercase: `shell.jsx`, `pages.jsx`, `trust.jsx`, `chat.jsx`, `charts.jsx`, `shared.jsx`, `scenario.jsx` |
| Function / variable | `camelCase` | `fmtEUR`, `openNewChat`, `setTweak`, `gemeenteRef`, `chatBadge` |
| Constants (module-level config arrays) | `UPPER_SNAKE` | `OM_MODES` (`overzicht-modes.jsx:5`), `TWEAKS_DEFAULTS` (`DataPraat.html:34`) |
| CSS classes | `kebab-case`, BEM-ish with hyphen-only | `.sb-gemeente-menu-foot`, `.kpi-foot`, `.msg-ai-h`, `.om-bullet-marker.ok` |
| CSS custom properties | `kebab-case` with semantic prefix | `--ink-soft`, `--primary-tint`, `--chart-cost`, `--r-md`, `--s-lg`, `--f-sans` |
| HTML id / data attr | `kebab-case` | `id="root"`, `data-density`, `data-screen-label` |
| `localStorage` keys | `snake_case` with `dp_` prefix | `dp_page`, `dp_sb_collapsed`, `dp_overzicht_mode`, `dp_chat_seed` |
| Window globals (transient) | `__dpCamel` (double-underscore + dp prefix) | `window.__dpPendingQ`, `window.__chatSeed` |
- `.sb-*` — sidebar
- `.kpi-*` — KPI tile
- `.card`, `.card-h`, `.card-actions` — generic card
- `.msg-*` / `.chat-*` — chat view
- `.drawer`, `.drawer-h`, `.drawer-x`, `.drawer-body` — drawer
- `.om-*` — Overzicht-Modes ("toon-als" feature)
- `.sc-*` — Scenario page
- `.ask-btn`, `.ask-btn-sm/md/lg` — universal Ask button (size modifiers as suffix, not BEM `__`/`--`)
- State modifiers as **second class**, not `--state`: `.kpi-delta.good`, `.trust.warn`, `.sb-item.active`, `.om-opt.active`, `.badge.good`, `.om-light-dot.act`.
## Dutch vs English in Identifiers
- **Domain / business vocabulary → Dutch** (Jeugdzorg, gemeenten, government context):
- **Generic technical / framework vocabulary → English**:
- **UI labels / menu strings → Dutch** (`shell.jsx:50-58`: "Overzicht", "Prognose", "Klopt dit?", "Datavalidatie", "Glossary"; `chat.jsx:88` "Er ging iets mis").
- **Comments → mostly Dutch**, often informal (`shell.jsx:31` "Andere Zeeuwse gemeenten — demo-lijst", `shared.jsx:49-50` "Ask button — universele 'vraag hierover' knop. Gebruikt op: KPI-tegels, ...").
## Number, Currency, Locale
- `fmtEUR(n)` — `Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })`
- `fmtNum(n)` — `Intl.NumberFormat("nl-NL")`
- `fmtCompact(n)` — `€7,2M` / `€450K` / fallback to `fmtEUR`
## CSS Organization (`styles.css`, 1698 lines, single file)
| Group | Variables | Purpose |
|-------|-----------|---------|
| Neutrals | `--bg`, `--bg-soft`, `--surface`, `--surface-raised` | Page / sidebar / card backgrounds (warm-cool palette, no pure white/black) |
| Ink (text) | `--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint` | Body text → faint hints. 4 levels of contrast. |
| Lines | `--line`, `--line-soft`, `--line-strong` | Border weights. |
| Brand | `--primary` (`#4338CA`), `--primary-soft`, `--primary-tint`, `--primary-ink`, `--primary-foreground` | Indigo brand. |
| Charts | `--chart-cost`, `--chart-volume`, `--chart-price`, `--chart-1` … `--chart-5` | PxQ semantics: blue=cost, green=volume, orange=price; `chart-1..5` is a sequential blue ramp. |
| Status | `--success`, `--success-tint`, `--success-strong`; same triple for `--warning` and `--destructive`; `--gold`, `--gold-tint` | Each status has *base / tint / strong* — use `tint` for backgrounds, `strong` for text-on-tint. See `.trust.good`, `.badge.warn`, `.kpi-delta.bad` (`styles.css:417-422`). |
| Radii | `--r-sm` (4) `--r-md` (8) `--r-lg` (14) `--r-xl` (20) | Always use these tokens. |
| Spacing | `--s-xs` (4) `--s-sm` (8) `--s-md` (12) `--s-lg` (20) `--s-xl` (32) `--s-2xl` (48) | 4-pt-ish scale. *Note: many existing rules still hard-code px paddings (`padding: 16px 12px`); follow tokens for new code.* |
| Fonts | `--f-sans` (Inter), `--f-serif` (Inter — note: serif uses Inter, narrative modes use literal `"Fraunces"`), `--f-mono` (JetBrains Mono) | Inter is loaded with feature-settings `ss01, cv11`. |
| Shadows | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-drawer` | All warm-tinted (`rgba(26,24,20, …)`). |
- Page title: 24px / 600 / `letter-spacing: -0.015em` (`.page-title`, `styles.css:373`)
- KPI value: 28px / 600 / `tabular-nums` (`.kpi-value`, `styles.css:445`)
- Card title: 14px / 600 (`.card-title`, `styles.css:471`)
- Body / default: 14px / 1.5 (`body`, `styles.css:88-89`)
- Section labels (uppercase): 11px / 500 / `text-transform: uppercase` / `letter-spacing: 0.06–0.12em` (e.g. `.sb-section-title`, `styles.css:230-237`)
- Captions / meta: 11–12.5px / `var(--ink-mute)`
- Mono numbers: `font-family: var(--f-mono)` + `font-variant-numeric: tabular-nums`
- Single-class selectors prevail; specificity stays low.
- State as a *second* class on the same element: `.kpi-delta.good`, `.trust.warn`, `.sb-item.active`, `.om-opt.active`, `.om-light-dot.ok`. Don't use BEM `--modifier`.
- Children are matched by descendant selector, not nesting (no Sass): `.tbl th { … }`, `.kpi-foot .kpi-delta { … }`.
- Pseudo-classes: `:hover` is heavily used; `:focus` is rare (only `.sc-save-form input:focus`, `styles.css:1622-1626`) — accessibility gap noted in CONCERNS, but follow the existing pattern when extending.
## HTML Structure
- `DataPraat.html` — the React app shell.
- `Logos.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, `website.html`, `website v2.html`, `woorden-modus-verkenning.html` — static / standalone pages, each with their own `<style>` block.
- `lang="nl"` on the root — primary user language is Dutch.
- `data-density` is the only HTML-level "tweak" attribute, set imperatively at runtime (`DataPraat.html:50`).
- React, ReactDOM, Babel-Standalone are loaded from **unpkg** with **SRI integrity hashes** and `crossorigin="anonymous"`. Keep both when adding new CDN scripts.
- `data.js` is a regular `<script>` so it executes before the Babel-compiled JSX modules.
- All `.jsx` files are loaded as `<script type="text/babel" src="…">` in dependency order in the `<body>`. Add new JSX files to the list after the files they depend on.
- The app mounts to `<div id="root"></div>` via `ReactDOM.createRoot(...).render(<App/>)` in an inline `<script type="text/babel">` block (`DataPraat.html:159`).
- A "tweaks" sentinel `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` (`DataPraat.html:34-36`) marks the editable defaults block — **don't rename or remove these markers**; they are part of an `__activate_edit_mode` postMessage protocol with the parent frame.
## Comments
- File-level rationale: `data.js:1-2` `// DataPraat — mock data voor Riemsterdal (fictieve gemeente) // Alle getallen zijn realistisch voor een gemeente van ~28.400 inwoners`
- Section banners inside JSX: `// ===== OVERZICHT =====` (`pages.jsx:3`), `// ===== TRUST INSPECTOR DRAWER =====` (`trust.jsx:3`), `// ===== PER-CHART ASK DRAWER =====` (`chat.jsx:193`)
- Hat-tip comments above complex regions: `// ---- SVG icons (stroke 1.5, 16x16) ----` (`shared.jsx:4`), `// ---- Format helpers (NL locale) ----` (`shared.jsx:61`)
- Design rationale in CSS: `--bg: #FCFBF8; /* main area — bijna wit met vleugje warmte */` (`styles.css:5`)
- Brand-decision callouts: `/* neutrals — lichter, koeler (afwijking v1.1: minder warm papier, meer grijs/wit) */` (`styles.css:4`)
- Inline lint disables: `// eslint-disable-next-line` (`chat.jsx:69`) — present despite no ESLint config, suggesting an editor-level lint expectation.
- Dutch is fine and matches the codebase voice.
- Use section banners (`// ===== NAME =====` or `// ---- name ----`) when introducing a new logical block in a JSX file.
- Document **the reason for a value or decision** (especially design tokens), not the syntax.
- Don't add JSDoc-style `@param` comments — there is no precedent and no tooling that consumes them.
## Linting / Formatting
- 2-space indentation.
- Double quotes for strings (both JS and JSX attributes); back-ticks for template strings.
- Semicolons at end of statements.
- Trailing commas inside multi-line object/array literals (`data.js:5-13`, `pages.jsx:71`).
- Spaces inside JSX attribute braces: `onClick={() => ...}` (no inner-space convention enforced).
- Long lines are tolerated (the icon `paths` map in `shared.jsx:7-30` runs ~250 chars per line).
## Where to Put New Code
| You are adding… | Put it in |
|-----------------|-----------|
| A new design token (colour, radius, font) | `:root` block at top of `styles.css` |
| A small reusable visual primitive (badge, button, icon) | `shared.jsx` and attach to `window` |
| A new SVG chart | `charts.jsx` and attach to `window` |
| App chrome (header / sidebar / launcher) | `shell.jsx` |
| A new top-level page | a new `kebab-case.jsx` file, attached as `window.SomethingPage`, registered in the router in `DataPraat.html:91-104`, and added to the `<script type="text/babel" src=…>` list in `DataPraat.html:21-29` |
| A page-specific drawer / modal | the same file as the page that opens it (`AskDrawer` lives in `chat.jsx`, `TrustInspector` in `trust.jsx`) |
| Mock data / business numbers | extend the object literal in `data.js` |
| CSS for a new feature | append to `styles.css` under a new `/* ==== Feature name ==== */` banner with its own class prefix; bump `?v=` in `DataPraat.html:10` |
| Persisted user preference | `localStorage` with `dp_` prefix, lazy-init in `useState`, persist in a `useEffect` |
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Single-page React app (`DataPraat.html`) with all logic in `.jsx` files loaded via `<script type="text/babel" src="…">`
- **No ES modules, no imports.** Cross-file sharing happens by attaching components to `window.*` (a global registry pattern)
- **Single mock-data store** in `data.js` exposed as `window.DataPraatData` — every page reads from it; no fetching, no mutations
- React (18.3.1) + ReactDOM + Babel Standalone are loaded from unpkg CDN
- All styling is global CSS in `styles.css` consumed via CSS custom properties (`--primary`, `--ink`, `--chart-cost`, etc.)
- Multiple HTML files exist in parallel — each is its own self-contained "demo surface" (the prototype, the marketing site, the logo exploration, the printable one-pager)
## Layers
- Purpose: Each `.html` is a standalone, openable document. There is no router; navigation between HTML files is only via opening another file in the browser.
- Location: project root
- Contains: `DataPraat.html` (the React prototype), `Logos.html` (logo exploration React app), `website.html` / `website v2.html` (static marketing pages), `woorden-modus-verkenning.html` (static page that loads `styles.css`), `DataPraat one-pager.html` and `DataPraat one-pager-print.html` (static one-pagers, fully self-contained CSS in `<style>`)
- Purpose: Application chrome — sidebar nav, top bar, floating launcher
- Location: `shell.jsx`
- Exports: `window.Sidebar`, `window.MainHeader`, `window.Launcher`
- Depends on: `window.Icon` (from `shared.jsx`), `window.DataPraatData` (chat history, gemeente list)
- Purpose: Atoms and helpers used by every page
- Location: `shared.jsx`
- Exports: `window.Icon` (single SVG-icon component switching on `name` prop), `window.TrustBadge`, `window.AskButton`, `window.fmtEUR`, `window.fmtNum`, `window.fmtCompact`
- Depends on: React only
- Purpose: Hand-rolled mini SVG charts (no Recharts/D3 — pure inline SVG)
- Location: `charts.jsx`
- Exports: `window.BarChart`, `window.DoughnutChart`, `window.ForecastChart`, `window.SpreadChart`, `window.VolumeChart`, `window.PathwayChart`
- Depends on: `window.fmtCompact`
- Purpose: One component per top-level navigation destination
- Location:
- All page files attach their components to `window.*Page`/etc.
- Purpose: Single static mock dataset for the fictional gemeente "Riemsterdal"
- Location: `data.js`
- Exports: `window.DataPraatData` — an object literal with `gemeente`, `overzichtKPIs`, `maandUitgaven`, `topCategorieen`, `forecastSeries`, `forecastBreaches`, `validatieIssues`, `benchmarkPeers`, `benchmarkSpread`, `benchmarkEigen`, `benchmarkVolume`, `verwijzers`, `chatHistory`, `suggestedQuestions`, `glossary45A12`, `trustInspector`
- Loaded as a plain `<script>` (not Babel) so it executes before the JSX modules
## Data Flow
- `page` state in `App` is the router. Switch statements in `App` (`DataPraat.html` lines 91–104) map `page` strings to `<window.XxxPage/>` JSX
- `page` is persisted to `localStorage` under key `dp_page`
- Sidebar collapsed state is persisted under `dp_sb_collapsed` (set in `shell.jsx`)
- Overzicht "mode" (cijfers / verhaal / schaal / …) is persisted under `dp_overzicht_mode` (set in `pages.jsx`)
- Cmd/Ctrl+K is a global shortcut that switches to the chat page
- Drawers (`TrustInspector`, `AskDrawer`) are conditionally rendered when `inspectMetric` or `askTopic` state is non-null — they are not routed
- Chat seeding uses two side-channels: `window.__dpPendingQ` (the pending question to inject) and `window.__chatSeed` / `localStorage["dp_chat_seed"]` (initial messages)
## Key Abstractions
- Purpose: Replace ES `import`/`export`. Every JSX file ends with `window.X = X;` lines so the next file can read them.
- Examples: `shared.jsx` (lines 70–75), `pages.jsx` (lines 442–446), `shell.jsx` (lines 194–196)
- Pattern: All cross-file references inside JSX use `<window.OverzichtPage …/>` rather than direct identifier — the JSX-level qualifier makes the global lookup explicit and survives Babel transpilation order.
- Purpose: A single `AskButton` component (the orb-pill labelled "Vraag hierover") is reused on every KPI tile and chart card. Clicks bubble up to `App`, which sets `askTopic` state, which mounts `AskDrawer`. From there a question can be promoted to a full chat session.
- Files: `shared.jsx` (the button), `chat.jsx` (the drawer + full chat), `pages.jsx` / `overzicht-modes.jsx` / `scenario.jsx` (consumers)
- `TrustBadge` (inline pill) → `TrustInspector` (right drawer) → `KloptDitPage` (full-page plain-Dutch explanation) → `LineagePage` (full lineage view)
- The badge tier is computed inline: `score >= 90 → good`, `>= 70 → warn`, otherwise `bad` (`shared.jsx` line 41)
- The Overzicht page has 12 tonal variants. The default is `cijfers` (numbers/charts). The other 11 (`verhaal`, `schaal`, `verkeerslicht`, `vergelijkend`, `metafoor`, `bullets`, `dagboek`, `weer`, `brief`, `dialoog`, `poster`) live in `overzicht-modes.jsx` and are picked through `ModeSwitcher`. Each mode reads from the same `window.DataPraatData` and re-presents it.
- `OverzichtPage` (`pages.jsx` lines 4–47) early-returns into the matching `<window.XxxMode/>` when `mode !== "cijfers"`.
## Entry Points
- Location: project root
- Triggers: opening the file in a browser
- Responsibilities: load CDN deps, load all JSX files in order, mount `<App/>` into `#root`, define the inline `App` router
- Location: project root
- Triggers: opening the file in a browser
- Responsibilities: separate React app that loads only `design-canvas.jsx` and renders inline-defined `LogoBoard` + concept components. Uses the "omelette" host bridge (`window.omelette`) for state persistence — see `design-canvas.jsx` line 101.
- Location: project root
- Triggers: opening directly
- Responsibilities: static HTML — no React. `woorden-modus-verkenning.html` links to the shared `styles.css`; the others define all CSS inline via `<style>` so they are fully self-contained.
## Error Handling
- `try/catch` only around `JSON.parse` of localStorage values to fall back to defaults (`shell.jsx` lines 6–9, `chat.jsx` lines 6–11)
- Optional chaining and nullish coalescing for "safe" data lookups (e.g. `window.DataPraatData.trustInspector[metricId] || …uitgaven_ytd` in `trust.jsx` line 5)
- Charts assume non-null inputs and would throw on missing data
## Cross-Cutting Concerns
- `DataPraat.html` lines 53–68 implement a `postMessage` contract with a parent window (presumably an editor tooling host). Messages: `__edit_mode_available`, `__activate_edit_mode`, `__deactivate_edit_mode`, `__edit_mode_set_keys`. The "Tweaks" panel (density toggle) writes back to the parent via this channel.
- A magic comment range `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` (line 34) marks where the host can patch defaults.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
