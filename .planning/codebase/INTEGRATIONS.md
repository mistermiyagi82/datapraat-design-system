# External Integrations

**Analysis Date:** 2026-04-25

## Summary

This is a static design-system / prototype repository. It has **no backend, no API calls, no authentication, no analytics, no monitoring, no CI/CD, and no databases**. All "integrations" are runtime CDN dependencies for fonts and the React+Babel toolchain. All data shown in the UI is hard-coded mock data in `data.js`.

## APIs & External Services

**Backend APIs:**

- None. There are no `fetch()`, `XMLHttpRequest`, `axios`, or `WebSocket` calls anywhere in the JSX, JS, or HTML. UI state is entirely driven by `window.DataPraatData` defined in `data.js`.

**SaaS / third-party services:**

- None integrated. Service names like Stripe, Supabase, AWS, Auth0, Firebase, Sentry, PostHog, Segment, Mixpanel, Google Analytics, etc. do not appear in the codebase.

## CDNs

**unpkg.com (script CDN):**

- `https://unpkg.com/react@18.3.1/umd/react.development.js`
  - Used in: `DataPraat.html` line 12, `Logos.html` line 159
  - SRI: `sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L`
- `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js`
  - Used in: `DataPraat.html` line 13, `Logos.html` line 160
  - SRI: `sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm`
- `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js`
  - Used in: `DataPraat.html` line 14, `Logos.html` line 161
  - SRI: `sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y`
  - Note: The `.development.js` builds of React are loaded — these are unminified and intended for development only. Acceptable for a prototype, not for production.

**Marketing/print HTML files do NOT load React or Babel:**

- `website.html`, `website v2.html`, `DataPraat one-pager.html`, `DataPraat one-pager-print.html`, and `woorden-modus-verkenning.html` are pure HTML/CSS pages with at most small inline `<script>` blocks for local interactions (e.g. `website.html` line 1716 onward, `woorden-modus-verkenning.html` line 789). They do not depend on unpkg.

## Font Services

**Google Fonts:**

- Service: `https://fonts.googleapis.com` (CSS) and `https://fonts.gstatic.com` (woff2)
- `preconnect` hints precede each font stylesheet link.
- Stylesheets loaded:
  - `DataPraat.html` line 9 — Inter (300–700) + Fraunces (300–600, opsz 9..144) + JetBrains Mono (400/500)
  - `Logos.html` line 9 — Inter (300–800) + Fraunces (400–700, opsz 9..144) + JetBrains Mono (400/500/600)
  - `website.html` line 9 — Inter (300–700) + Fraunces (300–600, opsz 9..144) + JetBrains Mono (400/500)
  - `website v2.html` line 9 — same as `website.html`
  - `DataPraat one-pager.html` line 15 — Inter (300–700) + Fraunces (300–500, opsz 9..144) + JetBrains Mono (400/500)
  - `DataPraat one-pager-print.html` line 7 — same as `DataPraat one-pager.html`
  - `woorden-modus-verkenning.html` line 9 — same as `DataPraat.html`
- All font links use `display=swap`.
- No SRI hashes on font links (Google Fonts CSS varies per UA).

## Image Hosts

**External image hosts:**

- None. No `<img src="https://...">` references anywhere in the HTML or JSX.

**Local images:**

- All raster assets are checked in and served relatively from this repo:
  - `screenshots/` — UI screenshots referenced from `DataPraat one-pager.html` (lines 589, 597, 605, 613) and `DataPraat one-pager-print.html` (lines 327, 335, 343, 351). Filenames: `overzicht.png`, `chat.png`, `validatie.png`, `lineage.png`, `scenario.png`, `scenario2.png`–`scenario6.png`.
  - `uploads/` — Brand guide source material and pasted reference screenshots (`pasted-*.png`).

## 3rd-Party Scripts in HTML

**External `<script>` tags:** Only the three unpkg scripts listed above (React, ReactDOM, Babel Standalone), and only on `DataPraat.html` and `Logos.html`.

**Inline `<script>` blocks:**

- `DataPraat.html` line 164 — `<script type="text/babel">…</script>` containing the `<App/>` root and the `ReactDOM.createRoot(...).render(...)` call (line 159 of the inline block in the file, mounted on `#root`).
- `Logos.html` line 1486 — same pattern, mounts `<App/>` (which renders `<ApplicationStage/>` at line 1479).
- `website.html` line 1716 — small vanilla-JS script implementing a local `render(step)` step controller (lines 1755, 1783).
- `website v2.html` line 2009 — local vanilla-JS interactions only.
- `woorden-modus-verkenning.html` line 789 — local vanilla-JS interactions only.
- `DataPraat one-pager.html` and `DataPraat one-pager-print.html` line ~490 — print/layout helpers; no external dependencies.

**Tracking / analytics / tag managers:**

- None. No `gtag`, `dataLayer`, `_paq`, `analytics.js`, `gtm.js`, `fbq`, `hotjar`, `clarity`, `plausible`, or `mixpanel` references.

## Data Storage

**Databases:**

- None.

**File Storage:**

- Local filesystem only. The repository ships its own assets.

**Caching:**

- None.

**Client-side persistence:**

- None detected. No `localStorage`, `sessionStorage`, `IndexedDB`, or cookie usage in any of the JSX/HTML files.

## Authentication & Identity

**Auth Provider:**

- None. There is no login flow, no token handling, no user model.

## Monitoring & Observability

**Error Tracking:**

- None.

**Logs:**

- None (beyond stray `console.log` debug if any — none detected in the JSX files reviewed).

**Performance / RUM:**

- None.

## CI/CD & Deployment

**Hosting:**

- Not deployed from this repo.

**CI Pipeline:**

- None. No `.github/workflows/`, no `.gitlab-ci.yml`, no `.circleci/`, no `Jenkinsfile`, no `vercel.json`, no `netlify.toml`.

**Containerization:**

- None. No `Dockerfile` or `docker-compose.yml`.

## Environment Configuration

**Required env vars:**

- None.

**Secrets location:**

- No secrets in the repo. `.gitignore` ignores `.DS_Store` only; no `.env*` files exist.

## Webhooks & Callbacks

**Incoming:**

- None.

**Outgoing:**

- None.

## Notes for Downstream Consumers

If a future implementation (see `HANDOFF.md`) replaces this prototype with a Next.js production app, integrations to plan for include — none of which are wired up here:

- A real data API for the Riemsterdal-style mock content currently in `data.js`.
- An auth/identity provider (none implied by current UI; the prototype assumes a logged-in user implicitly).
- Self-hosted or build-time-bundled fonts to avoid the runtime dependency on `fonts.googleapis.com`.
- A bundler-managed React install to replace the unpkg + `@babel/standalone` development setup.

---

_Integration audit: 2026-04-25_
