# Phase 1: Foundation - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

A clean Next.js 15 app boots in dev (`pnpm dev`), produces a successful production build (`pnpm build`), and deploys to Railway with `output: 'standalone'`, a `/data`-mounted sqlite volume, and a working `/api/health` endpoint. The storage seam is real (not stubbed) and Postgres-swappable. No design-system work, no marketing surface, no chat — those are Phase 2+.

Requirements covered: FOUND-01, FOUND-04, FOUND-05, FOUND-06, FOUND-07, OPS-01.

</domain>

<decisions>
## Implementation Decisions

### Scaffold + toolchain

- **D-01:** Bootstrap with `pnpm create next-app@latest` using flags `--typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --no-turbopack`, then trim to DataPraat needs (strict TS, `output: 'standalone'`, swap to pnpm if create-next-app didn't already). Tailwind 4 ships from the scaffold but design tokens land in Phase 2.
- **D-02:** `src/` layout is minimal in Phase 1: only `src/app/` (with `app/api/health/route.ts`), `src/lib/storage/`, `src/lib/env.ts`, and `src/lib/logger.ts`. Other folders (`components/`, `lib/mcp/`, `lib/memory/`, etc.) are created by the phase that introduces them — no empty stubs.
- **D-03:** Pin Node and pnpm in three places: `engines.node = '>=22 <23'`, `packageManager = 'pnpm@<latest-stable>'`, and `.nvmrc = '22'`. Enable Corepack in dev/CI so the pnpm version is reproducible without a global install. Matches Railway and Azure Container Apps base images.
- **D-04:** ESLint 9 flat config (`eslint.config.mjs`) extending `eslint-config-next` + `@typescript-eslint`. Prettier with `prettier-plugin-tailwindcss` and `prettier-plugin-organize-imports`. `src/lib/env.ts` parses `process.env` through a Zod schema and throws on boot if required vars are missing — fail-fast on misconfigured deploys.

### Storage interface + DB lifecycle

- **D-05:** Storage abstraction is **repo-per-domain, async-only**. Phase 1 ships interfaces + a sqlite implementation only for what Phase 1 needs (a `HealthProbeRepo` + a base `getDb()`/migration runner). Other repos (`ConversationRepo`, etc.) land in their introducing phase. Sqlite impl wraps better-sqlite3 sync calls in `Promise.resolve(...)` so the interface is async; Postgres impl is a future drop-in. Sync API is rejected because it would force every callsite to change at Postgres-swap time.
- **D-06:** Schema lives as **hand-rolled SQL files** in `src/lib/storage/sqlite/migrations/{0001_init.sql, ...}`, executed in order on first DB access, tracked in a `schema_migrations(id, applied_at)` table. Idempotent (`CREATE TABLE IF NOT EXISTS`). Phase 1 migration creates `schema_migrations` and a `health_probe(key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)` table — nothing else. Drizzle/Kysely deferred until a phase actually needs typed queries.
- **D-07:** DB initialization is **lazy**: `src/lib/storage/sqlite/client.ts` exports `getDb()` that opens the file on first call, runs pending migrations, then memoizes the handle. **DB path is env-driven**: `DB_PATH` env var, default `/data/datapraat.sqlite` in production, `./.data/datapraat.sqlite` (gitignored) in development so local dev doesn't need a writable `/data`. Eager init via `instrumentation.ts` is rejected — it would block container boot if the Railway volume isn't mounted, defeating healthcheck-driven restarts.
- **D-08:** Storage seam is **proven at runtime, not just by unit test**: `/api/health` writes a probe row (timestamp on key `'last_health_check'`) and reads it back, returning `db.probeMs` round-trip latency. This proves the volume is mounted, the file is writable, and migrations ran. A failure flips the response to 503 and Railway restarts the container.

### Healthcheck + observability baseline

- **D-09:** `/api/health` returns rich JSON: `{ status, commitSha, buildTime, nodeEnv, uptimeSec, db: { ok, probeMs } }`. Status `'ok'` → HTTP 200; any sub-check failure → HTTP 503 with `status: 'degraded'`. Railway `healthcheckPath` consumes the status code; humans get actionable debug info.
- **D-10:** **Single endpoint** `/api/health` covers liveness + DB readiness. No separate `/api/ready` in Phase 1 — Railway only consumes one path and splitting is premature. If Azure later wants K8s-style split probes, it's a 2-line addition.
- **D-11:** **Tiny structured logger** lands in Phase 1: `src/lib/logger.ts` is a thin pino wrapper (or a stdout-JSON shim if pino is heavy) used by `getDb()` migration runs and by `/api/health`. **Per-route request-id middleware (OPS-02) stays in Phase 7** — Phase 1 only has one route and the middleware shape doesn't change with one consumer. Goal: establish the log shape now so Phase 7 doesn't refactor every callsite.
- **D-12:** **Build-info injection at build time**: `next.config.ts` reads `RAILWAY_GIT_COMMIT_SHA` (or local `git rev-parse HEAD` fallback) and `Date.now()`, exposing them via `env.NEXT_PUBLIC_COMMIT_SHA` and `env.BUILD_TIME` so `/api/health` can report which deploy is live. Essential for "is the latest deploy actually up?" debugging.

### Deploy artifact

- **D-13:** Ship **both** `nixpacks.toml` and `Dockerfile` in Phase 1 — ROADMAP success criterion #3 explicitly requires the app to "build and run from the included Dockerfile/Nixpacks config." Railway uses Nixpacks today; Azure Container Apps will consume the Dockerfile. Authoring both now is ~40 lines and means Azure migration is a deploy-config change, not new image work under deadline.
- **D-14:** `railway.toml` lives in the repo: `[deploy] healthcheckPath = '/api/health'`, `healthcheckTimeout = 30`, `restartPolicyType = 'ON_FAILURE'`, `restartPolicyMaxRetries = 3`. `[[volumes]] mountPath = '/data'`. Reproducible across Railway environments; dashboard tweaks remain overridable.
- **D-15:** Dockerfile is **multi-stage with non-root user + `output: 'standalone'`**: `deps` stage (pnpm fetch + install), `builder` stage (pnpm build), `runner` stage (`node:22-alpine`, `USER node`, copies `.next/standalone` + `.next/static` + `public`, `EXPOSE 3000`, `CMD ["node", "server.js"]`). Includes a `HEALTHCHECK` directive hitting `/api/health` so `docker run` and Azure both pick it up.

### Claude's Discretion

- Exact pnpm version pin (latest stable at scaffold time — researcher confirms current `pnpm@10.x` and pins it in `packageManager`).
- Exact Next.js / React patch versions (latest stable at scaffold time).
- Specific Zod schema shape for env vars beyond the obvious (`DATABASE_PATH` default, `LOG_LEVEL` default, `NODE_ENV` parsed) — researcher proposes, planner finalizes.
- Logger choice within the "tiny structured logger" constraint: `pino` vs a 30-line `console.log` JSON shim. Researcher checks pino's bundle/cold-start cost on Node 22.
- Whether `.env.example` lives at repo root only, or also gets a `.env.development` for local-only defaults.
- Exact migration runner implementation (~50-line file in `src/lib/storage/sqlite/migrate.ts`).

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level

- `.planning/PROJECT.md` — Stack pins, hosting decisions (Railway → Azure), persistence strategy, "no Vercel-only APIs" constraint.
- `.planning/REQUIREMENTS.md` §Foundation, §Operability — FOUND-01, FOUND-04 through FOUND-07, OPS-01.
- `.planning/ROADMAP.md` §"Phase 1: Foundation" — Goal + 5 success criteria that are the contract for this phase.
- `.planning/STATE.md` — Open todos: confirm pnpm version + .nvmrc policy at planning time.

### Architectural blueprint (reference, not fork)

- `/Users/daan/VS Studio/vibathon-knowledgegraph/package.json` — Vibathon's pinned versions (Next 14, AI SDK 4, Tailwind 3) — DataPraat refreshes each one but the dependency _shape_ (better-sqlite3, MCP SDK, Recharts, AI SDK, shadcn) is the model.
- `/Users/daan/VS Studio/vibathon-knowledgegraph/railway.toml` — Reference for Railway deploy config; DataPraat's version differs (healthcheckPath = `/api/health` not `/`).
- `/Users/daan/VS Studio/vibathon-knowledgegraph/src/lib/storage/` (`chats.ts`, `files.ts`, `reports.ts`) — Reference for repo-per-domain async storage shape. DataPraat copies the _pattern_, not the files.
- `/Users/daan/VS Studio/vibathon-knowledgegraph/next.config.mjs`, `tsconfig.json`, `nixpacks.toml` — Reference configs to compare against during scaffold trim.

### Codebase context (this repo)

- `.planning/codebase/STACK.md` — Confirms current repo is the no-build prototype; Phase 1 starts a fresh Next.js app alongside the prototype HTML/JSX files (kept as reference per REQUIREMENTS.md "Out of Scope").
- `.planning/codebase/CONVENTIONS.md` — Dutch domain identifiers vs English framework code rule. Phase 1 is mostly framework code (English), but env var names and log keys should stay English too.
- `.planning/codebase/CONCERNS.md` — Pre-existing concerns to be aware of when adding the new app.

### External docs (canonical at planning time)

- Next.js 15 App Router docs (Route Handlers, `output: 'standalone'`, `instrumentation.ts`).
- Railway docs: Nixpacks, volumes, `railway.toml`, healthcheck behavior.
- better-sqlite3 README (sync-only API; the implication for the async wrapper).
- Zod v3+ docs for env-schema parsing.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets (this repo)

- **None for application code.** This repo is a no-build browser prototype (CDN React 18 + Babel-Standalone, JSX glued via `window.*` globals). Per PROJECT.md, the prototype is **reference material only** — Phase 1 starts a fresh Next.js app alongside it. The prototype's `styles.css` tokens get ported in Phase 2, not Phase 1.
- `.gitignore` currently only ignores `.DS_Store` — Phase 1 must extend it (`.next`, `node_modules`, `.env`, `.env.local`, `.data/`, `tsconfig.tsbuildinfo`, etc.).

### Reusable Assets (vibathon blueprint)

- Vibathon's `src/lib/storage/{chats,files,reports}.ts` shape is the model for DataPraat's repo-per-domain interface — same async surface, drop the Neo4j/graphiti/Attio domains.
- Vibathon's `nixpacks.toml` is mostly empty (`[phases.setup] aptPkgs = []`); DataPraat's will be similar.
- Vibathon's `railway.toml` is the template — DataPraat changes `healthcheckPath` from `/` to `/api/health` and keeps the `/data` volume mount.

### Established Patterns

- Vibathon mounts sqlite at `/data` and uses `output: 'standalone'` already — proven on Railway. Phase 1 inherits this pattern verbatim.
- No prior CONTEXT.md files exist (Phase 1 is the first phase) — no carry-forward decisions to honor beyond PROJECT.md.

### Integration Points

- `/api/health` is the seam Railway pulls (`healthcheckPath`) — the only runtime contract Phase 1 owes the outside world.
- The storage interface (`src/lib/storage/index.ts`) is the seam every later phase consumes — Phase 4 (chat persistence), Phase 5 (chart provenance?), Phase 6 (Overzicht state) all import from it.
- `src/lib/env.ts` is the seam every later phase consumes for config — Phase 4 will add `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MCP_SERVER_URL` to the same Zod schema.
- `next.config.ts` build-time env injection is the seam for `commitSha`/`buildTime` — Phase 7 ops polish reuses it.

</code_context>

<specifics>
## Specific Ideas

- DB path env: prod default `/data/datapraat.sqlite`, dev default `./.data/datapraat.sqlite` (note the leading dot — gitignored).
- Health response shape (verbatim contract for downstream agents):
  ```json
  {
    "status": "ok",
    "commitSha": "abc1234",
    "buildTime": "2026-04-26T10:00:00Z",
    "nodeEnv": "production",
    "uptimeSec": 142,
    "db": { "ok": true, "probeMs": 3 }
  }
  ```
- Dockerfile uses `node:22-alpine` runner, `USER node`, copies `.next/standalone` + `.next/static` + `public`, `EXPOSE 3000`, `CMD ["node", "server.js"]`, plus a `HEALTHCHECK` directive hitting `/api/health`.
- Migration filename convention: `NNNN_short_name.sql` (4-digit, zero-padded).
- Phase 1 migration `0001_init.sql` creates only `schema_migrations` + `health_probe`. No other tables.

</specifics>

<deferred>
## Deferred Ideas

- **Graceful SIGTERM shutdown** that closes the sqlite handle — nice hygiene, not needed for a single-instance Railway deploy. Revisit if/when we run multi-instance or Azure Container Apps with surge replicas.
- **Default Next.js error boundaries** at `app/error.tsx` + `app/global-error.tsx` — cheap and high-value, but the user picked it out of the Phase 1 ops extras. Note for Phase 2 (Design System) since they want the design-system-aware version, or for Phase 7 (Ops Polish).
- **Per-route request-id + structured logging middleware** — explicitly OPS-02, lives in Phase 7.
- **Drizzle/Kysely typed queries** — not warranted in Phase 1; Phase 4 (chat persistence) is the natural moment to introduce one if the migration runner starts to feel painful.
- **Split `/api/health` (liveness) + `/api/ready` (readiness)** — only if Azure Container Apps explicitly needs it.
- **CI pipeline (GitHub Actions for lint + build + Docker build)** — not a Phase 1 success criterion. Worth a Phase 7 add-on.
- **`.env.development` for local-only defaults** — Claude's Discretion in Phase 1; can land if it's cleaner than a `.env.example` comment block.

</deferred>

---

_Phase: 01-foundation_
_Context gathered: 2026-04-26_
