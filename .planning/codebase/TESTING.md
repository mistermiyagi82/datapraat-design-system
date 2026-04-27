# Testing Patterns

**Analysis Date:** 2026-04-25

## Status: NO TESTS EXIST

This repository has **zero automated tests** and **no testing infrastructure** of any kind. This is a static design-system / browser-rendered prototype repo.

### Evidence

- No `*.test.*`, `*.spec.*`, `__tests__/`, `__mocks__/`, `cypress/`, `playwright/`, `e2e/`, or `tests/` files or directories found anywhere in the tree.
- No `package.json` (the repo has no Node project scaffolding at all).
- No test-framework config files: no `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`, `karma.conf.*`, `mocha*.json`.
- No lint or typecheck config: no `.eslintrc*`, `.prettierrc*`, `tsconfig.json`, `biome.json` (one stray `// eslint-disable-next-line` in `chat.jsx:69` is an editor-only hint, not a configured rule).
- No CI workflow: no `.github/workflows/`, no `.gitlab-ci.yml`, no `.circleci/`.
- The only references to the literal string "test" in the codebase are CSS classes named `.testimonial` in `website v2.html` / `website.html` and one regex `email` validator (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)` in `website v2.html:2497, 2609`) — none of these are test code.

### Implications

There is **no way today to**:

- Run a test suite (no `npm test`, no runner present).
- Verify a refactor preserves behaviour.
- Catch regressions in the React components, the chart math (`charts.jsx`), the `localStorage` persistence (`shell.jsx:6-9`, `pages.jsx:7`), the chat seed flow (`chat.jsx:5-12`), or the parent-frame edit-mode protocol (`DataPraat.html:54-62`).
- Validate the mock data shapes in `data.js` against what components in `pages.jsx`, `trust.jsx`, `scenario.jsx`, `klopt-dit.jsx` actually consume.

The current verification loop is **manual visual testing** by opening `DataPraat.html` (and the other `*.html` files) in a browser.

## Required Setup Before Any Code-Touching Phase

If a future GSD phase modifies behavior (logic, state, derived values, formatters, chart math, or the routing in `DataPraat.html:91-104`), a testing setup must be added first. Recommended minimum, ordered:

### 1. Bootstrap a Node project

The repo currently has no `package.json`. Initialise one before installing any tooling.

```bash
npm init -y
```

Add a `.gitignore` entry for `node_modules/` (currently `.gitignore` only contains `.DS_Store`, see `.gitignore:1`).

### 2. Pick a runner appropriate to the no-bundler architecture

The codebase uses Babel-Standalone in the browser and `window.*` globals as the module system. There are two viable strategies:

**Option A — Vitest + jsdom + happy-dom (recommended for new code):**

- Add `vitest`, `@vitest/ui`, `jsdom` (or `happy-dom`), `@testing-library/react`, `@testing-library/jest-dom`.
- Convert files-under-test to plain ES modules (or use a Vite alias to load them as scripts and pull globals off `window`).
- Useful for: new pure functions (`fmtEUR`, `fmtNum`, `fmtCompact` in `shared.jsx:62-68`), chart math helpers (`xOf`, `yOf`, arc generators in `charts.jsx:42-49`, `charts.jsx:71-89`), date / number formatting, `localStorage` persistence helpers.

**Option B — Playwright against the static HTML (recommended for protecting existing prototypes):**

- Add `@playwright/test`.
- Serve the repo with any static server (`npx serve .`) and drive `DataPraat.html` directly.
- Useful for: routing, drawer open/close, mode-switcher persistence (`pages.jsx:7-8`), Cmd+K shortcut (`DataPraat.html:71-81`), localStorage rehydration, chat input.
- Capture screenshots of each page (the existing `screenshots/` directory suggests visual reference snapshots are already valued).

For maximum coverage with minimum refactoring, install **both**: Vitest for any newly-extracted pure logic, Playwright for the existing JSX prototypes.

### 3. Establish file conventions

Once a runner is chosen, lock in the conventions before writing tests:

- **Location:** co-locate as `*.test.js` next to source (e.g. `shared.test.js` next to `shared.jsx`) — matches the flat single-folder layout of the current codebase. Avoid a `tests/` mirror tree until the source itself is reorganised into folders.
- **Naming:** `*.test.js` for unit/integration; `*.e2e.ts` or `e2e/*.spec.ts` for Playwright.
- **Language for tests:** match the code under test. JSX → `.jsx` test files via Babel; pure helpers → `.js`. Don't introduce TypeScript only for tests.
- **Structure:** standard `describe` / `it` (or `test`) blocks. Suites in Dutch are fine for domain assertions ("formatteert bedragen in NL-locale") and English for framework concerns; pick one and stick to it per file.
- **Assertions:** prefer `expect(...).toBe(...)` style. Use `@testing-library/react`'s `render`, `screen.getByRole`, `userEvent` for components.

### 4. Pre-test lint / format pass

Before any large refactor, also add Prettier + ESLint (see CONVENTIONS.md → _Linting / Formatting_) so the test-driven changes do not produce mixed-purpose diffs.

## What to Test First (priority order)

1. **`shared.jsx` formatters** (`fmtEUR`, `fmtNum`, `fmtCompact`, lines 62-68) — pure, NL-locale-sensitive, reused everywhere.
2. **`charts.jsx` scale + arc helpers** — `yScale`, `xOf`, `yOf`, `arc` (`charts.jsx:9, 42-49, 77-78`). Math errors here are silently visual.
3. **`localStorage` rehydration paths** with corrupt JSON — current `try/catch` blocks in `shell.jsx:6-9` and `chat.jsx:5-12` are untested.
4. **Routing in `DataPraat.html:91-104`** — verify each `page` value renders the expected page component, including the `klopt-dit-legacy` redirect.
5. **`renderMD` markdown helper** in `chat.jsx:185-191` — XSS surface (`dangerouslySetInnerHTML` at `chat.jsx:134`); ensure escaping of `<`, `>`, `&` works.
6. **Edit-mode postMessage protocol** in `DataPraat.html:54-67` — fragile contract with the parent frame.

## Coverage

**Current coverage: 0%.** No baseline exists.

When a runner is added, target ≥80% on the helpers in `shared.jsx` and `charts.jsx` (pure functions, easy wins) and use Playwright smoke-runs for visual prototypes rather than chasing JSX-component coverage numbers, which would be high-cost / low-value for design-system pages whose primary function is appearance.

---

**Bottom line:** any phase that edits non-trivial JS/JSX logic in this repo must first create `package.json`, install Vitest (or Playwright), and write at least the `shared.jsx` / `charts.jsx` helper tests as a baseline. Skipping this step means refactors will be reviewed by eye only.
