# DataPraat

## What This Is

DataPraat is a conversational data product that lets municipal staff "talk to their data" — ask questions in plain Dutch and get back live charts, validations, and what-if scenarios. It is sold to **data consultancies and data companies** who deliver it to their **municipal customers**. The Zeeuwse Jeugdzorg (VVD) dataset is the first demo / reference deployment, not the product identity — the app is dataset-agnostic and configured per customer via MCP servers.

This repo is the **fresh DataPraat product app**: a single Next.js 15 application that hosts both the marketing site and the application surface, sharing one design system. It uses the proven `vibathon-knowledgegraph` repo as an architectural blueprint but rebuilds clean on current versions of every major library.

## Core Value

**A municipality user opens DataPraat, asks a question about their data in plain Dutch, and gets back a correct, trust-marked chart with conversation continuity.** If chat-with-generative-charts doesn't work end-to-end, nothing else matters.

## Requirements

### Validated

#### Foundation (validated in Phase 1)

- [x] **FOUND-01**: Next.js 15 + React 19 + TypeScript 5 app boots in dev and production builds
- [x] **FOUND-04**: ESLint + Prettier + TypeScript strict mode configured
- [x] **FOUND-05**: `output: 'standalone'` Next.js build + Dockerfile + Nixpacks config so the app runs on Railway today and Azure Container Apps later
- [x] **FOUND-06**: Persistence via `better-sqlite3` mounted at `/data` (Railway volume), abstracted behind a storage interface so it can swap to managed Postgres on Azure later
- [x] **FOUND-07**: Env-driven config (no hardcoded secrets, no Vercel-only APIs); `.env.example` documents required vars

#### Foundation + Design System (validated in Phase 2)

- [x] **FOUND-02**: Tailwind 4 configured with DataPraat design tokens ported from `styles.css` (4-layer cascade: prototype `:root` + shadcn alias + `@theme inline` + scoped classes)
- [x] **FOUND-03**: shadcn 4 (`base-vega` style) + Base UI + Tabler Icons wired and installable via the shadcn CLI
- [x] **DS-01**: Design tokens from current `styles.css` ported into Tailwind 4 `@theme` directives
- [x] **DS-02**: Core shadcn primitives installed: button, card, input, dialog, dropdown-menu, tabs, tooltip, separator + sonner (replaces toast per shadcn deprecation)
- [x] **DS-03**: DataPraat-specific primitives ported: `Icon`, `TrustBadge`, `AskButton`, NL-format helpers (`fmtEUR`, `fmtNum`, `fmtPercent`, `fmtCompact` — Dutch locale)
- [x] **DS-04**: `/internal/design` living-reference page documents tokens, typography, color usage, custom + shadcn primitives, trust tiers, format helpers

### Active

#### Marketing

- [ ] **MKT-01**: `/` (landing) route ports `website v2.html` content into Next.js components, using the design system
- [ ] **MKT-02**: Landing is responsive, accessible, and SSR-rendered (good Lighthouse + SEO baseline)
- [ ] **MKT-03**: Clear CTA from landing into `/app` (or wherever the application enters)

#### Chat (the spine)

- [ ] **CHAT-01**: AI SDK 5 chat route wired to Anthropic + OpenAI providers (model selectable via env)
- [ ] **CHAT-02**: MCP client (`@modelcontextprotocol/sdk`) connects to the configured MCP server (default: VVD MCP) and exposes its tools to the model
- [ ] **CHAT-03**: Streaming chat UI (Cmd+K launcher + full-screen mode) renders text, react-markdown + remark-gfm, and tool-call results
- [ ] **CHAT-04**: Generative charts: when a tool returns chartable data, render Recharts inline (line / bar / stacked / KPI tile variants matching the existing prototype's chart taxonomy)
- [ ] **CHAT-05**: Conversation history persisted to sqlite with `dp_*` keys; user can resume / list / delete past conversations
- [ ] **CHAT-06**: Trust marks on chart output (provenance: which MCP tool, which dataset, which time range)

#### Overzicht (required v1)

- [ ] **OVZ-01**: `/app/overzicht` route renders the default `cijfers` mode using real VVD data via MCP (no mock data)
- [ ] **OVZ-02**: KPI tile pattern (PxQ-aware coloring, delta semantics) ported from prototype
- [ ] **OVZ-03**: At least one chart pulls live from VVD MCP and renders correctly

#### KloptDit + Scenario (visual stubs)

- [ ] **STUB-01**: `/app/klopt-dit` ships as a styled placeholder using the design system, copy from prototype, no real data wiring
- [ ] **STUB-02**: `/app/scenario` ships as a styled placeholder, knobs visible but non-functional, copy from prototype

#### Operability

- [x] **OPS-01**: Health check endpoint at `/api/health` (used by Railway healthcheckPath) — validated in Phase 1
- [ ] **OPS-02**: Structured logging (request id, route, latency) in API routes
- [ ] **OPS-03**: README documents local dev, env setup, deploy to Railway, and the path to Azure
- [ ] **OPS-04**: One-command setup (`pnpm i && pnpm dev`) works on a fresh clone

### Out of Scope

- **Real authentication / multi-user accounts** — v1 demo is shared-link; auth comes when the first paying customer needs per-user scoping
- **Multi-tenant per-customer configuration UI** — for v1, customer = env vars; tenant admin UI is a later milestone
- **Full KloptDit wiring (validation + lineage views)** — too much surface for v1; ship as stubs, build properly when chart-trust patterns are settled
- **Full Scenario wiring (knob-based forecasting)** — same reasoning; needs a real forecasting backend contract first
- **Neo4j / graphiti** (vibathon dependency) — DataPraat doesn't need a knowledge graph; MCP tools are the data interface
- **Attio integration** — vibathon-specific CRM
- **Google APIs (`googleapis`) and `pdf-parse`** — vibathon-specific ingestion paths, not DataPraat's product surface
- **LangChain** — AI SDK 5 + MCP cover what we need; LangChain adds weight without unique value here
- **The duplicate prototype HTMLs** (`website.html`, `DataPraat.html`, `Logos.html`, the two one-pagers, `woorden-modus-verkenning.html`) — replaced by the Next.js app; old files stay in repo only as reference, not migrated
- **Vercel deploy** — Railway → Azure is the chosen path; Vercel introduces a different runtime model (sqlite + persistent volumes don't fit) and would mean reworking persistence twice

## Context

**Where this comes from**

- The current repo holds a no-build browser-rendered React prototype (CDN React 18 + Babel-Standalone, JSX files glued via `window.*` globals) plus brand assets and screenshots. See `.planning/codebase/` for the full map. The prototype is **reference material only** — the new app is a clean rebuild.
- The sibling repo `vibathon-knowledgegraph` (at `/Users/daan/VS Studio/vibathon-knowledgegraph`) is a working Next.js 14 chat-with-data app that already proves the architectural pattern: AI SDK + MCP + Recharts + sqlite-on-volume + Railway deploy. We mirror its `src/` layout (`app/{api,chat,landing}`, `components/{charts,chat,landing,ui}`, `lib/{memory,storage,...}`) but on current versions and stripped to DataPraat's product scope.
- Design intent and component vocabulary are documented in `HANDOFF.md` and `COMPONENTS.md` at the repo root. Treat them as the design contract; deviate where current best practices say to.

**Domain**

- Dutch municipalities (gemeenten) want to query and trust their own data. Every customer brings their own datasets exposed via an MCP server. VVD MCP (Zeeuwse Jeugdzorg forecasting + CBS data) is the first such server and the demo backbone.
- Dutch is the default UI language. Domain vocabulary like `gemeente`, `trajecten`, `verwijzers`, `klopt-dit`, `prognose`, `realisatie` is canonical and must not be Anglicized.

**Audience for v1**

- Demo audience first (DataPraat team, prospects, customer pilots). Real per-tenant municipal users come after the demo path is solid. Architect for that future without paying its complexity now.

## Constraints

- **Tech stack**: Next.js 15, React 19, TypeScript 5 (strict), Tailwind 4, shadcn 4 (`base-vega`), Base UI, AI SDK 5, MCP SDK, Recharts 3, Tabler Icons, Zod, better-sqlite3 — Updated from vibathon's pinned versions because the user explicitly asked to refresh React/shadcn/Recharts/etc. Use current stable releases at project start.
- **Runtime**: Node 22 — Matches vibathon and Railway/Azure base images.
- **Hosting (v1)**: Railway with Nixpacks + `/data` volume — Mirrors vibathon. Proven path. Migrates to Azure Container Apps + Azure Files cleanly.
- **Hosting (later)**: Azure (Container Apps or App Service) — Customer environments are Azure. Avoid Vercel-specific APIs (Edge runtime, KV, Blob) so the lift is mechanical, not a rewrite.
- **Persistence**: sqlite (better-sqlite3) on volume — Cheap, simple, fits both Railway and Azure Files. Behind a storage abstraction so swap to Postgres is a one-day migration.
- **Language**: Dutch in UI copy and domain identifiers; English in framework/utility code (matches prototype convention documented in `.planning/codebase/CONVENTIONS.md`).
- **Auth (v1)**: None / shared-link — Demo audience. Architect for NextAuth or similar later.
- **Build philosophy**: Clean rebuild, prototype is reference-only — Don't try to port `window.*` globals or Babel-Standalone patterns. Use ES modules, RSC, and proper TS imports.

## Key Decisions

| Decision                                                               | Rationale                                                                                                              | Outcome   |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------- |
| Single Next.js app for marketing + product                             | Shared design system, one deploy, simpler ops                                                                          | — Pending |
| Frontend-only repo; backend stays separate                             | User framed this repo as the FE; data flows through MCP for analytical queries and (future) backend REST for app state | — Pending |
| Vibathon as architectural blueprint, not a fork                        | Keeps DataPraat clean and on current versions; avoids inheriting Attio/graphiti/Neo4j scope                            | — Pending |
| Update React/Next/Tailwind/AI SDK to current stable                    | User explicitly asked to refresh; vibathon's pins (Next 14, Tailwind 3, AI SDK 4) are already a release behind         | — Pending |
| Railway with `/data` volume now, Azure later                           | Mirrors proven vibathon deploy; sqlite-on-volume is portable to Azure Files; avoids Vercel rework                      | — Pending |
| sqlite via storage abstraction                                         | Simplest persistence that fits both targets; abstracted so Postgres swap is mechanical                                 | — Pending |
| Chat is the v1 spine; KloptDit + Scenario are stubs                    | User declared chat must work end-to-end; other surfaces support but don't gate v1                                      | — Pending |
| Dataset-agnostic, MCP-configurable per customer                        | DataPraat is sold to consultancies for many municipal clients; VVD is one of many MCP backends                         | — Pending |
| Drop vibathon modules (Neo4j, Attio, googleapis, pdf-parse, LangChain) | Out of DataPraat product scope; AI SDK + MCP cover the data path                                                       | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-28 after Phase 2 (Design System) completion — Tailwind 4 tokens + shadcn base-vega + custom primitives + `/internal/design` reference live._
