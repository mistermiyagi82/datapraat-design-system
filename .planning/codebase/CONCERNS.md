# Codebase Concerns

**Analysis Date:** 2026-04-25

This is a static prototype / brand-asset workspace, not a production app. There is no `package.json`, no build step, no test runner, and no CI. Almost every concern below stems from that: the workspace is optimised for show-and-tell ("open the HTML in a browser") rather than for collaboration, deployment, or refactoring. `HANDOFF.md` already names the production target (Next.js 15 + shadcn/ui), so the concerns here are roughly "what to clean up before / during that handoff".

---

## Tech Debt

### Multiple parallel HTML "main" pages without a clear canonical version

- Files: `website.html` (2104 lines), `website v2.html` (2661 lines)
- Issue: Two near-duplicate marketing pages live side-by-side. `website v2.html` is a superset (extra accent palette, CTA / accent button variants, success-coded "live indicator", warm-tone refresh). The original is not deleted, not marked deprecated, and has no README pointer. `diff` shows v2 has additions on top of v1 plus brand-token shifts (`--warning #A8702A` → `#B8803A`, indigo `--primary` for live-dot in v1 swapped for `--success` in v2).
- Impact: Anyone editing "the website" has to guess which file is canonical; bug-fixes drift; the file with a space in its name (`website v2.html`) breaks naive globbing and URL-handling.
- Fix approach: Pick one (likely v2), rename it to `website.html`, archive the loser to `archive/` or delete it. Commit the brand-token decision (success-green vs indigo for the live-dot) into `styles.css` so it survives.

### One-pager / one-pager-print divergence

- Files: `DataPraat one-pager.html` (753 lines), `DataPraat one-pager-print.html` (508 lines)
- Issue: Print version is a hand-minified copy of the screen version with `-webkit-print-color-adjust: exact` added and most CSS comments stripped. They are functionally the same document with two style profiles. `DataPraat one-pager.html` is also polluted with editor/tool injected attributes (`data-cc-id="cc-1"`, `data-new-gr-c-s-check-loaded`, `data-gr-ext-installed`, inline `style="cursor: crosshair"` on `<body>`) — see `DataPraat one-pager.html:1`, `:520`, `:540`, `:552`.
- Impact: Two copies that drift independently; the screen version contains stale browser-extension cruft committed to git.
- Fix approach: Keep one HTML; switch print profile to a `@media print { ... }` block (already partially exists at `DataPraat one-pager.html:505`). Strip Grammarly / canvas-tool data-attrs before committing.

### Brand-guide duplicate file with hash-suffix

- Files: `uploads/datapraat-brand-guide-v1.1.md`, `uploads/datapraat-brand-guide-v1.1-19f5247b.md`
- Issue: `diff` reports the two files identical (byte-for-byte). The `-19f5247b` suffix looks like an upload-tool content hash that was kept alongside the canonical name.
- Fix approach: Delete the hash-suffixed copy.

### Brand drift: tokens differ between `styles.css`, `HANDOFF.md`, and the brand guide

- Files: `styles.css:22`–`:54`, `HANDOFF.md:62`–`:106`, `uploads/datapraat-brand-guide-v1.1.md:9`, `:317`–`:347`
- Issue: Three sources of truth for tokens: hex values in `styles.css`, HSL values in `HANDOFF.md`, and a brand-guide changelog that explicitly says "productie-codebase (oklch tokens) moet hierop worden bijgewerkt". The brand guide tracks v1.0 → v1.1; `HANDOFF.md` re-encodes them as Tailwind-friendly HSL; `styles.css` is yet a third translation. `website.html` and `website v2.html` then add extra tokens (`--cta`, `--accent-clay-*`, `--accent-teal-*`, `--terra`, `--ochre`, `--plum`) that exist nowhere in `styles.css`.
- Impact: New components are guaranteed to pick a token that disagrees with the brand guide. The "warm/zacht" v1.1 palette migration is partial: `styles.css` is mid-migration, `website.html` is older, `website v2.html` is newer-but-different.
- Fix approach: Promote the brand-guide hex table to the single source. Generate `styles.css` tokens (and the future Tailwind config) from it. Delete per-file token re-declarations inside `website*.html` and `*one-pager*.html`.

### Inline `<style>` blocks per HTML file instead of using `styles.css`

- Files: `website.html:11`–`:1205` (1194 lines of CSS), `website v2.html:11`–`:1428` (1417 lines), `DataPraat one-pager.html:16`–`:518` (502 lines), `DataPraat one-pager-print.html:8`–`:256` (248 lines), `Logos.html:11`–`:153` (142 lines), `woorden-modus-verkenning.html:11`–`:458` (447 lines)
- Note: Only `DataPraat.html` and `woorden-modus-verkenning.html` actually `<link rel="stylesheet" href="styles.css">`. The others ship their own CSS inline and never reference the shared file.
- Impact: ~3,950 lines of CSS live outside the shared design-system stylesheet. `.btn`, `.btn.primary`, `.btn.ghost`, `.btn.link` etc. are redefined inside each HTML file (`website.html:86`–`:115`, `website v2.html:128`–`:153`) with subtle differences. Any token tweak in `styles.css` is silently ignored by 4 of 7 HTML pages.
- Fix approach: Extract per-file styles into either (a) shared utility file referenced from every page, or (b) clearly scoped page-specific stylesheets, but always after `<link href="styles.css">` so tokens are inherited.

### Inline `style="..."` attributes pervasive in JSX (and HTML)

- Files: `pages.jsx` (high concentration: `:167`, `:321`, ...), `chat.jsx:99`, `trust.jsx:72`, `:126`, `:263`, `shell.jsx:169`, `overzicht-modes.jsx`, `DataPraat.html:131`–`:152`
- Counts (occurrences of `style="`): `website v2.html:35`, `DataPraat one-pager.html:33`, `website.html:24`, `DataPraat one-pager-print.html:6`. Per-jsx counts run into the dozens once template-literal styles are included.
- Impact: Component visuals are not driven by tokens. A theme switch (e.g. dark mode "Later. DataPraat is light-first.", `HANDOFF.md:108`) requires a global grep-and-replace. `COMPONENTS.md:170` already lists this as anti-pattern (`❌ className="bg-[#4338CA]"`), but the prototype violates the rule.
- Fix approach: Stage a sweep that promotes repeat inline styles into class rules in `styles.css` before the Next.js handoff. The handoff target (Tailwind + shadcn) makes this much easier to do at port time.

### Hardcoded mock data and hardcoded user/gemeente assumptions

- Files: `data.js:1`–`:260` (entire mock dataset), `chat.jsx:106` (`Hallo Merel,...`), `chat.jsx:33`–`:60` (system prompt with cijfers hard-baked into the prompt), `chat.jsx:39` (`Q3 2024 peildatum`), `chat.jsx:111` (`2.847 declaraties beschikbaar · 17 aanbieders`), `pages.jsx:167` (`€7,2M van €9,5M jaarbudget`), `overzicht-modes.jsx:108`, `:227`, `:232`, `:236`, `:248`, `:445` (Riemsterdal / 100 inwoners narrative), `pages.jsx:321` (`Riemsterdal zit op €18.420...`)
- Issue: Numbers exist in three layers: in `data.js`, restated in inline narrative copy across components, and re-restated inside the LLM system prompt. Updating `data.js` will not update the LLM context, the narrative copy, or the `klopt-dit.jsx:62` `"Januari t/m september 2024 · alleen Riemsterdal."` literals.
- Impact: The "single fictional gemeente" assumption (`gemeente.naam: "Riemsterdal"`, `:5`) is leaky; multi-gemeente support requires editing prompts and copy, not just the data file.
- Fix approach: For this prototype, accept it. For the production port, make `chat.jsx`'s system prompt build from `DataPraatData` programmatically, and keep inline narrative copy out of components (move to a content map).

### Pollution from external editing tools committed to git

- Files: `DataPraat one-pager.html:1` (`data-cc-id="cc-1"` on `<html>`), `:520` (`data-new-gr-c-s-check-loaded`, `data-gr-ext-installed`, `cursor: crosshair` on `<body>`), and ~56 other `data-cc-id` / `data-gr-*` attributes per `DataPraat one-pager.html`
- Issue: Grammarly + a canvas-style tool ("cc" = something like Cursor / a Claude content-canvas tag) injected attributes that got saved back to disk.
- Impact: Diffs are noisy; the `cursor: crosshair` cursor-leak is a visible regression on first load.
- Fix approach: Run a single sed to strip `\sdata-cc-id="[^"]*"`, `\sdata-new-gr-c-s-[^=]+="[^"]*"`, `\sdata-gr-ext-installed=""`, plus the inline `cursor: crosshair`. Add a pre-commit lint to block reintroduction.

### Float / typo in JSX globals comment

- File: `chat.jsx:1` declares `/* global React, Icon, TrustBadge, BarChart */` but `Icon` is used (`:100`) without being defined in `shared.jsx` — there is no `Icon` symbol exported. Either it's expected to be on `window` and isn't, or it's dead.
- Impact: Likely a runtime `Icon is not defined` error if that branch ever renders.
- Fix approach: Verify `shared.jsx` exposes `Icon`; if not, replace with an inline SVG or a `lucide-react`-equivalent at port time.

---

## Fragility

### "Build" is babel-standalone CDN-transpilation in the browser

- Files: `DataPraat.html:12`–`:14`, `Logos.html:159`–`:161`
- Issue: All `.jsx` files are loaded as `<script type="text/babel" src="...">` and transpiled at page load by `@babel/standalone@7.29.0` from unpkg. Any unpkg outage breaks every prototype. Babel-standalone is also explicitly documented as "not for production" by the Babel team.
- Impact: First-paint is slow (parse + transpile every JSX file every load). One CDN flake = blank page. SRI hashes are pinned (good), but that means a single hash mismatch from a corrupted CDN edge breaks the prototype until someone updates the integrity attribute.
- Fix approach: Acceptable for prototype. The Next.js port (`HANDOFF.md`) replaces this entirely.

### Cross-file globals on `window`

- Files: `chat.jsx:6` (`window.__chatSeed`), `:64` (`window.__dpPendingQ`), `chat.jsx:81` (`window.claude.complete`), `DataPraat.html:88` (`window.__dpPendingQ = q;`), `DataPraat.html:60`, `:67` (`window.parent.postMessage({type: "__edit_mode_..."})`), `design-canvas.jsx:101` (`window.omelette?.writeFile(...)`), `Logos.html:1379` (`const { DesignCanvas, DCSection, DCArtboard } = window`), every `pages.jsx` / `chat.jsx` / `trust.jsx` / `klopt-dit.jsx` / `shell.jsx` reads `window.DataPraatData`
- Issue: There is no module system. Every component leaks onto `window`, and inter-component "props" travel via `window.__chatSeed` / `window.__dpPendingQ`. The omelette and edit-mode bridges assume a parent-frame host (`window.parent.postMessage(..., "*")`) that may not exist.
- Impact: Order of `<script type="text/babel">` tags in HTML is load-bearing. Adding a new JSX file requires editing every HTML entry point. Refactoring is high-risk because all dependencies are implicit.
- Fix approach: Tolerate for prototype; the Next.js port replaces with ES modules + Zustand.

### `window.claude.complete()` host dependency

- File: `chat.jsx:81`
- Issue: The chat view assumes a host runtime injects `window.claude` (this codebase appears to run inside Claude.ai's sandbox / artifact runtime). There's no fallback, no mock, and no documentation in the repo about this dependency.
- Impact: Open `DataPraat.html` from `file://` or any other host → chat is broken with a silent rejected promise → user sees `"Er ging iets mis met de verbinding."` (`chat.jsx:88`).
- Fix approach: Stub `window.claude` with a deterministic mock when undefined; or document the host requirement at the top of `chat.jsx` / `DataPraat.html`.

### Path-with-space file (`website v2.html`)

- Issue: The space breaks `find ... | xargs ...`, breaks naïve URL refs (`%20` required), and is unfriendly to most CLIs.
- Fix approach: Rename to `website-v2.html` (or just `website.html` after archiving the original).

### React keys are array indices everywhere

- Files: `chat.jsx:115`, `:126`, `:128`, `:242`, `charts.jsx:13`, `:22`, `:56`, `:61`, `:93`, `:104`, `:141`, `:157`, `:175`, `pages.jsx:204`, `:371`, `trust.jsx:72`, `:126`, `scenario.jsx:102`, `overzicht-modes.jsx:121`, `:409`
- Impact: Re-ordering or filtering any of these lists will mis-attribute state to the wrong row. Most lists in this prototype are static, so it rarely bites — but the validation issue list (`pages.jsx:204`) and chat history (`chat.jsx:126`) are user-mutable.
- Fix approach: Prefer stable IDs (`v.id`, `m.id`) where present in `data.js`. Already true for most entities (validation issues have `id: "v1"`).

### `localStorage` writes without quota / privacy guards

- Files: `chat.jsx:8` (`dp_chat_seed`), `pages.jsx:7`–`:8` (`dp_overzicht_mode`), `scenario.jsx:214`, `:259`, `:267` (`dp_scenarios`), `shell.jsx:7`, `:26` (`dp_sb_collapsed`), `DataPraat.html:39`, `:46` (`dp_page`)
- Issue: `try/catch` is inconsistent — `chat.jsx:7` and `shell.jsx:7` wrap reads, but `scenario.jsx:259`, `:267` write JSON without try/catch and will throw on Safari private mode. No quota check before `JSON.stringify`-ing scenario state.
- Fix approach: Wrap all `localStorage.setItem` in `try { ... } catch {}`; consider a tiny shim for safe storage at port time.

### Fragile sidecar-file persistence in `design-canvas.jsx`

- File: `design-canvas.jsx:69`–`:104`
- Issue: Reads `.design-canvas.state.json` via `fetch('./...')` (only works when served, not on `file://`), writes via `window.omelette?.writeFile` (only exists in the omelette host runtime). There is a 150 ms `setTimeout` race-window comment (`:93`) that explicitly hides initial-paint flicker. If the sidecar is large the optimistic skipNextWrite logic can drop a write.
- Impact: Outside the omelette runtime, the canvas appears to work but never persists arrangement changes. Users may believe they saved when they didn't.
- Fix approach: Surface a "not in omelette host — changes are local-only" indicator when `window.omelette` is undefined.

---

## Missing Infrastructure

### No `package.json`, no lockfile, no build, no scripts

- Issue: No npm/yarn/pnpm manifest. JSX runs only because babel-standalone is loaded from a CDN. Anyone joining the project has zero `npm install` / `npm run dev` ergonomics. Dependencies (React 18.3.1, Babel 7.29.0) are pinned only via SRI hash on the CDN URL.
- Impact: Hard to onboard, hard to add tooling (TypeScript, ESLint, Prettier), hard to bundle, hard to deploy anywhere except as static files.
- Fix approach: Pre-handoff this is fine. As soon as work moves to the Next.js codebase per `HANDOFF.md`, this disappears.

### No tests of any kind

- Issue: Zero `*.test.*`, `*.spec.*`, no Jest / Vitest / Playwright configs, no `__tests__/` folder, no story files.
- Impact: Refactoring `pages.jsx` (446 lines) or `design-canvas.jsx` (622 lines) is unverifiable. Trust-score formulas, format helpers, and the chat-context normaliser (`chat.jsx:18`–`:27`) all silently regress.
- Fix approach: Move test investment to the Next.js port (where Vitest + Playwright are already in `HANDOFF.md` step 1). For the current prototype, smoke-screenshots in `screenshots/` are the only regression signal.

### No linter / formatter config

- Issue: No `.eslintrc*`, no `.prettierrc*`, no `biome.json`, no `tsconfig.json`. Two-space vs four-space indent appears in different files. `// eslint-disable-next-line` exists at `chat.jsx:69` but no ESLint is configured to honour or ignore it.
- Impact: Stylistic drift between hand-written and AI-written code; no automated guardrail when copying code into the production repo.
- Fix approach: Defer to production project. For the prototype, an editorconfig + Prettier check would be ~5 minutes of work and would pay off when copy-pasting into Next.js.

### No CI, no deploy target

- Issue: No `.github/workflows/`, no Vercel/Netlify config, no GitHub Pages setup. The HANDOFF talks about Vercel + GitHub Actions but none of it exists yet.
- Impact: "Send the prototype to a stakeholder" requires zipping the folder.
- Fix approach: Single Vercel static deploy of the folder is ~10 minutes; would also catch the `file://`-only assumptions in `design-canvas.jsx`.

### No README

- Issue: There is `HANDOFF.md` (production-oriented), `COMPONENTS.md` (component-oriented), and the brand guide in `uploads/`. There is no top-level README describing "what is this folder, which file do I open first?".
- Impact: A new contributor opening the repo must guess that `DataPraat.html` is the entry point and that `website v2.html` (not `website.html`) is the current marketing page.
- Fix approach: 30-line README listing each `.html` and what it shows.

### `.gitignore` is one line (`.DS_Store`) and `.DS_Store` is committed anyway

- File: `.gitignore` contents: `.DS_Store`
- Issue: The repo root contains a tracked `.DS_Store` (`ls -la` output line 1). The ignore rule was added after the file was committed.
- Fix approach: `git rm --cached .DS_Store` once.

---

## Content Drift

### Three sets of brand tokens (recap)

See "Brand drift" under Tech Debt. Net effect: any UI built today must choose which of `styles.css` / `website v2.html` / brand-guide v1.1 / `HANDOFF.md` HSL block to follow — they all conflict slightly.

### Brand-guide changelog says oklch, code uses hex

- File: `uploads/datapraat-brand-guide-v1.1.md:9`, `:347`
- Issue: Brand guide explicitly tells the reader "productie-codebase (oklch tokens) moet hierop worden bijgewerkt" — but the codebase has no oklch tokens; it has hex (in `styles.css`) and HSL (in `HANDOFF.md`). The migration step is unstarted and the brand-guide note is stale relative to the code's reality.
- Fix approach: Either update the guide to acknowledge "hex is canonical until Next.js port" or genuinely move to oklch in `styles.css`.

### Inline copy duplicates `data.js` numbers

- Files: `chat.jsx:39`–`:60` (system prompt has all KPIs, top-categories, verwijzers, validation issues hard-coded as text), `pages.jsx:167`, `:321`, `overzicht-modes.jsx:227`–`:236`, `klopt-dit.jsx:62`
- Issue: Edit `data.js` `gemeente.jaarbudget: 9_500_000` → narrative still reads `"75% van €9,5M jaarbudget"` in three places that won't update.
- Fix approach: Either generate the narrative from `data.js`, or accept the prototype-level coupling but lift one obvious pattern (e.g. the LLM system prompt) into a `buildSystemPrompt(data)` function.

### `screenshots/` is referenced but stale

- Files: `DataPraat one-pager.html:589`–`:613`, `DataPraat one-pager-print.html:327`–`:351` reference `screenshots/overzicht.png`, `screenshots/chat.png?v=2`, `screenshots/validatie.png`, `screenshots/lineage.png`. The `?v=2` cache-buster is only on `chat.png` (someone re-shot just one screenshot). Other shot filenames in the folder (`scenario2.png` … `scenario6.png`) are not referenced from any HTML.
- Impact: One-pager screenshots may not reflect current `DataPraat.html` UI; multiple scenario shots exist with no canonical pointer.
- Fix approach: Re-shoot all four referenced screenshots from the live prototype, or document which one is the "hero" shot. Delete unused `scenario2-6.png` if they're abandoned.

### `styles.css?v=22` cache-buster vs `styles.css?v=18`

- Files: `DataPraat.html:10` uses `?v=22`; `woorden-modus-verkenning.html:10` uses `?v=18`
- Impact: The two consumers of the shared stylesheet are on different "versions" of the same file. Either one of them is intentionally pinned to an older view (no — `styles.css` is one file, the query string only affects browser cache), or someone forgot to bump `woorden-modus-verkenning.html`.
- Fix approach: Bump both, or remove the cache-buster (a single-file workspace doesn't really need it).

### `uploads/` doubles as "context dump"

- Files: 24 entries in `uploads/`, of which 20 are PNGs (`pasted-1776...png`) with auto-generated names and no metadata, plus the duplicate brand guides, the original brand-guide template, and the build spec. Multiple PNGs are byte-identical pairs (e.g. `pasted-1776866128594-0.png` and `pasted-1776866129278-0.png`, both 14,426 bytes; `pasted-1776943524982-0.png` and `pasted-1776943527075-0.png`, both 63,668 bytes — confirmed via `diff -q`).
- Impact: ~3.7 MB of repo bloat; no way to know which paste was important. The folder is committed to git, so every clone pays the cost.
- Fix approach: Move `uploads/` outside the repo or add it to `.gitignore`; keep only the brand-guide and build-spec markdown files at the repo root.

### `brand-guide-template.md` separate from `datapraat-brand-guide-v1.1.md`

- Files: `uploads/brand-guide-template.md`, `uploads/datapraat-brand-guide-v1.1.md`
- Issue: The template is a generic skeleton kept alongside the filled-in version. Unclear whether the template is meant as a re-usable asset for future brands or vestigial.
- Fix approach: Document intent in a `uploads/README.md`, or delete the template.

---

## Accessibility Gaps

### No `aria-*` / `role` / `tabindex` on interactive `<div>` / `<svg>`

- Counts: ~22 ARIA-related attributes total across all HTML + JSX (`grep aria-\|role=`); ~68 `<svg>` elements in JSX (most without `<title>` / `role="img"` / `aria-label`); ~49 `<button>` elements vs many more clickable `<div>`s (`onClick` on non-button elements: ~61 occurrences, `chat.jsx:115`, `:242`; `pages.jsx`; `overzicht-modes.jsx:409`).
- Impact: KPI cards, sidebar items, chart "Vraag hierover" pills, suggestion cards, and most charts are not reachable by keyboard and not announced by screen-readers. The chat input (`chat.jsx:115` clickable suggestion cards) cannot be activated with the keyboard alone unless the user lands on the underlying anchor.
- Fix approach: Use `<button>` for clickable cards, give every `<svg>` either `role="img"` + `<title>` or `aria-hidden="true"`, and label every form input. The shadcn migration in `HANDOFF.md` solves this for free; for the current HTML pages, a one-pass sweep is recommended.

### Form inputs in `website.html` lack accessible labelling

- File: `website.html:1489`–`:1606`
- Issue: Inputs use `<label class="field">` wrapper with `<input placeholder="...">` but the `placeholder` is doing the work of a label. Selects (`:1513`, `:1531`, `:1541`, `:1553`) have visible label text inside `.field .lab` but the `<select name=...>` has no `id` and the label is not associated via `for`.
- Impact: Screen readers may not announce labels; placeholders disappear on focus.
- Fix approach: Add `id` to each input/select and `<label for="...">`, or wrap correctly so the implicit `<label>` association works.

### No `<noscript>` fallback anywhere

- Issue: `grep noscript` returns nothing across all HTML. With JS disabled, `DataPraat.html` is a blank page (it relies on React + Babel + JSX runtime).
- Impact: Niche; mostly bots and JS-disabled users see nothing.
- Fix approach: Optional. A simple `<noscript>JavaScript is required.</noscript>` would at least be polite.

### `lang="nl"` is used (good) but mixed with English markup

- All HTML pages declare `lang="nl"` correctly. No concerns there.

### Single `@media (max-width: ...)` query

- Files: `styles.css:1696`, `website.html:1185`, `website v2.html:1408`, no responsive plan in `DataPraat.html`
- Impact: Sidebar grid is hard-coded to `260px 1fr` (`styles.css:106`); mobile rendering is undefined for the dashboard prototype. Probably acceptable (target is desktop), but should be documented.

---

## TODO / FIXME / HACK markers

`grep -rn "TODO\|FIXME\|HACK\|XXX"` across `.html`, `.jsx`, `.js`, `.css`, `.md` (excluding `.planning/`) returns **no matches**.

Note: The absence of TODO comments is not evidence of cleanliness — most of the rough edges above are simply not annotated. Treat this CONCERNS document as the missing TODO list.

---

## Dead / Unreferenced Code

- `screenshots/scenario2.png` … `scenario6.png` — present in `screenshots/`, never referenced from any `.html` or `.jsx`.
- `uploads/datapraat-brand-guide-v1.1-19f5247b.md` — byte-identical duplicate of `uploads/datapraat-brand-guide-v1.1.md`.
- `uploads/pasted-1776866128594-0.png` ↔ `uploads/pasted-1776866129278-0.png` and `uploads/pasted-1776943524982-0.png` ↔ `uploads/pasted-1776943527075-0.png` — duplicate uploads (byte-identical).
- `uploads/brand-guide-template.md` — generic skeleton, no clear consumer.
- `Icon` symbol referenced from `chat.jsx:100` but not visibly defined — either dead-code path or runtime bug (see Tech Debt).

---

## Scaling / Future Concerns

### Chat seeds via `localStorage` will outlive their relevance

- File: `chat.jsx:8` (`dp_chat_seed`)
- Issue: The chat seed, if set, replaces fresh state on every load. There is no expiry or version key. After the demo, stakeholders' browsers carry stale chat content forever.
- Fix approach: Add a version key (`dp_chat_seed_v1`) and bump on schema change.

### Single-gemeente assumption hard-coded

- See "Hardcoded mock data" above. The `GemeentePicker` mentioned in `COMPONENTS.md:94` exists in spec only — `data.js:5`–`:13` provides exactly one gemeente object. Switching gemeente in the picker would do nothing.

### `overzicht-modes.jsx` (466 lines), `design-canvas.jsx` (622 lines), `scenario.jsx` (503 lines), `pages.jsx` (446 lines)

- Issue: Largest JSX files. None are split into smaller components. They're at the threshold where a reader has to scroll to understand a single feature.
- Fix approach: Defer until Next.js port; the file structure in `HANDOFF.md:175`–`:232` already prescribes a split (per-feature folders).

---

_Concerns audit: 2026-04-25_
