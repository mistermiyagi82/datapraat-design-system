# Coding Conventions

**Analysis Date:** 2026-04-25

This is a **build-tool-free design-system / prototype repo** for the DataPraat product. It loads React 18 + Babel-Standalone in the browser via CDN and renders JSX `<script type="text/babel">` files referenced from `DataPraat.html`. No bundler, no TypeScript, no package.json. Conventions described below are extracted directly from the source — they are stylistic norms, not enforced by tooling.

## Language & Module Style

**Files:** `.jsx` (React components), `.js` (data only), `.css` (single global stylesheet), `.html` (entry pages).

**Module system:** No ES modules. Each `.jsx` file is a `<script type="text/babel">` loaded in order from `DataPraat.html` (`shared.jsx` → `charts.jsx` → `shell.jsx` → `overzicht-modes.jsx` → `pages.jsx` → `trust.jsx` → `klopt-dit.jsx` → `chat.jsx` → `scenario.jsx`).

**Cross-file API = `window`.** Each file declares globals it consumes at the top with a `/* global */` comment, and exports by attaching to `window` at the bottom.

Example (`shared.jsx:1-2`, `shared.jsx:70-75`):

```js
/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
// ... component definitions ...
window.Icon = Icon;
window.TrustBadge = TrustBadge;
window.AskButton = AskButton;
```

Consumers reference globals through the same pattern (`pages.jsx:1`):

```js
/* global React, Icon, TrustBadge, AskButton, fmtEUR, fmtCompact, BarChart, DoughnutChart, ForecastChart, SpreadChart, VolumeChart, PathwayChart */
```

**Important quirk — namespaced React hook destructuring per file.** Because every file shares one global scope, files that need `useState` etc. either re-destructure with a file-suffix (to avoid redeclaration when files share scope) or call `React.useState` directly:

- `shared.jsx:2` — `const { useState, useEffect, useRef, useMemo, useCallback } = React;`
- `shell.jsx:2` — `const { useState: useStateSB, useRef: useRefSB, useEffect: useEffectSB } = React;` (suffix `SB` = Sidebar)
- `chat.jsx:5` — uses `React.useState(...)` inline (no destructure)
- `pages.jsx:7` — uses `React.useState(...)` inline

When adding a new file, follow the inline `React.useState(...)` pattern (most consistent with newer files: `pages.jsx`, `chat.jsx`, `trust.jsx`, `overzicht-modes.jsx`) to avoid name-collision risk.

## Component Shape

**All components are arrow-function expressions** assigned to `const`. No `function` declarations for components, no classes.

```js
const Sidebar = ({ currentPage, onNav, onNewChat, onOpenChat, chatBadge = 3 }) => {
  // hooks ...
  return <aside className="sb"> ... </aside>;
};
```

(`shell.jsx:4`)

**Single-expression components are written as `=>` returning JSX directly** (no body braces):

```js
const Launcher = ({ onClick }) => (
  <div className="launcher" onClick={onClick}>
    {" "}
    ...{" "}
  </div>
);
```

(`shell.jsx:184-192`)

**Props:** Always destructured in the parameter list. Default values inline (`size = 16`, `chatBadge = 3`, `className = ""`). No `propTypes`, no JSDoc on components.

**Callback prop naming:** `onSomething` — `onClick`, `onNav`, `onNewChat`, `onOpenChat`, `onInspect`, `onAskChart`, `onAsk`, `onBack`, `onClose`, `onOpenLineage`, `onOpenFull`, `onChange`, `onBackToCijfers` (`pages.jsx:4`, `shell.jsx:4`, `chat.jsx:3`, `trust.jsx:4`).

**Boolean / state props:** Plain words — `loading`, `actief`, `collapsed`, `open`, `mode`, `currentPage`. No `is`/`has` prefix.

**Children pattern:** Almost no use of `children`. Layout/composition is done by passing rendered nodes via props (e.g. `Body` variable in `pages.jsx:21-32`) or by full ownership of the JSX tree inside the component.

**Helper components defined inline in the same file** (e.g. `Section`, `KV`, `MiniLineage` referenced in `trust.jsx`). Co-locate small helpers next to their primary component.

## Hooks Usage

**Patterns observed:**

- `useState` with **lazy initializer reading `localStorage`**, wrapped in `try/catch`:

  ```js
  const [collapsed, setCollapsed] = useStateSB(() => {
    try {
      return JSON.parse(localStorage.getItem("dp_sb_collapsed") || "{}");
    } catch {
      return {};
    }
  });
  ```

  (`shell.jsx:6-9`; same shape `chat.jsx:5-12`, `pages.jsx:7`).

- `useEffect` paired with `localStorage.setItem` to **persist state on change**: `pages.jsx:8`, `DataPraat.html:46`, `DataPraat.html:49-51`.

- **Outside-click detection** uses a `useRef` + `mousedown` listener inside `useEffect`, registered on `window` and torn down in cleanup (`shell.jsx:14-21`, `overzicht-modes.jsx:23-28`). Re-use this pattern for new dropdowns/menus.

- **Keyboard shortcuts** registered on `window.addEventListener("keydown", …)` inside `useEffect` (`DataPraat.html:71-81`).

- **`React.useMemo` for derived strings** (`chat.jsx:18-27`).

- **`React.useRef` for scroll containers** with auto-scroll-to-bottom in `useEffect` (`chat.jsx:15`, `chat.jsx:29-31`).

- **Async work inside event handlers**, not `useEffect` — see `send` in `chat.jsx:72-92`. `try / catch / finally` is the standard error shape.

**`localStorage` key prefix:** All persisted keys use `dp_` (DataPraat) — `dp_page`, `dp_sb_collapsed`, `dp_overzicht_mode`, `dp_chat_seed` (`DataPraat.html:39`, `shell.jsx:7`, `pages.jsx:7`, `chat.jsx:9`). **Always use the `dp_` prefix for new keys.**

**Window-scoped imperative globals** for cross-component message passing: `window.__dpPendingQ`, `window.__chatSeed` (`DataPraat.html:88`, `chat.jsx:6`). Prefix with `__dp` for new ones.

## Data Layer

`data.js` is a single module attaching one big object to `window.DataPraatData` (`data.js:4`). It is plain JS, no JSON, with NL-language comments and numeric separator literals (`9_500_000`). Components access it as `const d = window.DataPraatData;` (`pages.jsx:5`, `chat.jsx:4`, `shell.jsx:5`).

## JSX Style

- **Double quotes for JSX attribute strings**, double quotes for JS string literals.
- **Inline styles are heavy and accepted.** Many components mix `className` for "structural" styles with `style={{...}}` for one-off positioning (e.g. `chat.jsx:99`, `trust.jsx:12-31`). Use inline styles for ad-hoc tweaks; promote to `styles.css` once a pattern repeats.
- **Inline event handlers as arrow functions are normal**: `onClick={() => onNav(e.id)}` (`shell.jsx:129`).
- **Conditional rendering uses `&&` and ternaries inline**, including multi-branch ternaries (`shell.jsx:96-99`, `chat.jsx:235-237`).
- **Lists keyed by index `i`** when the array is static-shaped (`charts.jsx:13`, `chat.jsx:115`); keyed by domain id when stable (`shell.jsx:91` `key={g.naam}`, `pages.jsx:71` `key={k.id}`).
- **CSS variables referenced from JSX** as `"var(--primary)"` for SVG `fill`/`stroke` (`charts.jsx:14`, `charts.jsx:27`).
- **Density attribute on `<html>`**: `data-density="comfortable" | "compact"` set imperatively in `DataPraat.html:50`. CSS responds via `[data-density="compact"]` selectors.

## Naming Conventions

| Kind                                   | Case                                        | Example                                                                                                                                                                                 |
| -------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component                              | `PascalCase`                                | `Sidebar`, `BarChart`, `OverzichtPage`, `TrustInspector`, `AskDrawer`, `ModeSwitcher`                                                                                                   |
| Component file                         | `kebab-case.jsx`                            | `klopt-dit.jsx`, `overzicht-modes.jsx`, `design-canvas.jsx`; single-word files lowercase: `shell.jsx`, `pages.jsx`, `trust.jsx`, `chat.jsx`, `charts.jsx`, `shared.jsx`, `scenario.jsx` |
| Function / variable                    | `camelCase`                                 | `fmtEUR`, `openNewChat`, `setTweak`, `gemeenteRef`, `chatBadge`                                                                                                                         |
| Constants (module-level config arrays) | `UPPER_SNAKE`                               | `OM_MODES` (`overzicht-modes.jsx:5`), `TWEAKS_DEFAULTS` (`DataPraat.html:34`)                                                                                                           |
| CSS classes                            | `kebab-case`, BEM-ish with hyphen-only      | `.sb-gemeente-menu-foot`, `.kpi-foot`, `.msg-ai-h`, `.om-bullet-marker.ok`                                                                                                              |
| CSS custom properties                  | `kebab-case` with semantic prefix           | `--ink-soft`, `--primary-tint`, `--chart-cost`, `--r-md`, `--s-lg`, `--f-sans`                                                                                                          |
| HTML id / data attr                    | `kebab-case`                                | `id="root"`, `data-density`, `data-screen-label`                                                                                                                                        |
| `localStorage` keys                    | `snake_case` with `dp_` prefix              | `dp_page`, `dp_sb_collapsed`, `dp_overzicht_mode`, `dp_chat_seed`                                                                                                                       |
| Window globals (transient)             | `__dpCamel` (double-underscore + dp prefix) | `window.__dpPendingQ`, `window.__chatSeed`                                                                                                                                              |

**CSS class prefixes** group features and read like namespaces:

- `.sb-*` — sidebar
- `.kpi-*` — KPI tile
- `.card`, `.card-h`, `.card-actions` — generic card
- `.msg-*` / `.chat-*` — chat view
- `.drawer`, `.drawer-h`, `.drawer-x`, `.drawer-body` — drawer
- `.om-*` — Overzicht-Modes ("toon-als" feature)
- `.sc-*` — Scenario page
- `.ask-btn`, `.ask-btn-sm/md/lg` — universal Ask button (size modifiers as suffix, not BEM `__`/`--`)
- State modifiers as **second class**, not `--state`: `.kpi-delta.good`, `.trust.warn`, `.sb-item.active`, `.om-opt.active`, `.badge.good`, `.om-light-dot.act`.

When adding new components, **invent a 2–3-letter prefix for the feature** and namespace all classes under it (matches `om-`, `sc-`, `sb-`).

## Dutch vs English in Identifiers

The codebase mixes both deliberately:

- **Domain / business vocabulary → Dutch** (Jeugdzorg, gemeenten, government context):
  `gemeente`, `gemeenten`, `inwoners`, `peildatum`, `trajecten`, `uitgaven`, `begroot`, `verwijzers`, `aanbieders`, `prognose`, `validatie`, `lineage`_, `glossary`_, `regels`, `klopt-dit`, `overzicht`, `scenario`, `kosten`, `aandeel`, `waarde`, `naam`, `actief`, `cijfers`, `verhaal`, `metafoor`, `bullets`, `dagboek`, `weer`, `brief`, `dialoog`, `poster`, `verkeerslicht`, `vergelijkend`, `schaal`, `dagboek`, `looptijd`, `breach`, `afwijking`, `severity`\*. (`data.js`, `shell.jsx:36-46`, `overzicht-modes.jsx:5-18`)

- **Generic technical / framework vocabulary → English**:
  `useState`, `loading`, `error`, `messages`, `input`, `onClick`, `Icon`, `Sidebar`, `BarChart`, `width`, `height`, `data`, `score`, `tier`, `path`, `point`, `forecast`, `actual`, `severity`, `metricId`.

- **UI labels / menu strings → Dutch** (`shell.jsx:50-58`: "Overzicht", "Prognose", "Klopt dit?", "Datavalidatie", "Glossary"; `chat.jsx:88` "Er ging iets mis").

- **Comments → mostly Dutch**, often informal (`shell.jsx:31` "Andere Zeeuwse gemeenten — demo-lijst", `shared.jsx:49-50` "Ask button — universele 'vraag hierover' knop. Gebruikt op: KPI-tegels, ...").

**Rule for new code:** keep domain nouns in Dutch (matches the data and the user) and keep React/HTML/utility identifiers in English. Don't translate `useState` to `gebruikStaat`; don't anglicise `gemeente` to `municipality`.

## Number, Currency, Locale

All number formatting goes through helpers in `shared.jsx:62-68`:

- `fmtEUR(n)` — `Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })`
- `fmtNum(n)` — `Intl.NumberFormat("nl-NL")`
- `fmtCompact(n)` — `€7,2M` / `€450K` / fallback to `fmtEUR`

NL number format means **comma decimal separator, dot thousands** (`€15.842`, `€7,2M`). The system prompt for the chat reinforces this (`chat.jsx:60`).

For tabular numbers, add `font-variant-numeric: tabular-nums` (CSS class `.tnum` or `.mono`, `styles.css:101`) so digits align in tables and KPIs.

## CSS Organization (`styles.css`, 1698 lines, single file)

**Single global stylesheet** loaded once with cache-buster query (`<link rel="stylesheet" href="styles.css?v=22">`, `DataPraat.html:10`). Bump the `v=` when shipping CSS changes.

**Top of file (`styles.css:1-79`):** `:root { ... }` design-token block. **All design tokens live here.** Never hard-code colours, radii, spacing, fonts, or shadows in component CSS or inline JSX styles — reference the variables.

**Token groups in `:root`:**

| Group      | Variables                                                                                                                               | Purpose                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Neutrals   | `--bg`, `--bg-soft`, `--surface`, `--surface-raised`                                                                                    | Page / sidebar / card backgrounds (warm-cool palette, no pure white/black)                                                                                                 |
| Ink (text) | `--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint`                                                                                      | Body text → faint hints. 4 levels of contrast.                                                                                                                             |
| Lines      | `--line`, `--line-soft`, `--line-strong`                                                                                                | Border weights.                                                                                                                                                            |
| Brand      | `--primary` (`#4338CA`), `--primary-soft`, `--primary-tint`, `--primary-ink`, `--primary-foreground`                                    | Indigo brand.                                                                                                                                                              |
| Charts     | `--chart-cost`, `--chart-volume`, `--chart-price`, `--chart-1` … `--chart-5`                                                            | PxQ semantics: blue=cost, green=volume, orange=price; `chart-1..5` is a sequential blue ramp.                                                                              |
| Status     | `--success`, `--success-tint`, `--success-strong`; same triple for `--warning` and `--destructive`; `--gold`, `--gold-tint`             | Each status has _base / tint / strong_ — use `tint` for backgrounds, `strong` for text-on-tint. See `.trust.good`, `.badge.warn`, `.kpi-delta.bad` (`styles.css:417-422`). |
| Radii      | `--r-sm` (4) `--r-md` (8) `--r-lg` (14) `--r-xl` (20)                                                                                   | Always use these tokens.                                                                                                                                                   |
| Spacing    | `--s-xs` (4) `--s-sm` (8) `--s-md` (12) `--s-lg` (20) `--s-xl` (32) `--s-2xl` (48)                                                      | 4-pt-ish scale. _Note: many existing rules still hard-code px paddings (`padding: 16px 12px`); follow tokens for new code._                                                |
| Fonts      | `--f-sans` (Inter), `--f-serif` (Inter — note: serif uses Inter, narrative modes use literal `"Fraunces"`), `--f-mono` (JetBrains Mono) | Inter is loaded with feature-settings `ss01, cv11`.                                                                                                                        |
| Shadows    | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-drawer`                                                                          | All warm-tinted (`rgba(26,24,20, …)`).                                                                                                                                     |

**Fonts loaded** (`DataPraat.html:9`): Inter (300/400/500/600/700), Fraunces (300/400/500/600 with optical-size axis), JetBrains Mono (400/500). Fraunces is hard-coded by string in two places (`styles.css:808` `.om-narr`, `styles.css:946` `.om-meta-big`, `styles.css:1090ish` `.om-brief`) for narrative / editorial modes.

**Typography scale (no `--type-*` tokens; sizes are inline px in each rule):**

- Page title: 24px / 600 / `letter-spacing: -0.015em` (`.page-title`, `styles.css:373`)
- KPI value: 28px / 600 / `tabular-nums` (`.kpi-value`, `styles.css:445`)
- Card title: 14px / 600 (`.card-title`, `styles.css:471`)
- Body / default: 14px / 1.5 (`body`, `styles.css:88-89`)
- Section labels (uppercase): 11px / 500 / `text-transform: uppercase` / `letter-spacing: 0.06–0.12em` (e.g. `.sb-section-title`, `styles.css:230-237`)
- Captions / meta: 11–12.5px / `var(--ink-mute)`
- Mono numbers: `font-family: var(--f-mono)` + `font-variant-numeric: tabular-nums`

When picking a size, **match the closest existing rule** rather than introducing a new value — there is no formal scale.

**Section structure of `styles.css`** (in source order):

1. `:root` tokens (1-79)
2. Reset + base (`* { box-sizing }`, `body`, `button`, `a`) (81-97)
3. Utility (`.mono`, `.serif`, `.tnum`) (99-101)
4. Layout shell (`.app`, `.sb`, `.main`, `.main-header`, `.main-body`) (103-365)
5. Page primitives (`.page-h`, `.pills`, `.dropdown`, `.trust`, `.kpi-grid`, `.kpi`, `.card`) (367-473)
6. Universal Ask button (475-500)
7. Layout helpers (`.two-col`, `.tbl`, `.badge`) (509-534)
8. Floating UI (`.launcher`, `.drawer*`, scrollbar) (537-697)
9. Overzicht modes block (`/* ==== Overzicht modes ==== */`) (699-1247)
10. Scenario page block (`/* ====== Scenario ====== */`) (1248-1698)

**Sectioning style:** banner comments mark feature areas. `/* ==== … ==== */` for big sections, `/* ---- name ---- */` for sub-sections (e.g. `styles.css:103` `/* ---- layout shell ---- */`, `styles.css:475` `/* ---- Ask button ... ---- */`, `styles.css:805` `/* ---- 2 · Verhaal ---- */`).

**Selector style:**

- Single-class selectors prevail; specificity stays low.
- State as a _second_ class on the same element: `.kpi-delta.good`, `.trust.warn`, `.sb-item.active`, `.om-opt.active`, `.om-light-dot.ok`. Don't use BEM `--modifier`.
- Children are matched by descendant selector, not nesting (no Sass): `.tbl th { … }`, `.kpi-foot .kpi-delta { … }`.
- Pseudo-classes: `:hover` is heavily used; `:focus` is rare (only `.sc-save-form input:focus`, `styles.css:1622-1626`) — accessibility gap noted in CONCERNS, but follow the existing pattern when extending.

**Animations** are inline `@keyframes` next to the rule that uses them (`@keyframes fadeIn` `styles.css:563`, `@keyframes slideIn` `styles.css:575`, `@keyframes pulse` defined in JSX as a `<style>` tag inside `chat.jsx:177-179`).

**Responsive:** very light. Single `@media (max-width: 1100px)` in `styles.css:1696`. No mobile-first design system; assume desktop.

**Print styles:** A separate file `DataPraat one-pager-print.html` carries its own `<style>` block — print is per-page, not centralised.

## HTML Structure

Each top-level prototype is a self-contained HTML page:

- `DataPraat.html` — the React app shell.
- `Logos.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, `website.html`, `website v2.html`, `woorden-modus-verkenning.html` — static / standalone pages, each with their own `<style>` block.

**Standard `<head>` for the React app** (`DataPraat.html:1-17`):

```html
<!DOCTYPE html>
<html lang="nl" data-density="comfortable">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DataPraat — Prototype</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:...&family=Fraunces:...&family=JetBrains+Mono:..."
      rel="stylesheet"
    />
    <link rel="stylesheet" href="styles.css?v=22" />
    <script
      src="https://unpkg.com/react@18.3.1/.../react.development.js"
      integrity="..."
      crossorigin="anonymous"
    ></script>
    <script
      src="https://unpkg.com/react-dom@18.3.1/.../react-dom.development.js"
      integrity="..."
      crossorigin="anonymous"
    ></script>
    <script
      src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
      integrity="..."
      crossorigin="anonymous"
    ></script>
    <script src="data.js"></script>
  </head>
</html>
```

**Conventions:**

- `lang="nl"` on the root — primary user language is Dutch.
- `data-density` is the only HTML-level "tweak" attribute, set imperatively at runtime (`DataPraat.html:50`).
- React, ReactDOM, Babel-Standalone are loaded from **unpkg** with **SRI integrity hashes** and `crossorigin="anonymous"`. Keep both when adding new CDN scripts.
- `data.js` is a regular `<script>` so it executes before the Babel-compiled JSX modules.
- All `.jsx` files are loaded as `<script type="text/babel" src="…">` in dependency order in the `<body>`. Add new JSX files to the list after the files they depend on.
- The app mounts to `<div id="root"></div>` via `ReactDOM.createRoot(...).render(<App/>)` in an inline `<script type="text/babel">` block (`DataPraat.html:159`).
- A "tweaks" sentinel `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` (`DataPraat.html:34-36`) marks the editable defaults block — **don't rename or remove these markers**; they are part of an `__activate_edit_mode` postMessage protocol with the parent frame.

## Comments

**Style:** `//` line comments and `/* */` block comments. Comments are **frequent and Dutch**, often informal/conversational, often used to explain _why_ a section exists rather than what the next line does.

**Examples:**

- File-level rationale: `data.js:1-2` `// DataPraat — mock data voor Riemsterdal (fictieve gemeente) // Alle getallen zijn realistisch voor een gemeente van ~28.400 inwoners`
- Section banners inside JSX: `// ===== OVERZICHT =====` (`pages.jsx:3`), `// ===== TRUST INSPECTOR DRAWER =====` (`trust.jsx:3`), `// ===== PER-CHART ASK DRAWER =====` (`chat.jsx:193`)
- Hat-tip comments above complex regions: `// ---- SVG icons (stroke 1.5, 16x16) ----` (`shared.jsx:4`), `// ---- Format helpers (NL locale) ----` (`shared.jsx:61`)
- Design rationale in CSS: `--bg: #FCFBF8; /* main area — bijna wit met vleugje warmte */` (`styles.css:5`)
- Brand-decision callouts: `/* neutrals — lichter, koeler (afwijking v1.1: minder warm papier, meer grijs/wit) */` (`styles.css:4`)
- Inline lint disables: `// eslint-disable-next-line` (`chat.jsx:69`) — present despite no ESLint config, suggesting an editor-level lint expectation.

**Rules for new comments:**

- Dutch is fine and matches the codebase voice.
- Use section banners (`// ===== NAME =====` or `// ---- name ----`) when introducing a new logical block in a JSX file.
- Document **the reason for a value or decision** (especially design tokens), not the syntax.
- Don't add JSDoc-style `@param` comments — there is no precedent and no tooling that consumes them.

## Linting / Formatting

**No tooling is configured.** There is no `package.json`, no `.eslintrc*`, no `.prettierrc*`, no `tsconfig.json`, no `.editorconfig`, no `biome.json`. The single `// eslint-disable-next-line` in `chat.jsx:69` indicates the author runs an editor-level linter, but there is no committed config and no CI.

**De-facto formatting from the source:**

- 2-space indentation.
- Double quotes for strings (both JS and JSX attributes); back-ticks for template strings.
- Semicolons at end of statements.
- Trailing commas inside multi-line object/array literals (`data.js:5-13`, `pages.jsx:71`).
- Spaces inside JSX attribute braces: `onClick={() => ...}` (no inner-space convention enforced).
- Long lines are tolerated (the icon `paths` map in `shared.jsx:7-30` runs ~250 chars per line).

**If a code-touching phase is added, install Prettier + ESLint with `eslint-config-react`** before reformatting — touching any file will otherwise produce a huge whitespace diff.

## Where to Put New Code

| You are adding…                                         | Put it in                                                                                                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new design token (colour, radius, font)               | `:root` block at top of `styles.css`                                                                                                                                                                     |
| A small reusable visual primitive (badge, button, icon) | `shared.jsx` and attach to `window`                                                                                                                                                                      |
| A new SVG chart                                         | `charts.jsx` and attach to `window`                                                                                                                                                                      |
| App chrome (header / sidebar / launcher)                | `shell.jsx`                                                                                                                                                                                              |
| A new top-level page                                    | a new `kebab-case.jsx` file, attached as `window.SomethingPage`, registered in the router in `DataPraat.html:91-104`, and added to the `<script type="text/babel" src=…>` list in `DataPraat.html:21-29` |
| A page-specific drawer / modal                          | the same file as the page that opens it (`AskDrawer` lives in `chat.jsx`, `TrustInspector` in `trust.jsx`)                                                                                               |
| Mock data / business numbers                            | extend the object literal in `data.js`                                                                                                                                                                   |
| CSS for a new feature                                   | append to `styles.css` under a new `/* ==== Feature name ==== */` banner with its own class prefix; bump `?v=` in `DataPraat.html:10`                                                                    |
| Persisted user preference                               | `localStorage` with `dp_` prefix, lazy-init in `useState`, persist in a `useEffect`                                                                                                                      |
