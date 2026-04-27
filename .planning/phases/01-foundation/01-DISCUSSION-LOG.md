# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-26
**Phase:** 01-foundation
**Areas discussed:** Scaffold + toolchain pinning, Storage interface + DB lifecycle, Healthcheck + observability baseline, Deploy artifact

---

## Gray-area selection

| Option                                        | Description                                                         | Selected |
| --------------------------------------------- | ------------------------------------------------------------------- | -------- |
| Scaffold + toolchain pinning                  | Bootstrap method, src/ layout, Node/pnpm pins, lint/format, Zod env | ✓        |
| Storage interface + DB lifecycle              | Sync vs async, repo-per-domain vs generic, schema lifecycle         | ✓        |
| Healthcheck + observability baseline          | Liveness vs readiness, build info, logging baseline                 | ✓        |
| Deploy artifact: Nixpacks-only or +Dockerfile | Whether to author both deploy artifacts in Phase 1                  | ✓        |

**User's choice:** All four selected.
**Notes:** User added "just make sure its good man, go" — interpreted as a strong mandate to recommend assertively and proceed.

---

## Scaffold + toolchain pinning

### Q1 — How should we bootstrap the Next.js 15 app?

| Option                            | Description                                                                                                                                | Selected |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| create-next-app, then trim        | Use official scaffold with `--typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --no-turbopack`, then trim. Recommended. | ✓        |
| Hand-rolled package.json          | Write configs from scratch. More control, more drift risk.                                                                                 |          |
| Mirror vibathon, upgrade in place | Copy vibathon's configs and bump versions. Inherits decisions, fights upgrade pain.                                                        |          |

**User's choice:** create-next-app, then trim
**Notes:** Aligns with PROJECT.md "use current stable releases at project start."

### Q2 — How much of vibathon's src/ tree do we create in Phase 1?

| Option                            | Description                                                                                      | Selected |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Minimal — only what Phase 1 needs | `src/app`, `src/lib/storage`, `src/lib/env`, `src/lib/logger`. Rest grow per phase. Recommended. | ✓        |
| Full vibathon mirror upfront      | Pre-create every folder with .gitkeeps. Documents layout, invites premature structure.           |          |

**User's choice:** Minimal — only what Phase 1 needs
**Notes:** —

### Q3 — How should we pin Node and pnpm?

| Option                                                  | Description                                       | Selected |
| ------------------------------------------------------- | ------------------------------------------------- | -------- |
| All three: .nvmrc + engines + packageManager + Corepack | Maximum reproducibility. Recommended.             | ✓        |
| .nvmrc + engines only                                   | Skip packageManager + Corepack. Less opinionated. |          |
| engines only                                            | Minimum viable.                                   |          |

**User's choice:** All three
**Notes:** —

### Q4 — ESLint/Prettier choice + Zod env validation?

| Option                                                    | Description                                                                        | Selected |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- |
| ESLint 9 flat + Prettier + Zod env at boot                | Modern flat config, tailwind/organize-imports plugins, fail-fast env. Recommended. | ✓        |
| ESLint 9 flat + Prettier, skip Zod env                    | Lint same; trust process.env.                                                      |          |
| ESLint 8 + eslint-config-next legacy + Prettier + Zod env | Stay on .eslintrc.json. Will need migration eventually.                            |          |

**User's choice:** ESLint 9 flat + Prettier + Zod env at boot
**Notes:** —

---

## Storage interface + DB lifecycle

### Q1 — What shape should the storage abstraction take?

| Option                                     | Description                                                                          | Selected |
| ------------------------------------------ | ------------------------------------------------------------------------------------ | -------- |
| Repo-per-domain, async-only                | Domain interfaces; sqlite wraps better-sqlite3 sync in Promise.resolve. Recommended. | ✓        |
| Single Storage interface with verb methods | Generic get/set/list/delete + namespaces. Loses entity type safety.                  |          |
| Sync API matching better-sqlite3           | Faster today; every callsite changes when Postgres lands.                            |          |

**User's choice:** Repo-per-domain, async-only
**Notes:** —

### Q2 — Where does the DB schema live and how does it run?

| Option                                     | Description                                                        | Selected |
| ------------------------------------------ | ------------------------------------------------------------------ | -------- |
| Hand-rolled SQL files + lightweight runner | NNNN\_\*.sql files, schema_migrations tracking table. Recommended. | ✓        |
| Drizzle ORM + drizzle-kit                  | Schema-as-TS, codegen, type-safe. Heavier in Phase 1.              |          |
| Kysely query builder + raw SQL migrations  | Type-safe SQL builder, no codegen. Middle ground.                  |          |

**User's choice:** Hand-rolled SQL files + lightweight runner
**Notes:** —

### Q3 — When does sqlite initialize, and where does the DB file live?

| Option                                                         | Description                                                     | Selected |
| -------------------------------------------------------------- | --------------------------------------------------------------- | -------- |
| Lazy singleton at /data/datapraat.sqlite, init on first access | DB_PATH env (prod `/data/...`, dev `./.data/...`). Recommended. | ✓        |
| Eager init in instrumentation.ts                               | Fails fast, but blocks boot if /data not mounted.               |          |

**User's choice:** Lazy singleton at /data/datapraat.sqlite, init on first access
**Notes:** —

### Q4 — How do we prove the storage seam is real in Phase 1?

| Option                                     | Description                                                            | Selected |
| ------------------------------------------ | ---------------------------------------------------------------------- | -------- |
| Healthcheck reads + writes a probe row     | /api/health round-trips a row, returns latency. Recommended.           | ✓        |
| Separate /api/storage-test endpoint        | Keeps /api/health pure. Railway healthcheck won't catch broken volume. |          |
| No runtime proof — only a Vitest unit test | Mocked filesystem won't catch missing volume.                          |          |

**User's choice:** Healthcheck reads + writes a probe row
**Notes:** —

---

## Healthcheck + observability baseline

### Q1 — What does /api/health return?

| Option                                             | Description                                               | Selected |
| -------------------------------------------------- | --------------------------------------------------------- | -------- |
| Rich JSON: status + build + db round-trip + uptime | Full debug payload on top of 200/503 status. Recommended. | ✓        |
| Minimal: 200 with {status:'ok'}                    | Just enough for Railway.                                  |          |

**User's choice:** Rich JSON
**Notes:** —

### Q2 — Liveness only, or split liveness/readiness?

| Option                          | Description                                           | Selected |
| ------------------------------- | ----------------------------------------------------- | -------- |
| Single /api/health doing both   | One endpoint, DB included. Recommended.               | ✓        |
| Split: /api/health + /api/ready | K8s-style. Premature; Railway only consumes one path. |          |

**User's choice:** Single /api/health doing both
**Notes:** —

### Q3 — When does structured logging land?

| Option                                             | Description                                                                      | Selected |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| Tiny logger in Phase 1, full middleware in Phase 7 | pino wrapper or stdout-JSON shim now; OPS-02 middleware in Phase 7. Recommended. | ✓        |
| Full structured logging now                        | Pulls Phase 7 work forward; one route to log against.                            |          |
| No logger yet — console.log                        | Phase 7 has to retrofit every callsite.                                          |          |

**User's choice:** Tiny logger in Phase 1, full middleware in Phase 7
**Notes:** —

### Q4 — Anything else to wire in Phase 1's ops baseline? (multi-select)

| Option                                                  | Description                                                            | Selected |
| ------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| Build info via NEXT_PUBLIC_COMMIT_SHA injected at build | Capture RAILWAY_GIT_COMMIT_SHA + buildTime at build time. Recommended. | ✓        |
| Graceful shutdown hook                                  | SIGTERM closes sqlite. Nice-to-have; better-sqlite3 fine without.      |          |
| Error boundary at app/error.tsx + global-error.tsx      | Default Next.js error pages with logger. Recommended.                  |          |

**User's choice:** Build info only
**Notes:** Graceful shutdown and error boundaries deferred to later phases (captured in Deferred Ideas).

---

## Deploy artifact

### Q1 — Nixpacks-only or Nixpacks + Dockerfile in Phase 1?

| Option                                         | Description                                                           | Selected |
| ---------------------------------------------- | --------------------------------------------------------------------- | -------- |
| Both: nixpacks.toml + Dockerfile               | Phase 1 success criterion #3 requires both. Azure-ready. Recommended. | ✓        |
| Nixpacks only, Dockerfile in a later ops phase | Lighter Phase 1, but contradicts ROADMAP.                             |          |

**User's choice:** Both
**Notes:** —

### Q2 — Railway healthcheckPath + volume — set in railway.toml or via dashboard?

| Option               | Description                                                                          | Selected |
| -------------------- | ------------------------------------------------------------------------------------ | -------- |
| railway.toml in repo | healthcheckPath=/api/health, [[volumes]] mountPath=/data. Reproducible. Recommended. | ✓        |
| Dashboard-only       | Click-ops; not reproducible.                                                         |          |

**User's choice:** railway.toml in repo
**Notes:** —

### Q3 — How should the Dockerfile be structured for the eventual Azure lift?

| Option                                             | Description                                                                    | Selected |
| -------------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| Multi-stage with non-root user + output:standalone | deps → builder → runner (node:22-alpine, USER node, HEALTHCHECK). Recommended. | ✓        |
| Single-stage, run from source                      | Larger image, slower starts, leaks dev deps.                                   |          |

**User's choice:** Multi-stage with non-root user + output:standalone
**Notes:** —

---

## Claude's Discretion

- Exact pnpm version pin (latest stable at scaffold time).
- Exact Next.js / React patch versions.
- Specific Zod env schema shape beyond the obvious vars.
- Logger choice within "tiny structured logger": pino vs 30-line console.log JSON shim.
- `.env.example` only vs `.env.example` + `.env.development`.
- Migration runner implementation details.

## Deferred Ideas

- Graceful SIGTERM shutdown closing sqlite handle.
- Default Next.js error boundaries at `app/error.tsx` + `app/global-error.tsx`.
- Per-route request-id + structured logging middleware (OPS-02 → Phase 7).
- Drizzle/Kysely typed queries (revisit at Phase 4 chat persistence if needed).
- Split `/api/health` + `/api/ready` (only if Azure Container Apps demands it).
- CI pipeline (GitHub Actions for lint + build + Docker build) — Phase 7 candidate.
- `.env.development` for local-only defaults.
