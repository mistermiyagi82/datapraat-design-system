# Roadmap: DataPraat

**Created:** 2026-04-26
**Granularity:** standard
**Total v1 requirements:** 29
**Coverage:** 29/29 mapped

## Strategy

Foundation first (boots, builds, deploys), then design system in parallel with marketing port. Chat is the v1 spine and the largest phase — split into a backbone phase (wiring, streaming, persistence) and a generative-charts/trust phase that can validate independently. Overzicht layers live VVD MCP data on top of the chat-era infrastructure. Stubs and operability polish close v1.

## Phases

- [ ] **Phase 1: Foundation** - Next.js 15 + TS strict + Tailwind 4 + shadcn `base-vega` scaffolded, builds in dev/prod, deploys to Railway via Nixpacks with `/data` volume and healthcheck.
- [ ] **Phase 2: Design System** - DataPraat tokens + shadcn primitives + brand primitives (`Icon`, `TrustBadge`, `AskButton`, NL formatters) consumable across the app and documented at `/internal/design`.
- [ ] **Phase 3: Marketing Landing** - `/` ports `website v2.html` into SSR Next.js components on the design system, with strong Lighthouse scores and a clear CTA into the app.
- [ ] **Phase 4: Chat Backbone** - AI SDK 5 chat route with Anthropic + OpenAI providers, MCP client wired to VVD MCP, streaming UI (Cmd+K + full-screen), conversation history persisted to sqlite.
- [ ] **Phase 5: Generative Charts & Trust** - Tool-call results render as inline Recharts (line/bar/stacked/KPI) with provenance trust marks for MCP tool, dataset, and time range.
- [ ] **Phase 6: Overzicht (Live VVD)** - `/app/overzicht` renders default `cijfers` mode against real VVD MCP data, with PxQ-aware KPI tiles and at least one live chart in proper Dutch formatting.
- [ ] **Phase 7: Stubs & Operability Polish** - `/app/klopt-dit` and `/app/scenario` ship as styled placeholders; structured logging, README, and one-command setup close v1.

## Phase Details

### Phase 1: Foundation

**Goal**: A clean Next.js 15 app boots in dev, builds for production, and deploys to Railway with persistent storage and healthcheck wired.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-04, FOUND-05, FOUND-06, FOUND-07, OPS-01
**Success Criteria** (what must be TRUE):

1. A fresh clone with `pnpm i && pnpm dev` boots a Next.js 15 + React 19 app at `localhost:3000`.
2. `pnpm build` produces a successful `output: 'standalone'` production build with TypeScript strict mode + ESLint + Prettier passing on a clean tree.
3. The app builds and runs from the included `Dockerfile`/Nixpacks config and exposes `/api/health` returning 200 with build info.
4. A `better-sqlite3`-backed storage interface reads/writes at `/data` (Railway volume path) and is hidden behind an interface seam ready for a Postgres swap.
5. `.env.example` enumerates every required env var and the codebase contains no Vercel-only APIs and no hardcoded secrets.
   **Plans**: 5 plans

- [x] 01-01-PLAN.md — Wave 0 test infrastructure & verification scripts
- [x] 01-02-PLAN.md — Toolchain + scaffold trim (pin Node/pnpm, ESLint 9, Prettier, strict TS, next.config.ts standalone)
- [ ] 01-03-PLAN.md — Env + logger + storage seam (Zod env, pino, sqlite repo + migrations)
- [ ] 01-04-PLAN.md — /api/health Route Handler (6-field contract, 200/503)
- [ ] 01-05-PLAN.md — Deploy artifacts (Dockerfile, .dockerignore, nixpacks.toml, railway.toml) + Railway human-verify

### Phase 2: Design System

**Goal**: DataPraat's visual language is encoded as Tailwind 4 tokens and reusable primitives that every later phase consumes without re-inventing styling.
**Depends on**: Phase 1
**Requirements**: FOUND-02, FOUND-03, DS-01, DS-02, DS-03, DS-04
**Success Criteria** (what must be TRUE):

1. Every `:root` token from prototype `styles.css` (ink levels, brand indigo, chart PxQ semantics, status triads, spacing, radii, fonts) is available as a Tailwind 4 `@theme` token and renders identically to the prototype on a side-by-side swatch page.
2. `pnpm dlx shadcn@latest add button` (and the other core primitives — card, input, dialog, dropdown-menu, tabs, tooltip, toast, separator) succeeds against the configured `base-vega` style and produces themed components.
3. `Icon`, `TrustBadge`, `AskButton`, and Dutch-locale `fmtEUR`/`fmtNum`/`fmtPercent` helpers are importable as typed TypeScript modules and used in at least one demo page.
4. `/internal/design` renders typography scales, color palettes, primitive examples, and trust-mark tiers as a living reference.
   **Plans**: TBD
   **UI hint**: yes

### Phase 3: Marketing Landing

**Goal**: A first-time visitor lands on a fast, accessible marketing page that explains DataPraat and routes them into the application surface.
**Depends on**: Phase 2 (Phase 1 transitively). Can start in parallel with Phase 4 once Phase 2 is complete.
**Requirements**: MKT-01, MKT-02, MKT-03
**Success Criteria** (what must be TRUE):

1. Visiting `/` renders a server-side-rendered landing page whose content matches `website v2.html`, composed of Next.js components built from the DataPraat design system.
2. The landing page is responsive across mobile, tablet, and desktop breakpoints and scores ≥ 90 on Lighthouse Performance, SEO, and Accessibility on desktop.
3. A primary CTA on the landing page navigates the visitor into the application surface (e.g. `/app` or `/app/overzicht`).
   **Plans**: TBD
   **UI hint**: yes

### Phase 4: Chat Backbone

**Goal**: A user can open chat (Cmd+K or full-screen), ask a question, get a streamed response that uses VVD MCP tools, and resume that conversation later.
**Depends on**: Phase 1, Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-05
**Success Criteria** (what must be TRUE):

1. Pressing Cmd/Ctrl+K opens a chat launcher; the user can also enter a full-screen chat view, both styled with the design system.
2. A user message streams back a response from the configured provider (Anthropic or OpenAI, chosen via `DEFAULT_MODEL`), rendering markdown (with remark-gfm) and surfacing tool-call structure as it arrives.
3. The chat session connects to the configured MCP server (default: VVD MCP) and the model can invoke at least one MCP tool whose result is reflected in the response.
4. Past conversations appear in a history list; the user can open any one to resume it and can delete a conversation, with state persisted to sqlite via the storage interface.
   **Plans**: TBD
   **UI hint**: yes

### Phase 5: Generative Charts & Trust

**Goal**: When chat answers a question with quantitative data, the user sees a correctly-rendered Recharts chart with visible provenance — closing the core value loop.
**Depends on**: Phase 4
**Requirements**: CHAT-04, CHAT-06
**Success Criteria** (what must be TRUE):

1. When an MCP tool returns chartable data, the chat renders an inline Recharts chart picked from the prototype taxonomy (line, bar, stacked-bar, KPI tile) without breaking the streaming flow.
2. Every chart rendered from chat shows a trust mark with the originating MCP tool name, dataset, and time range, expanding (tooltip or inline) to the full provenance.
3. Numeric values in chart axes, tooltips, and KPI tiles use Dutch locale formatting (currency, number, percent) via the design-system helpers.
   **Plans**: TBD
   **UI hint**: yes

### Phase 6: Overzicht (Live VVD)

**Goal**: A municipality user lands on `/app/overzicht` and sees their actual VVD numbers — KPI tiles and at least one live chart — pulled live via MCP.
**Depends on**: Phase 4 (MCP wiring), Phase 5 (chart components + trust marks)
**Requirements**: OVZ-01, OVZ-02, OVZ-03
**Success Criteria** (what must be TRUE):

1. Navigating to `/app/overzicht` loads the default `cijfers` mode populated entirely from live VVD MCP responses, with no mock data fallbacks in the rendered output.
2. KPI tiles use the ported PxQ-aware coloring and delta semantics from the prototype, formatted in Dutch locale.
3. At least one chart on the page pulls a live VVD MCP series and renders correctly with proper axis/tooltip formatting.
   **Plans**: TBD
   **UI hint**: yes

### Phase 7: Stubs & Operability Polish

**Goal**: The remaining v1 surfaces ship as styled stubs, and the project is documented and observable enough for a teammate or pilot customer to run and debug it.
**Depends on**: Phase 2 (for stubs); Phase 1 (for ops). Can run in parallel with Phase 6.
**Requirements**: STUB-01, STUB-02, OPS-02, OPS-03, OPS-04
**Success Criteria** (what must be TRUE):

1. `/app/klopt-dit` renders as a styled placeholder using the design system, with prototype copy in place and no real data wiring.
2. `/app/scenario` renders as a styled placeholder with knobs visible but non-functional, using prototype copy.
3. Every API route emits structured logs containing request id, route, status, and latency.
4. The README walks a new contributor through local dev, env setup, Railway deploy, and the migration path to Azure Container Apps + Azure Files; a fresh clone runs end-to-end with `pnpm i && pnpm dev` after copying `.env.example`.
   **Plans**: TBD
   **UI hint**: yes

## Parallelization

The following phases can run concurrently once their dependencies are satisfied:

- **Phase 2 (Design System)** can begin in parallel with the tail of Phase 1 once tokens land on Tailwind 4 (`FOUND-02` is in Phase 2 because it's design-token work).
- **Phase 3 (Marketing)** can run in parallel with **Phase 4 (Chat Backbone)** once Phase 2 is done — they touch disjoint surfaces (public landing vs. app shell).
- **Phase 7 (Stubs & Ops)** can run in parallel with **Phase 6 (Overzicht)** — stubs only need the design system, ops polish only needs Phase 1.

## Progress

| Phase                         | Plans Complete | Status      | Completed |
| ----------------------------- | -------------- | ----------- | --------- |
| 1. Foundation                 | 2/5 | In Progress|  |
| 2. Design System              | 0/0            | Not started | -         |
| 3. Marketing Landing          | 0/0            | Not started | -         |
| 4. Chat Backbone              | 0/0            | Not started | -         |
| 5. Generative Charts & Trust  | 0/0            | Not started | -         |
| 6. Overzicht (Live VVD)       | 0/0            | Not started | -         |
| 7. Stubs & Operability Polish | 0/0            | Not started | -         |

## Coverage Map

| Requirement | Phase   |
| ----------- | ------- |
| FOUND-01    | Phase 1 |
| FOUND-02    | Phase 2 |
| FOUND-03    | Phase 2 |
| FOUND-04    | Phase 1 |
| FOUND-05    | Phase 1 |
| FOUND-06    | Phase 1 |
| FOUND-07    | Phase 1 |
| DS-01       | Phase 2 |
| DS-02       | Phase 2 |
| DS-03       | Phase 2 |
| DS-04       | Phase 2 |
| MKT-01      | Phase 3 |
| MKT-02      | Phase 3 |
| MKT-03      | Phase 3 |
| CHAT-01     | Phase 4 |
| CHAT-02     | Phase 4 |
| CHAT-03     | Phase 4 |
| CHAT-04     | Phase 5 |
| CHAT-05     | Phase 4 |
| CHAT-06     | Phase 5 |
| OVZ-01      | Phase 6 |
| OVZ-02      | Phase 6 |
| OVZ-03      | Phase 6 |
| STUB-01     | Phase 7 |
| STUB-02     | Phase 7 |
| OPS-01      | Phase 1 |
| OPS-02      | Phase 7 |
| OPS-03      | Phase 7 |
| OPS-04      | Phase 7 |

**Validation:** 29/29 v1 requirements mapped, no orphans, no duplicates.

---

_Roadmap created: 2026-04-26_
