# Codebase Structure

**Analysis Date:** 2026-04-25

## Directory Layout

```
datapraat-design-system-clean/
├── .gitignore                              # only ignores .DS_Store
├── .planning/                              # GSD planning workspace
│   └── codebase/                           # this analysis
├── HANDOFF.md                              # spec for porting prototype to Next.js 15 + shadcn
├── COMPONENTS.md                           # component register / API contract for the future build
│
├── DataPraat.html                          # PROTOTYPE ENTRY — React app, the live design surface
├── Logos.html                              # logo exploration — separate React app (design-canvas.jsx)
├── website.html                            # marketing site — static, all CSS inline
├── website v2.html                         # marketing site v2 — static, all CSS inline
├── woorden-modus-verkenning.html           # explore page for Overzicht-mode variants — static, links styles.css
├── DataPraat one-pager.html                # printable one-pager — static, self-contained
├── DataPraat one-pager-print.html          # print-optimised one-pager — static, self-contained
│
├── data.js                                 # window.DataPraatData — single mock dataset
├── styles.css                              # global CSS + design tokens, used by DataPraat.html and woorden-modus-verkenning.html
│
├── shared.jsx                              # Icon, TrustBadge, AskButton, fmtEUR/fmtNum/fmtCompact
├── shell.jsx                               # Sidebar, MainHeader, Launcher (app frame)
├── charts.jsx                              # BarChart, DoughnutChart, ForecastChart, SpreadChart, VolumeChart, PathwayChart
├── overzicht-modes.jsx                     # ModeSwitcher + 11 alt-tone renderings of Overzicht
├── pages.jsx                               # OverzichtPage, PrognosePage, ValidatiePage, BenchmarkPage, VerwijzersPage
├── trust.jsx                               # TrustInspector drawer, LineagePage, GlossaryPage
├── klopt-dit.jsx                           # KloptDitPage (plain-Dutch trust/validation unified view)
├── chat.jsx                                # ChatView (full page) + AskDrawer (right sheet)
├── scenario.jsx                            # ScenarioPage ("wat als…?" with knobs + presets)
├── design-canvas.jsx                       # canvas/sections/artboards wrapper used only by Logos.html
│
├── screenshots/                            # reference imagery — past UI states for comparison
│   ├── chat.png · lineage.png · overzicht.png · validatie.png
│   └── scenario.png · scenario2.png … scenario6.png
│
└── uploads/                                # source-of-truth brand assets and pasted reference imagery
    ├── brand-guide-template.md
    ├── datapraat-brand-guide-v1.1.md       # canonical brand guide (mirrored as -19f5247b.md)
    ├── datapraat-brand-guide-v1.1-19f5247b.md
    ├── datapraat-build-spec.md             # extended build spec (sibling to HANDOFF.md)
    └── pasted-1776*-0.png                  # 17 pasted reference screenshots, timestamped filenames
```

## Directory Purposes

**Project root (flat layout):**
- Purpose: Every source file lives at the root. There is no `src/`, no `public/`, no module structure. The flatness is intentional because the prototype loads everything via `<script>` tags in `DataPraat.html`.
- Contains: HTML entry points, JSX components, the data file, the stylesheet, and the two markdown specs (`HANDOFF.md`, `COMPONENTS.md`)

**`screenshots/`:**
- Purpose: PNG snapshots of earlier or alternative versions of the UI. Used as visual reference when comparing iterations.
- Contains: `chat.png`, `lineage.png`, `overzicht.png`, `validatie.png`, and six `scenario*.png` variants
- Generated: No (hand-curated)
- Committed: Yes

**`uploads/`:**
- Purpose: Brand-asset truth. Holds the canonical brand guide, the long-form build spec, and pasted reference screenshots from external conversations.
- Contains:
  - `datapraat-brand-guide-v1.1.md` — the brand guide (also mirrored as `…-19f5247b.md`, byte-identical content)
  - `brand-guide-template.md` — earlier template
  - `datapraat-build-spec.md` — extended build spec parallel to `HANDOFF.md`
  - `pasted-*.png` — 17 reference images with epoch-timestamped filenames
- Generated: No
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase mapping output (this directory)
- Contains: `ARCHITECTURE.md`, `STRUCTURE.md`
- Generated: Yes (by the GSD codebase mapper)
- Committed: Yes (per GSD convention)

## Key File Locations

**Entry Points:**
- `DataPraat.html`: main React prototype — open this to see the working app
- `Logos.html`: standalone logo-exploration React app
- `website.html`, `website v2.html`: marketing landing pages
- `woorden-modus-verkenning.html`: research page exploring the Overzicht "tones"
- `DataPraat one-pager.html`, `DataPraat one-pager-print.html`: standalone one-pagers

**Configuration:**
- `.gitignore`: only excludes `.DS_Store`. There is no `package.json`, no `tsconfig.json`, no lint config, no formatter config.

**Core Logic (the prototype, in load order):**
- `data.js`: mock data (`window.DataPraatData`)
- `shared.jsx`: primitives (`Icon`, `TrustBadge`, `AskButton`, format helpers)
- `charts.jsx`: SVG chart primitives
- `shell.jsx`: app frame (`Sidebar`, `MainHeader`, `Launcher`)
- `overzicht-modes.jsx`: `ModeSwitcher` + 11 alt-tone Overzicht renderings (must load before `pages.jsx` since `OverzichtPage` calls `window.ModeSwitcher`)
- `pages.jsx`: 5 main dashboard pages
- `trust.jsx`: `TrustInspector`, `LineagePage`, `GlossaryPage`
- `klopt-dit.jsx`: `KloptDitPage`
- `chat.jsx`: `ChatView`, `AskDrawer`
- `scenario.jsx`: `ScenarioPage`
- The inline `<script type="text/babel">` at the bottom of `DataPraat.html` (lines 31–159) is the actual `App` root and router

**Styling:**
- `styles.css`: 1698 lines of global CSS — design tokens at top, then layout/component classes
- HTML pages other than `DataPraat.html` and `woorden-modus-verkenning.html` embed their own CSS in `<style>` blocks rather than linking `styles.css`

**Reference / Documentation:**
- `HANDOFF.md`: instructions to a future Claude Code session for porting this prototype to Next.js 15 + shadcn/ui
- `COMPONENTS.md`: component register specifying the API contract of each domain component for the future build
- `uploads/datapraat-brand-guide-v1.1.md`: canonical brand guide
- `uploads/datapraat-build-spec.md`: extended build spec

## Naming Conventions

**HTML files:**
- Top-level surfaces use TitleCase or kebab-mixed-case names: `DataPraat.html`, `Logos.html`, `website.html`, `website v2.html`, `woorden-modus-verkenning.html`. Spaces are tolerated (e.g. `website v2.html`, `DataPraat one-pager.html`).
- The print variant suffixes `-print` (e.g. `DataPraat one-pager-print.html`)

**JSX files:**
- All lowercase, kebab-case where multi-word: `klopt-dit.jsx`, `overzicht-modes.jsx`, `design-canvas.jsx`, `chat.jsx`, `pages.jsx`, `trust.jsx`, `scenario.jsx`, `shared.jsx`, `shell.jsx`, `charts.jsx`
- File names describe the *area* (`trust`, `chat`, `scenario`) rather than the exported component name

**Components inside JSX (PascalCase):**
- Pages end in `Page`: `OverzichtPage`, `PrognosePage`, `ValidatiePage`, `BenchmarkPage`, `VerwijzersPage`, `KloptDitPage`, `ScenarioPage`, `LineagePage`, `GlossaryPage`
- Modes end in `Mode`: `VerhaalMode`, `SchaalMode`, `VerkeerslichtMode`, `VergelijkendMode`, `MetafoorMode`, `BulletsMode`, `DagboekMode`, `WeerMode`, `BriefMode`, `DialoogMode`, `PosterMode`
- Charts end in `Chart`: `BarChart`, `DoughnutChart`, `ForecastChart`, `SpreadChart`, `VolumeChart`, `PathwayChart`
- Drawers and inspectors do not get a suffix: `TrustInspector`, `AskDrawer`

**CSS classes:**
- Short, prefixed by area: `sb-` (sidebar), `kpi-`, `card-`, `page-`, `om-` (overzicht-mode), `drawer-`, `pill`, `tnum`, `mono`
- BEM-ish but not strict: `sb-section-title`, `sb-section-title-toggle`, `kpi-label-row`, `kpi-foot`

**localStorage keys:** `dp_*` prefix — `dp_page`, `dp_sb_collapsed`, `dp_overzicht_mode`, `dp_chat_seed`

**CSS custom properties:** dash-separated semantic names — `--primary`, `--primary-soft`, `--primary-tint`, `--ink`, `--ink-soft`, `--ink-mute`, `--line`, `--chart-cost`, `--chart-volume`, `--chart-price`, `--success`, `--warning`, `--destructive`, `--f-sans`, `--f-mono`, `--r-sm`, `--shadow-md`

**Image assets in `uploads/`:** `pasted-<epoch-ms>-0.png` — auto-named pastes that have not been renamed for human readability.

## Where to Add New Code

**New top-level page in the prototype:**
1. Add a component file (`my-thing.jsx`) at the root, attach `window.MyThingPage = MyThingPage;` at the bottom
2. Add `<script type="text/babel" src="my-thing.jsx"></script>` to `DataPraat.html`, in dependency order (after `shared.jsx`, `charts.jsx`, `shell.jsx`)
3. Add a route arm to the `App` switch in `DataPraat.html` (around lines 91–104): `else if (page === "my-thing") Content = <window.MyThingPage/>;`
4. Add a sidebar nav entry in `shell.jsx` (the `items` array, lines 48–64)

**New shared primitive (icon, badge, helper):**
- Add to `shared.jsx`, then attach to `window.*` at the bottom of that file. Update consumers; no other registration needed.

**New chart type:**
- Add to `charts.jsx`, attach to `window.*`. Use existing chart functions as a template — they accept a `data` array, `width`, `height` and render plain SVG using the `--chart-*` CSS variables.

**New Overzicht mode (alternate rendering):**
1. Add the `XxxMode` component to `overzicht-modes.jsx` and `window.XxxMode = XxxMode;`
2. Add an entry to `OM_MODES` (top of `overzicht-modes.jsx`)
3. Add a branch to the `mode !== "cijfers"` switch in `OverzichtPage` (`pages.jsx` lines 22–32)

**New mock data:**
- Add a key to the `window.DataPraatData` object literal in `data.js`. Read it directly via `window.DataPraatData.myKey` from any component.

**New trust-inspector metric:**
- Add a key to `data.js` `trustInspector` (mirror the shape of `uitgaven_ytd`). Pass that key as `metricId` when calling `setInspectMetric(...)` from a `TrustBadge` `onClick`.

**New static HTML demo (marketing, print, exploration):**
- Drop a new `.html` at the root. If it should share design tokens, link `styles.css?v=…`; otherwise inline a `<style>` block (the established pattern for the marketing pages and one-pagers).

**Reference imagery:**
- Live screenshots of UI states → `screenshots/`
- Brand-spec inputs and pasted reference screenshots → `uploads/`

## Special Directories

**`uploads/`:**
- Purpose: Stable brand-truth content (brand guide, build spec, reference imagery)
- Generated: No
- Committed: Yes

**`screenshots/`:**
- Purpose: UI snapshots used as visual diff reference
- Generated: No (manually captured)
- Committed: Yes

**`.planning/`:**
- Purpose: GSD command outputs (planning, codebase mapping, phases)
- Generated: Yes (by GSD tooling)
- Committed: Yes

**No `node_modules/`, no `dist/`, no `build/`, no `public/`** — there is no build pipeline. React is loaded from unpkg at runtime; Babel transpiles JSX in the browser.

---

*Structure analysis: 2026-04-25*
