# Requirements: DataPraat

**Defined:** 2026-04-26
**Core Value:** A municipality user opens DataPraat, asks a question about their data in plain Dutch, and gets back a correct, trust-marked chart with conversation continuity.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: App boots in dev (`pnpm dev`) and produces a successful production build (`pnpm build`) on Next.js 15 + React 19 + TypeScript 5 (strict)
- [ ] **FOUND-02**: Tailwind 4 is configured with DataPraat design tokens (ink levels, brand indigo, chart PxQ semantics, status triads, spacing, radii, fonts) ported from prototype `styles.css` into `@theme` directives
- [ ] **FOUND-03**: shadcn 4 (`base-vega` style) + Base UI + Tabler Icons are installed and the shadcn CLI can add new components
- [x] **FOUND-04**: ESLint, Prettier, and TypeScript strict mode are configured and pass on a clean checkout
- [ ] **FOUND-05**: Production build uses `output: 'standalone'`; a working Dockerfile + Nixpacks config builds and runs the app
- [ ] **FOUND-06**: Persistence layer uses `better-sqlite3` mounted at `/data` and is hidden behind a storage interface that can later swap to Postgres
- [ ] **FOUND-07**: All config is env-driven; `.env.example` lists every required variable; no secrets, no Vercel-only APIs in code

### Design system

- [ ] **DS-01**: Design tokens from prototype `styles.css` (`:root` variables) are ported into Tailwind 4 `@theme` and consumable across the app
- [ ] **DS-02**: Core shadcn primitives are installed and themed: button, card, input, dialog, dropdown-menu, tabs, tooltip, toast, separator
- [ ] **DS-03**: DataPraat-specific primitives are ported as TypeScript components: `Icon`, `TrustBadge`, `AskButton`, NL-format helpers (currency, number, percent — Dutch locale)
- [ ] **DS-04**: A `/internal/design` route documents tokens, typography, color usage, and primitive components for team reference

### Marketing

- [ ] **MKT-01**: Landing route at `/` ports `website v2.html` content into Next.js components using the DataPraat design system
- [ ] **MKT-02**: Landing renders SSR with good Lighthouse scores (perf/SEO/a11y all ≥ 90 on desktop) and is responsive across mobile/tablet/desktop
- [ ] **MKT-03**: Landing has a clear, primary CTA that links into the application surface (`/app` or equivalent)

### Chat (the spine)

- [ ] **CHAT-01**: Chat API route uses AI SDK 5 wired to both Anthropic and OpenAI providers; the active model is selectable via env (`DEFAULT_MODEL`)
- [ ] **CHAT-02**: MCP client (`@modelcontextprotocol/sdk`) connects to the configured MCP server (default: VVD MCP) and exposes its tools to the model at runtime
- [ ] **CHAT-03**: Chat UI streams responses, opens via Cmd+K launcher and full-screen mode, and renders text + react-markdown (with remark-gfm) + tool-call results
- [ ] **CHAT-04**: When a tool returns chartable data, chat renders Recharts inline (line, bar, stacked-bar, KPI tile) matching the chart taxonomy in the prototype
- [ ] **CHAT-05**: Conversation history is persisted to sqlite; user can list past conversations, resume any conversation, and delete a conversation
- [ ] **CHAT-06**: Charts emitted from chat carry trust marks showing provenance (MCP tool name, dataset, time range)

### Overzicht

- [ ] **OVZ-01**: Route `/app/overzicht` renders the default `cijfers` mode using real VVD data via MCP — no mock data
- [ ] **OVZ-02**: KPI tile component (PxQ-aware coloring, delta semantics) is ported from the prototype and used on Overzicht
- [ ] **OVZ-03**: At least one chart on Overzicht pulls live from VVD MCP and renders correctly with proper Dutch number formatting

### Stubs (KloptDit + Scenario)

- [ ] **STUB-01**: Route `/app/klopt-dit` ships as a styled placeholder using the design system, with prototype copy in place; no real data wiring
- [ ] **STUB-02**: Route `/app/scenario` ships as a styled placeholder with knobs visible but non-functional, using prototype copy

### Operability

- [ ] **OPS-01**: `/api/health` endpoint responds 200 with build info; Railway `healthcheckPath` is configured to use it
- [ ] **OPS-02**: API routes emit structured logs with request id, route, status, and latency
- [ ] **OPS-03**: README documents local dev (`pnpm i && pnpm dev`), env setup, Railway deploy, and the migration path to Azure Container Apps + Azure Files
- [ ] **OPS-04**: A fresh clone runs end-to-end with `pnpm i && pnpm dev` (no manual config beyond copying `.env.example`)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication & multi-tenancy

- **AUTH-V2-01**: Real authentication via NextAuth or equivalent (per-user accounts, sessions)
- **AUTH-V2-02**: Per-user / per-tenant scoping of conversations and data
- **TENANT-V2-01**: Admin UI to configure per-customer MCP servers, branding, and feature flags

### Trust + scenarios (full wiring)

- **KD-V2-01**: KloptDit validation view fully wired (live data, validation rules, surface-able anomalies)
- **KD-V2-02**: KloptDit lineage view with end-to-end provenance (source dataset → MCP tool → query → chart)
- **SC-V2-01**: Scenario knobs drive a live forecasting backend contract; results stream back as charts + narrative
- **SC-V2-02**: Scenario state can be saved, named, and shared via link

### Persistence + scale

- **PERS-V2-01**: Storage abstraction has a Postgres implementation; swap is selected via env
- **PERS-V2-02**: Production deploy on Azure Container Apps with Azure Files volume for sqlite (or managed Postgres)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                                                                                                                          | Reason                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Real auth in v1                                                                                                                  | Demo audience uses shared link; auth complexity isn't justified yet            |
| Full KloptDit + Scenario wiring in v1                                                                                            | Too much surface; each needs its own backend contract; ship as stubs first     |
| Neo4j / graphiti                                                                                                                 | Vibathon-specific knowledge graph; DataPraat exposes data via MCP, not a graph |
| Attio integration                                                                                                                | Vibathon CRM integration; not part of the DataPraat product                    |
| Google APIs (`googleapis`)                                                                                                       | Vibathon-specific ingestion; out of DataPraat product scope                    |
| `pdf-parse`                                                                                                                      | Vibathon-specific ingestion path                                               |
| LangChain                                                                                                                        | AI SDK 5 + MCP cover what we need; LangChain adds weight without unique value  |
| Vercel deploy                                                                                                                    | Sqlite + persistent volumes don't fit Vercel; Railway → Azure is the path      |
| The duplicate prototype HTMLs (`website.html`, `DataPraat.html`, `Logos.html`, both one-pagers, `woorden-modus-verkenning.html`) | Replaced by the Next.js app; kept only as reference, not migrated              |
| Mobile-native app                                                                                                                | Web-first; mobile responsive is enough for v1                                  |
| Real-time multi-user collaboration on a chat                                                                                     | Single-user chat history is sufficient for v1                                  |
| Internationalization                                                                                                             | Dutch UI is the product; English is later                                      |
| Manual JSX-via-Babel patterns from prototype (`window.*` globals)                                                                | Anti-pattern in TS; we rebuild clean with ES modules + RSC                     |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status   |
| ----------- | ------- | -------- |
| FOUND-01    | Phase 1 | Complete |
| FOUND-02    | Phase 2 | Pending  |
| FOUND-03    | Phase 2 | Pending  |
| FOUND-04    | Phase 1 | Complete |
| FOUND-05    | Phase 1 | Pending  |
| FOUND-06    | Phase 1 | Pending  |
| FOUND-07    | Phase 1 | Pending  |
| DS-01       | Phase 2 | Pending  |
| DS-02       | Phase 2 | Pending  |
| DS-03       | Phase 2 | Pending  |
| DS-04       | Phase 2 | Pending  |
| MKT-01      | Phase 3 | Pending  |
| MKT-02      | Phase 3 | Pending  |
| MKT-03      | Phase 3 | Pending  |
| CHAT-01     | Phase 4 | Pending  |
| CHAT-02     | Phase 4 | Pending  |
| CHAT-03     | Phase 4 | Pending  |
| CHAT-04     | Phase 5 | Pending  |
| CHAT-05     | Phase 4 | Pending  |
| CHAT-06     | Phase 5 | Pending  |
| OVZ-01      | Phase 6 | Pending  |
| OVZ-02      | Phase 6 | Pending  |
| OVZ-03      | Phase 6 | Pending  |
| STUB-01     | Phase 7 | Pending  |
| STUB-02     | Phase 7 | Pending  |
| OPS-01      | Phase 1 | Pending  |
| OPS-02      | Phase 7 | Pending  |
| OPS-03      | Phase 7 | Pending  |
| OPS-04      | Phase 7 | Pending  |

**Coverage:**

- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---

_Requirements defined: 2026-04-26_
_Last updated: 2026-04-26 — traceability filled by ROADMAP.md_
