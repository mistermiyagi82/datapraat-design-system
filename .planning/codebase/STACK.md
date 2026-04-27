# Technology Stack

**Analysis Date:** 2026-04-25

## Languages

**Primary:**

- HTML5 — Standalone prototype/demo pages at the project root (`DataPraat.html`, `Logos.html`, `website.html`, `website v2.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, `woorden-modus-verkenning.html`)
- JSX (React, in-browser Babel-compiled) — Component source files at the project root (`shared.jsx`, `shell.jsx`, `charts.jsx`, `pages.jsx`, `chat.jsx`, `trust.jsx`, `klopt-dit.jsx`, `scenario.jsx`, `overzicht-modes.jsx`, `design-canvas.jsx`)
- CSS3 — Single token-driven stylesheet `styles.css` (1698 lines) plus large inline `<style>` blocks in marketing/print HTML pages
- JavaScript (ES2020+) — Mock data attached to `window.DataPraatData` in `data.js`

**Secondary:**

- Markdown — Design documentation at the project root (`COMPONENTS.md`, `HANDOFF.md`) and brand guides under `uploads/` (`uploads/datapraat-brand-guide-v1.1.md`, `uploads/datapraat-brand-guide-v1.1-19f5247b.md`, `uploads/datapraat-build-spec.md`, `uploads/brand-guide-template.md`)

**Not used:**

- TypeScript — Not present in this repo (only mentioned in `HANDOFF.md` as a target stack for the future Next.js implementation)

## Runtime

**Environment:**

- Browser-only. Pages are designed to be opened directly via `file://` or served by any static HTTP server. No Node.js runtime is invoked.

**Package Manager:**

- None. There is no `package.json`, `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`. Dependencies are loaded from CDN at runtime.

**Lockfile:**

- None.

## Frameworks

**Core (loaded at runtime via CDN):**

- React 18.3.1 (UMD development build) — Loaded from `https://unpkg.com/react@18.3.1/umd/react.development.js` in `DataPraat.html` (line 12) and `Logos.html` (line 159)
- ReactDOM 18.3.1 (UMD development build) — Loaded from `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js` in `DataPraat.html` (line 13) and `Logos.html` (line 160). Mounted via `ReactDOM.createRoot(document.getElementById("root")).render(<App/>)` (e.g. `DataPraat.html` line 159, `Logos.html` line 1486)
- Babel Standalone 7.29.0 — Loaded from `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js`. JSX files are referenced with `<script type="text/babel" src="...jsx">` and transpiled in-browser at page load.

**JSX globals:**

- React hooks are pulled from the global `React` namespace (e.g. `shared.jsx` line 2: `const { useState, useEffect, useRef, useMemo, useCallback } = React;`). No ES module imports — every `.jsx` file relies on globals exposed by previously-loaded scripts.

**Testing:**

- Not detected. No test runner, no test files, no test config.

**Build/Dev:**

- None. There is no bundler (Vite, Webpack, esbuild, Rollup, Parcel), no transpiler step, no task runner, no Tailwind/PostCSS pipeline. CSS is hand-authored against custom properties; JSX is transformed in-browser by `@babel/standalone`. Cache-busting is done with manual querystring versions like `styles.css?v=22` (`DataPraat.html` line 11) and `styles.css?v=18` (`woorden-modus-verkenning.html` line 10).

## Key Dependencies

**Critical (loaded via unpkg CDN, no local copy):**

- `react@18.3.1` — Component runtime. SRI hash `sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L`.
- `react-dom@18.3.1` — DOM renderer. SRI hash `sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm`.
- `@babel/standalone@7.29.0` — In-browser JSX/ES transform. SRI hash `sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y`.

**Component/UI libraries:**

- None. shadcn/ui, Radix, lucide-react, Recharts, framer-motion, etc. are listed only as future targets in `HANDOFF.md`. The current code uses no third-party UI primitives.

**Charting:**

- Hand-rolled SVG charts in `charts.jsx`. Comment on line 3: `// ---- Mini SVG charts (no external lib) ----`. Bar/line/donut/forecast charts are constructed from raw `<svg>`, `<rect>`, `<polyline>`, `<circle>` elements using inline scaling math.

**Icons:**

- Hand-rolled inline SVG `<Icon>` component in `shared.jsx` (lines 5–35). Icon shapes are inlined as JSX `<g>`/`<path>` definitions on a 16×16 viewBox with `strokeWidth="1.5"`. No icon library is loaded. Names include: `overzicht`, `prognose`, `validatie`, `benchmark`, `verwijzers`, `lineage`, `glossary`, `regels`, `plus`, `chevron`, `close`, `send`, `search`, `info`, `arrow`, `back`, `sparkle`, `pin`, `bolt`, `more`, `chat`, `export`, `copy`, `check`.

## CSS Approach

**Strategy:** Custom hand-written CSS driven by CSS custom properties. **No Tailwind, no CSS-in-JS, no preprocessor.**

**Token system:** Defined in `:root` in `styles.css` (lines 3–80). Categories include neutrals (`--bg`, `--bg-soft`, `--surface`), ink (`--ink`, `--ink-soft`, `--ink-mute`, `--ink-faint`), lines (`--line`, `--line-soft`, `--line-strong`), brand (`--primary`, `--primary-soft`, `--primary-tint`, `--primary-ink`), chart palette (`--chart-cost`, `--chart-volume`, `--chart-price`, `--chart-1`…`--chart-5`), status (`--success`, `--warning`, `--destructive` plus `-tint`/`-strong` variants), radii (`--r-sm`…`--r-xl`), spacing (`--s-xs`…`--s-2xl`), font stacks (`--f-sans`, `--f-serif`, `--f-mono`), and shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-drawer`).

**Class naming:** Plain semantic/BEM-flavoured class names (e.g. `.kpi-value`, `.page-title`, `.trust-dot`, `.om-weer-vooruit-tekst .day`, `.tweaks-panel h4`). React components use `className="..."` referring to the same global classes — there is no module scoping.

**HTML duplication:** Each marketing/standalone page (`website.html`, `website v2.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, `woorden-modus-verkenning.html`) inlines its own `<style>` block (starting near line 11 of each file) that re-declares the brand tokens locally. `styles.css` is only linked from the React-driven pages (`DataPraat.html`, `Logos.html`) and from `woorden-modus-verkenning.html`.

## Fonts

All font families are pulled from Google Fonts via `https://fonts.googleapis.com/css2?...`. `preconnect` hints to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` precede the stylesheet link in every HTML file.

**Loaded families:**

- **Inter** — Primary sans. Weights vary per page: 300/400/500/600/700 (most pages) and 300/400/500/600/700/800 (`Logos.html`).
- **Fraunces** — Display serif. Loaded with optical-size axis (`opsz,wght@9..144,...`). Weights 300–600 on most pages; 400–700 on `Logos.html`.
- **JetBrains Mono** — Mono. Weights 400/500 (most pages); 400/500/600 on `Logos.html`.

**Font stacks (declared in `styles.css` lines 70–72):**

- `--f-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;`
- `--f-serif: "Inter", ui-sans-serif, system-ui, sans-serif;` (note: `--f-serif` falls back to Inter despite the name; "Fraunces" is referenced directly in component selectors, e.g. `styles.css` lines 808, 946, 1109, 1193 — `font-family: "Fraunces", ui-serif, Georgia, serif;`)
- `--f-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;`
- Page-scoped overrides on the marketing pages also reference `--f-display` and `--f-body` (`styles.css` lines 1295, 1385, 1616).

## Configuration

**Environment:**

- None. No `.env`, no `.env.example`. The `.gitignore` (`.gitignore`) only ignores `.DS_Store`.
- All "data" is mocked in `data.js` and bound to `window.DataPraatData` (line 4 of `data.js`).

**Build:**

- No build configs. No `tsconfig.json`, no `vite.config.*`, no `webpack.config.*`, no `babel.config.*`, no `tailwind.config.*`, no `postcss.config.*`, no `eslint.config.*`, no `.prettierrc`, no `.editorconfig`, no `.nvmrc`.
- The only "config" is the manual `?v=N` cache-busting suffix on `styles.css` link tags.

## Platform Requirements

**Development:**

- Modern browser with ES2020+ support and access to `unpkg.com` and `fonts.googleapis.com` (Babel Standalone, React UMD, and Google Fonts all require live network access).
- Optional: any static file server (e.g. `python -m http.server`, `npx serve`) — needed if the browser blocks `<script src="...jsx">` on `file://` due to CORS/MIME restrictions.

**Production:**

- Not deployed from this repo. `HANDOFF.md` describes a future production rebuild on Next.js 15 + Tailwind + shadcn/ui + Recharts. The current artifact is a design/prototype handoff package only.

## Repository Role

This repo is a **design system prototype and brand asset package**, not a runnable application. Its purpose is to:

1. Demonstrate the visual language and interaction patterns (`DataPraat.html`, `Logos.html`).
2. Provide static marketing/print collateral (`website.html`, `website v2.html`, `DataPraat one-pager*.html`).
3. Hand off tokens, components, and rules to a downstream production team via `COMPONENTS.md`, `HANDOFF.md`, and the brand guides in `uploads/`.

---

_Stack analysis: 2026-04-25_
