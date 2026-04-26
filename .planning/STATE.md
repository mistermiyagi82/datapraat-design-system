# State: DataPraat

**Last updated:** 2026-04-26

## Project Reference

**Core value:** A municipality user opens DataPraat, asks a question about their data in plain Dutch, and gets back a correct, trust-marked chart with conversation continuity.

**Current focus:** Phase 1 — Foundation. Scaffold the Next.js 15 app, get it building and deploying on Railway with sqlite-on-volume and a healthcheck, before any product surface work begins.

**Project mode:** yolo · **Granularity:** standard · **Parallelization:** enabled

## Current Position

- **Milestone:** v1
- **Phase:** Not started — next is Phase 1 (Foundation)
- **Plan:** None — awaiting `/gsd-plan-phase 1`
- **Status:** Roadmap created, ready for planning

```
Progress: [          ] 0% (0/7 phases)
```

| Phase | Status |
|-------|--------|
| 1. Foundation | Not started |
| 2. Design System | Not started |
| 3. Marketing Landing | Not started |
| 4. Chat Backbone | Not started |
| 5. Generative Charts & Trust | Not started |
| 6. Overzicht (Live VVD) | Not started |
| 7. Stubs & Operability Polish | Not started |

## Performance Metrics

- Phases complete: 0/7
- Plans complete: 0/0 (plans are derived per phase)
- Requirements covered: 29/29 (mapped, none yet implemented)
- Time-in-phase: n/a (phase 1 not started)

## Accumulated Context

### Decisions (locked in by PROJECT.md)

- Single Next.js 15 app for marketing + product (shared design system, one deploy).
- Vibathon repo (`/Users/daan/VS Studio/vibathon-knowledgegraph`) is the architectural blueprint, not a fork.
- Stack updated from vibathon's pins: Next.js 15, React 19, Tailwind 4, shadcn 4 (`base-vega`), AI SDK 5, MCP SDK current, Recharts 3.
- Drop vibathon dependencies: Neo4j, Attio, googleapis, pdf-parse, LangChain.
- Hosting v1: Railway with Nixpacks + `/data` volume; architect for Azure Container Apps + Azure Files later. No Vercel-only APIs.
- Persistence: `better-sqlite3` behind a storage interface so Postgres can be swapped in.
- Chat is the v1 spine; KloptDit + Scenario ship as stubs.
- Existing prototype files at repo root are reference material — clean rebuild, not incremental migration.

### Open Todos

- Run `/gsd-plan-phase 1` to decompose Foundation into executable plans.
- Confirm desired pnpm version and `.nvmrc` policy when planning Phase 1.
- Decide MCP server URL convention (env var name, default value) at Phase 4 planning.

### Blockers

None.

### Notes

- VVD MCP and DataPraatFormaat MCP are both available in the working environment for live wiring during Phase 4–6.
- Phases 2/3, 3/4, and 6/7 are eligible for parallel execution per ROADMAP.md "Parallelization" section.

## Session Continuity

**Last action:** Roadmap created, REQUIREMENTS.md traceability updated.

**Next action:** `/gsd-plan-phase 1` to plan the Foundation phase.

**Resumption:** Read `.planning/ROADMAP.md` and this file; the next command is `/gsd-plan-phase 1`.

---
*State initialized: 2026-04-26*
