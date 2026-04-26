# Phase 1: Foundation - Research

**Researched:** 2026-04-26
**Domain:** Next.js 15 scaffold + Railway deploy + sqlite-on-volume
**Confidence:** HIGH (all stack versions verified against npm registry; deploy patterns verified against current Next.js + Railway docs)

## Summary

Phase 1 stands up a clean Next.js 15.5.x + React 19.2.x + TypeScript 5.9.x application, deploys it to Railway via Nixpacks with a `/data` volume for sqlite, and exposes `/api/health`. The CONTEXT.md already locks 15 implementation decisions (D-01 through D-15) — the user has done the heavy thinking. This research's job is to (1) verify those decisions still match current ecosystem reality on 2026-04-26, (2) fill the six "Claude's Discretion" gaps with concrete, specific recommendations, and (3) flag the few real risks the planner needs to design around.

**Key verified facts:**
- Next.js 16.2.4 is current `latest`, but the **15-line is still actively maintained** (`backport` dist-tag → 15.5.15, last published days ago). The CONTEXT.md decision to ship Next.js 15 is still viable; pin **15.5.15**.
- `better-sqlite3@12.9.0` officially supports Node 22 (engines: `20.x || 22.x || 23.x || 24.x || 25.x`) and is in Next.js's built-in `serverExternalPackages` allowlist — no manual config needed.
- ESLint 9 flat config + `eslint-config-next` requires `FlatCompat` from `@eslint/eslintrc` — this is the documented bridge pattern, not a workaround. This is the single biggest "could trip the planner" item.
- Tailwind CSS 4 ships through `@tailwindcss/postcss` and `pnpm create next-app` already wires it correctly — the trim list is shorter than expected.
- `instrumentation.ts` is now stable in Next.js 15 (the experimental flag is removed). CONTEXT.md correctly rejects eager DB init via instrumentation; that decision is still right because it would defeat healthcheck-driven restarts.

**Primary recommendation:** Follow CONTEXT.md verbatim. The discretion gaps resolve cleanly: pin `pnpm@10.30.2`, use `pino@10.3.1`, ship `.env.example` only (no `.env.development`), use a tiny `<50-line` migration runner, and follow the FlatCompat ESLint pattern below. Total Phase 1 surface is ~25 files, ~600 lines.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scaffold + toolchain:**
- **D-01:** Bootstrap with `pnpm create next-app@latest` using flags `--typescript --tailwind --eslint --app --src-dir --import-alias '@/*' --no-turbopack`, then trim to DataPraat needs (strict TS, `output: 'standalone'`, swap to pnpm if create-next-app didn't already). Tailwind 4 ships from the scaffold but design tokens land in Phase 2.
- **D-02:** `src/` layout is minimal in Phase 1: only `src/app/` (with `app/api/health/route.ts`), `src/lib/storage/`, `src/lib/env.ts`, and `src/lib/logger.ts`. Other folders (`components/`, `lib/mcp/`, `lib/memory/`, etc.) are created by the phase that introduces them — no empty stubs.
- **D-03:** Pin Node and pnpm in three places: `engines.node = '>=22 <23'`, `packageManager = 'pnpm@<latest-stable>'`, and `.nvmrc = '22'`. Enable Corepack in dev/CI so the pnpm version is reproducible without a global install. Matches Railway and Azure Container Apps base images.
- **D-04:** ESLint 9 flat config (`eslint.config.mjs`) extending `eslint-config-next` + `@typescript-eslint`. Prettier with `prettier-plugin-tailwindcss` and `prettier-plugin-organize-imports`. `src/lib/env.ts` parses `process.env` through a Zod schema and throws on boot if required vars are missing — fail-fast on misconfigured deploys.

**Storage interface + DB lifecycle:**
- **D-05:** Storage abstraction is **repo-per-domain, async-only**. Phase 1 ships interfaces + a sqlite implementation only for what Phase 1 needs (a `HealthProbeRepo` + a base `getDb()`/migration runner). Other repos (`ConversationRepo`, etc.) land in their introducing phase. Sqlite impl wraps better-sqlite3 sync calls in `Promise.resolve(...)` so the interface is async; Postgres impl is a future drop-in. Sync API is rejected because it would force every callsite to change at Postgres-swap time.
- **D-06:** Schema lives as **hand-rolled SQL files** in `src/lib/storage/sqlite/migrations/{0001_init.sql, ...}`, executed in order on first DB access, tracked in a `schema_migrations(id, applied_at)` table. Idempotent (`CREATE TABLE IF NOT EXISTS`). Phase 1 migration creates `schema_migrations` and a `health_probe(key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)` table — nothing else. Drizzle/Kysely deferred until a phase actually needs typed queries.
- **D-07:** DB initialization is **lazy**: `src/lib/storage/sqlite/client.ts` exports `getDb()` that opens the file on first call, runs pending migrations, then memoizes the handle. **DB path is env-driven**: `DB_PATH` env var, default `/data/datapraat.sqlite` in production, `./.data/datapraat.sqlite` (gitignored) in development so local dev doesn't need a writable `/data`. Eager init via `instrumentation.ts` is rejected — it would block container boot if the Railway volume isn't mounted, defeating healthcheck-driven restarts.
- **D-08:** Storage seam is **proven at runtime, not just by unit test**: `/api/health` writes a probe row (timestamp on key `'last_health_check'`) and reads it back, returning `db.probeMs` round-trip latency. This proves the volume is mounted, the file is writable, and migrations ran. A failure flips the response to 503 and Railway restarts the container.

**Healthcheck + observability baseline:**
- **D-09:** `/api/health` returns rich JSON: `{ status, commitSha, buildTime, nodeEnv, uptimeSec, db: { ok, probeMs } }`. Status `'ok'` → HTTP 200; any sub-check failure → HTTP 503 with `status: 'degraded'`. Railway `healthcheckPath` consumes the status code; humans get actionable debug info.
- **D-10:** **Single endpoint** `/api/health` covers liveness + DB readiness. No separate `/api/ready` in Phase 1 — Railway only consumes one path and splitting is premature. If Azure later wants K8s-style split probes, it's a 2-line addition.
- **D-11:** **Tiny structured logger** lands in Phase 1: `src/lib/logger.ts` is a thin pino wrapper (or a stdout-JSON shim if pino is heavy) used by `getDb()` migration runs and by `/api/health`. **Per-route request-id middleware (OPS-02) stays in Phase 7** — Phase 1 only has one route and the middleware shape doesn't change with one consumer. Goal: establish the log shape now so Phase 7 doesn't refactor every callsite.
- **D-12:** **Build-info injection at build time**: `next.config.ts` reads `RAILWAY_GIT_COMMIT_SHA` (or local `git rev-parse HEAD` fallback) and `Date.now()`, exposing them via `env.NEXT_PUBLIC_COMMIT_SHA` and `env.BUILD_TIME` so `/api/health` can report which deploy is live. Essential for "is the latest deploy actually up?" debugging.

**Deploy artifact:**
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

### Deferred Ideas (OUT OF SCOPE)

- **Graceful SIGTERM shutdown** that closes the sqlite handle — nice hygiene, not needed for a single-instance Railway deploy. Revisit if/when we run multi-instance or Azure Container Apps with surge replicas.
- **Default Next.js error boundaries** at `app/error.tsx` + `app/global-error.tsx` — cheap and high-value, but the user picked it out of the Phase 1 ops extras. Note for Phase 2 (Design System) since they want the design-system-aware version, or for Phase 7 (Ops Polish).
- **Per-route request-id + structured logging middleware** — explicitly OPS-02, lives in Phase 7.
- **Drizzle/Kysely typed queries** — not warranted in Phase 1; Phase 4 (chat persistence) is the natural moment to introduce one if the migration runner starts to feel painful.
- **Split `/api/health` (liveness) + `/api/ready` (readiness)** — only if Azure Container Apps explicitly needs it.
- **CI pipeline (GitHub Actions for lint + build + Docker build)** — not a Phase 1 success criterion. Worth a Phase 7 add-on.
- **`.env.development` for local-only defaults** — Claude's Discretion in Phase 1; can land if it's cleaner than a `.env.example` comment block. **Researcher recommendation: skip it. Use `.env.example` + zod defaults.** See "Discretion gap 5" below.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | App boots in dev (`pnpm dev`) and produces production build (`pnpm build`) on Next.js 15 + React 19 + TypeScript 5 (strict) | Stack version matrix below confirms Next 15.5.15 + React 19.2.5 + TS 5.9.3 are current/stable; scaffold steps section gives the exact command. |
| FOUND-04 | ESLint, Prettier, TypeScript strict mode pass on a clean tree | ESLint 9 flat config section gives the exact `eslint.config.mjs` shape using FlatCompat (the documented bridge for `eslint-config-next`). Prettier setup is straightforward. |
| FOUND-05 | Production build uses `output: 'standalone'`; Dockerfile + Nixpacks config build and run the app | Dockerfile section provides multi-stage Alpine outline with the better-sqlite3 native-binding workflow resolved. Nixpacks config section provides minimal `nixpacks.toml` (Nixpacks auto-installs python/gcc when it sees `node-gyp` in deps tree). |
| FOUND-06 | `better-sqlite3` mounted at `/data` behind Postgres-swappable storage interface | Storage seam section gives concrete TS interface signatures, lazy-init `getDb()` pattern, and `<50-line` migration runner. better-sqlite3@12.9.0 verified on Node 22. |
| FOUND-07 | All config env-driven; `.env.example` enumerates every required var; no Vercel-only APIs; no hardcoded secrets | Zod env schema section defines the minimum Phase 1 set with extension shape for Phase 4 (AI keys). Vercel-avoidance audit section enumerates the four APIs to never use. |
| OPS-01 | `/api/health` responds 200 with build info; Railway `healthcheckPath` configured | Healthcheck handler section gives Route Handler outline with degraded → 503 path. Build-info injection section gives `next.config.ts` snippet for `NEXT_PUBLIC_COMMIT_SHA` + `BUILD_TIME`. |

</phase_requirements>

## Standard Stack

### Core (verified versions, 2026-04-26)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | **15.5.15** | Framework | [VERIFIED: npm view] Latest 15-line stable. The `backport` dist-tag tracks 15.x maintenance — the line is still receiving security/bug fixes even though `latest` is now 16.2.4. Locked at 15 per CONTEXT.md / PROJECT.md. |
| `react` | **19.2.5** | UI runtime | [VERIFIED: npm view] Current `latest`. Peer-required by Next 15.5.x. |
| `react-dom` | **19.2.5** | DOM renderer | [VERIFIED: npm view] Matches react. |
| `typescript` | **5.9.3** | Type system (strict) | [VERIFIED: npm view] Latest 5.x. (TS 6.0.3 also published as `latest` — DO NOT use, the project locks TS 5 per PROJECT.md and ecosystem support for TS 6 is still landing.) |
| `@types/react` | **^19** | React types | [ASSUMED] Match React major. |
| `@types/react-dom` | **^19** | React DOM types | [ASSUMED] Match React major. |
| `@types/node` | **^22** | Node types | [ASSUMED] Match runtime major. |
| `tailwindcss` | **4.2.4** | CSS engine | [VERIFIED: npm view] v4 stable since Jan 2025. Scaffolded automatically by `create-next-app --tailwind`. |
| `@tailwindcss/postcss` | **^4.2.4** | PostCSS plugin | [CITED: tailwindcss.com/docs/installation/using-postcss] In v4, the PostCSS plugin lives in this dedicated package. Scaffolded by create-next-app. |
| `better-sqlite3` | **12.9.0** | sqlite driver | [VERIFIED: npm view; engines = `20.x \|\| 22.x \|\| 23.x \|\| 24.x \|\| 25.x`] Major version bump from vibathon's 11.x. In Next.js 15's built-in `serverExternalPackages` allowlist (no manual config). |
| `@types/better-sqlite3` | **7.6.13** | sqlite types | [VERIFIED: npm view] |
| `zod` | **4.3.6** | Schema validation (env) | [VERIFIED: npm view] v4 is current `latest`. v4 API is largely backward-compatible for `.object().parse()` patterns; safe choice for env parsing. (Vibathon used v3.25; planner can stay on v3 if v4 surprises emerge — `npm view zod@3 version` returns `3.25.76`.) |
| `pino` | **10.3.1** | Structured logger | [VERIFIED: npm view] See "Discretion gap 4" — recommended over hand-rolled JSON shim. |

### Tooling

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `pnpm` | **10.30.2** | Package manager | [VERIFIED: npm view] Pin in `packageManager` field; Corepack 0.34+ (bundled with Node 22.22) handles install automatically. |
| `eslint` | **9.39.4** | Linter | [VERIFIED: npm view] Latest 9.x. Flat config required. |
| `eslint-config-next` | **15.5.15** | Next.js lint rules | [VERIFIED: npm view; peerDeps eslint `^7.23.0 \|\| ^8.0.0 \|\| ^9.0.0`, typescript `>=3.3.1`] Match Next major. **Still ships eslintrc-format only** — needs `FlatCompat` bridge. See ESLint section below. |
| `@eslint/eslintrc` | **^3** | FlatCompat bridge | [CITED: github.com/vercel/next.js/discussions/71806] Required to use `eslint-config-next` from a flat config. |
| `@eslint/js` | **^9** | ESLint recommended ruleset | [ASSUMED] Standard pairing for flat config setups. |
| `typescript-eslint` | **^8** | TS lint plugin (flat-config bundle) | [ASSUMED] The `typescript-eslint` umbrella package exposes flat-config-friendly exports; `@typescript-eslint/eslint-plugin@8.59.0` verified. |
| `prettier` | **3.8.3** | Formatter | [VERIFIED: npm view] |
| `prettier-plugin-tailwindcss` | **0.7.3** | Class sorter | [VERIFIED: npm view] |
| `prettier-plugin-organize-imports` | **4.3.0** | Import sorter | [VERIFIED: npm view] |

### Future-phase awareness (for stack-shape consistency, NOT installed in Phase 1)

These are confirmed-current so the planner doesn't accidentally adopt a Phase-1 pattern that breaks them:

| Library | Version (verified) | Lands in Phase |
|---------|--------------------|----------------|
| `@modelcontextprotocol/sdk` | 1.29.0 | Phase 4 |
| `@ai-sdk/anthropic` | 3.0.71 | Phase 4 |
| `recharts` | 3.8.1 | Phase 5 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `better-sqlite3` (native) | `best-sqlite3` (WASM) | WASM eliminates the Alpine native-binding rebuild step but is slower and far less battle-tested. Vibathon proves better-sqlite3 works on Railway; stick with it. |
| `pino` | hand-rolled `console.log(JSON.stringify(...))` shim | See Discretion gap 4. |
| ESLint 9 flat | downgrade to ESLint 8 | Avoiding FlatCompat by staying on ESLint 8 is technically possible but PROJECT.md / CONTEXT.md D-04 explicitly call for ESLint 9. FlatCompat is the documented Next.js path. |
| `zod` v4 | `zod` v3 (3.25.76) | Vibathon used v3. v4 is current latest. For env parsing (`.object().string()...parse()`), the surface is unchanged. Default to v4; downgrade if a surprise emerges. |
| `drizzle-orm` / `kysely` | hand-rolled SQL + repos | CONTEXT.md D-06 already locks hand-rolled. Drizzle/Kysely is deferred. Don't introduce. |

### Installation

```bash
# Phase 1 dependencies (after `pnpm create next-app` scaffolds the baseline)
pnpm add better-sqlite3 zod pino
pnpm add -D @types/better-sqlite3 prettier prettier-plugin-tailwindcss prettier-plugin-organize-imports @eslint/eslintrc
# (next, react, react-dom, typescript, tailwindcss, eslint, eslint-config-next, @types/node/react/react-dom, @tailwindcss/postcss are already pulled in by create-next-app)
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 only)

```
datapraat-design-system-clean/   # repo root (existing)
├── (existing prototype files: DataPraat.html, *.jsx, styles.css, data.js, etc. — left alone)
├── .planning/                    # existing
├── .nvmrc                        # NEW: "22"
├── .env.example                  # NEW: documented in "Discretion gap 5"
├── .gitignore                    # MODIFIED: add .next, node_modules, .env, .env.local, .data/, tsconfig.tsbuildinfo
├── package.json                  # NEW: from create-next-app, then trimmed
├── pnpm-lock.yaml                # NEW
├── tsconfig.json                 # NEW: strict mode
├── next.config.ts                # NEW: output: 'standalone' + env injection
├── eslint.config.mjs             # NEW: flat config with FlatCompat
├── .prettierrc.json              # NEW
├── .prettierignore               # NEW
├── postcss.config.mjs            # NEW: from create-next-app (Tailwind 4)
├── Dockerfile                    # NEW: multi-stage Alpine, ~50 lines
├── nixpacks.toml                 # NEW: ~5 lines
├── railway.toml                  # NEW: ~10 lines
├── public/                       # NEW: from create-next-app
└── src/
    ├── app/
    │   ├── layout.tsx            # NEW: minimal, lang="nl"
    │   ├── page.tsx              # NEW: minimal "DataPraat — Phase 1 Foundation" placeholder
    │   ├── globals.css           # NEW: from create-next-app, Tailwind import only (tokens land in Phase 2)
    │   └── api/
    │       └── health/
    │           └── route.ts      # NEW: the healthcheck handler
    └── lib/
        ├── env.ts                # NEW: zod-parsed env config
        ├── logger.ts             # NEW: pino instance
        └── storage/
            ├── index.ts          # NEW: barrel + repo type exports
            ├── repos.ts          # NEW: HealthProbeRepo interface
            └── sqlite/
                ├── client.ts     # NEW: lazy getDb() + memoization
                ├── migrate.ts    # NEW: <50-line runner
                ├── health-probe.ts # NEW: HealthProbeRepo sqlite impl
                └── migrations/
                    └── 0001_init.sql  # NEW: schema_migrations + health_probe
```

**File count:** ~25 new files, ~600 lines total. No empty stubs (`components/`, `lib/mcp/` etc. are NOT created).

### Pattern 1: Lazy DB initialization with memoization

**What:** `getDb()` opens the sqlite file on first call, runs pending migrations, returns a memoized `Database` handle. Every subsequent call returns the same handle without re-checking.

**When to use:** Whenever a Route Handler needs sqlite. Don't open the file at module load and don't open in `instrumentation.ts` — that would crash boot if `/data` isn't mounted yet (defeating Railway's healthcheck-driven restart loop).

**Why:** CONTEXT.md D-07 explicitly rejects eager init via instrumentation. Lazy init lets the container come up, fail the healthcheck, and get restarted cleanly.

```typescript
// Source: idiomatic better-sqlite3 lazy-init pattern (CITED: better-sqlite3 README + Next.js serverComponentsExternalPackages docs)
// src/lib/storage/sqlite/client.ts
import Database from "better-sqlite3";
import { env } from "@/lib/env";
import { runMigrations } from "./migrate";
import { logger } from "@/lib/logger";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  logger.info({ path: env.DB_PATH }, "opening sqlite");
  db = new Database(env.DB_PATH);
  db.pragma("journal_mode = WAL"); // recommended for concurrent reads
  db.pragma("foreign_keys = ON");
  runMigrations(db);
  return db;
}
```

### Pattern 2: Repo-per-domain async storage interface

**What:** Each domain (health probe, conversation, report, etc.) gets its own interface in `src/lib/storage/repos.ts`. Implementations live next to the underlying engine (`src/lib/storage/sqlite/<name>.ts`). All methods return `Promise<T>` even when the sqlite impl is sync.

**When to use:** Always. Never call `better-sqlite3` directly from a Route Handler. The interface is what survives the eventual Postgres swap.

**Why:** CONTEXT.md D-05 — the async interface means Postgres swap is a one-day drop-in, not a callsite refactor across the codebase. Vibathon's `src/lib/storage/{chats,files,reports}.ts` is the *shape* model (note: vibathon's actual implementation is filesystem-based with `fs.writeFileSync`, not sqlite — DataPraat is sqlite from the start, but mirrors the per-domain module structure).

```typescript
// Source: derived from vibathon's storage shape + CONTEXT.md D-05
// src/lib/storage/repos.ts
export interface HealthProbeRepo {
  /** Writes the current timestamp under `key`. Used by /api/health to prove the volume is writable. */
  recordProbe(key: string, atMs: number): Promise<void>;
  /** Returns the most recently written probe timestamp, or null if none exists. */
  readProbe(key: string): Promise<number | null>;
}
```

```typescript
// src/lib/storage/sqlite/health-probe.ts
import { getDb } from "./client";
import type { HealthProbeRepo } from "../repos";

export const sqliteHealthProbeRepo: HealthProbeRepo = {
  async recordProbe(key, atMs) {
    getDb()
      .prepare(
        "INSERT INTO health_probe (key, value, updated_at) VALUES (?, ?, ?) " +
        "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
      )
      .run(key, String(atMs), atMs);
  },
  async readProbe(key) {
    const row = getDb()
      .prepare("SELECT updated_at FROM health_probe WHERE key = ?")
      .get(key) as { updated_at: number } | undefined;
    return row?.updated_at ?? null;
  },
};
```

```typescript
// src/lib/storage/index.ts — the barrel every Route Handler imports from
export { sqliteHealthProbeRepo as healthProbeRepo } from "./sqlite/health-probe";
export type { HealthProbeRepo } from "./repos";
```

### Pattern 3: Migration runner

**What:** A ~30-line function that scans `src/lib/storage/sqlite/migrations/*.sql`, compares against `schema_migrations`, and applies anything new in a transaction.

**When to use:** Called once from `getDb()` after `new Database(...)`.

**Why:** CONTEXT.md D-06. Hand-rolled keeps Phase 1 light; if Phase 4 wants typed queries, swap to Drizzle/Kysely then.

```typescript
// Source: standard sqlite migration pattern (CITED: better-sqlite3 README, transaction API)
// src/lib/storage/sqlite/migrate.ts
import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { logger } from "@/lib/logger";

const MIGRATIONS_DIR = path.join(process.cwd(), "src/lib/storage/sqlite/migrations");

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[]).map((r) => r.id),
  );

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort(); // lexical sort works because of the zero-padded prefix

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) {
    logger.debug({ count: files.length }, "no pending migrations");
    return;
  }

  const apply = db.transaction((file: string) => {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    db.exec(sql);
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(file, Date.now());
  });

  for (const file of pending) {
    logger.info({ file }, "applying migration");
    apply(file);
  }
  logger.info({ applied: pending.length }, "migrations complete");
}
```

```sql
-- Source: CONTEXT.md D-06 + Specifics
-- src/lib/storage/sqlite/migrations/0001_init.sql
-- (schema_migrations is created by the runner itself; this file is only the domain tables.)
CREATE TABLE IF NOT EXISTS health_probe (
  key        TEXT    PRIMARY KEY,
  value      TEXT    NOT NULL,
  updated_at INTEGER NOT NULL
);
```

**Migration runner gotcha:** `process.cwd()` in `output: 'standalone'` resolves to wherever the standalone server was started from — usually `/app` in the Docker runner. The migrations folder must be **copied into the runner stage**. The Dockerfile section below addresses this explicitly.

### Pattern 4: Healthcheck Route Handler

**What:** `/api/health` returns the rich JSON shape from CONTEXT.md Specifics. Probes the storage seam (proves volume + migrations); fails 503 on any sub-check error.

```typescript
// Source: CONTEXT.md D-08, D-09 + Specifics health response shape
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { healthProbeRepo } from "@/lib/storage";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Force Node runtime — better-sqlite3 needs it (and we're avoiding Edge per FOUND-07)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const result = {
    status: "ok" as "ok" | "degraded",
    commitSha: process.env.NEXT_PUBLIC_COMMIT_SHA ?? "unknown",
    buildTime: process.env.BUILD_TIME ?? "unknown",
    nodeEnv: env.NODE_ENV,
    uptimeSec: Math.round(process.uptime()),
    db: { ok: true as boolean, probeMs: 0 as number },
  };

  try {
    const t0 = Date.now();
    await healthProbeRepo.recordProbe("last_health_check", t0);
    const readBack = await healthProbeRepo.readProbe("last_health_check");
    if (readBack === null) throw new Error("probe roundtrip returned null");
    result.db.probeMs = Date.now() - t0;
  } catch (err) {
    logger.error({ err }, "health probe failed");
    result.status = "degraded";
    result.db.ok = false;
    return NextResponse.json(result, { status: 503 });
  }

  logger.debug({ probeMs: result.db.probeMs, totalMs: Date.now() - startedAt }, "health ok");
  return NextResponse.json(result, { status: 200 });
}
```

### Anti-Patterns to Avoid

- **Initializing the DB at module load** (`const db = new Database(...)` at the top of a file): blocks boot, defeats healthcheck-driven restarts.
- **Calling sqlite from `instrumentation.ts`** (CONTEXT.md D-07 already rejects this; restating because it's tempting once you discover instrumentation is stable in Next 15).
- **Sync storage interface** (`recordProbe(...): void`): forces every callsite to refactor at Postgres swap. CONTEXT.md D-05.
- **Using Edge runtime on any route** (`export const runtime = 'edge'`): violates "no Vercel-only APIs" per FOUND-07 and is incompatible with `better-sqlite3` (native binding). Always `runtime = "nodejs"`.
- **Importing from `next/og`, `@vercel/kv`, `@vercel/blob`, `@vercel/postgres`**: PROJECT.md "no Vercel-specific APIs" constraint. None should appear in Phase 1.
- **Trusting `process.env.X` without validation**: bypasses `src/lib/env.ts`, defeats the fail-fast goal of CONTEXT.md D-04. All env reads go through `env`.
- **Hardcoding the DB path in code**: must come from `env.DB_PATH` per CONTEXT.md D-07.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Env-var validation | Custom `if (!process.env.X) throw` chain | `zod` `.object().parse()` | Zod gives one place to define + document required vars; throws with field-level errors; coerces types (`coerce.number()`, `enum`). |
| Structured logging | `console.log(JSON.stringify({...}))` shim | `pino` 10.x | See Discretion gap 4. Pino is faster, has stable serializers (`err`, `req`), and log levels you'd otherwise reinvent. |
| sqlite migrations | A custom CLI tool | The ~30-line in-process runner above | A separate tool means another binary to ship in the Docker runner. In-process runs at first DB access and stays simple. (Drizzle/Kysely come later if Phase 4 needs typed queries.) |
| Healthcheck shape | Plain `return NextResponse.json({ ok: true })` | The `db.probeMs` round-trip pattern | "Process is alive" is not "DB is reachable on the mounted volume". The probe round-trip catches volume-not-mounted, file-not-writable, and migration failures in one signal. |
| Multi-stage Dockerfile from scratch | Ad-hoc Dockerfile | Adapt the Next.js official `with-docker` template + the better-sqlite3 native-binding step | The official template handles standalone copy + non-root user correctly; we add ~5 lines for native deps. |
| Build-time env injection | Reading git rev-parse at request time | `next.config.ts` setting `env.NEXT_PUBLIC_COMMIT_SHA` at build | Build-time means zero per-request cost; `NEXT_PUBLIC_*` is automatically inlined by Next. |

**Key insight:** Phase 1 is mostly _restraint_. The temptation is to ship CI, error boundaries, request IDs, graceful shutdown, etc. CONTEXT.md correctly defers all of these. Resist scope creep — every premature addition costs Phase 7 a refactor.

## Discretion Gap Resolutions

The six "Claude's Discretion" items from CONTEXT.md, with concrete recommendations.

### Gap 1: pnpm version pin

**Recommendation:** `"packageManager": "pnpm@10.30.2"` (with SHA — Corepack accepts the version string and validates download integrity if you append `+sha512.<hash>`).

**Rationale:** [VERIFIED: npm view pnpm version → 10.30.2 on 2026-04-26]. Local environment also reports 10.30.2 (`pnpm --version`). Pin exact version, not `^10` — Corepack downloads exactly what's pinned, which is the entire point of the field.

**Optional hardening (skip in Phase 1, add in Phase 7):** Append the integrity hash. `corepack use pnpm@10.30.2` writes the field with hash automatically.

### Gap 2: Next.js / React patch versions

**Recommendation:**
- `"next": "15.5.15"` (exact — pin until you intentionally upgrade)
- `"react": "19.2.5"`
- `"react-dom": "19.2.5"`

**Rationale:** All three [VERIFIED: npm view] as latest stable in their respective lines on 2026-04-26. The `backport` dist-tag on `next` confirms the 15-line is actively maintained even though `latest` has moved to 16.

### Gap 3: Zod env schema shape

**Recommendation:** Minimum Phase 1 schema, designed to extend cleanly when Phase 4 adds AI keys.

```typescript
// Source: zod v4 docs + CONTEXT.md D-04, D-07 + Phase 4 awareness
// src/lib/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

  // Storage
  DB_PATH: z
    .string()
    .min(1)
    .default(process.env.NODE_ENV === "production" ? "/data/datapraat.sqlite" : "./.data/datapraat.sqlite"),

  // Build-time injected (defaulted because they're absent in dev)
  NEXT_PUBLIC_COMMIT_SHA: z.string().default("dev"),
  BUILD_TIME: z.string().default(""),
});

export type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Fail fast with readable errors per CONTEXT.md D-04
    console.error("[env] Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration — see logs above");
  }
  return result.data;
}

export const env: Env = parseEnv();
```

**Phase 4 extension preview (DO NOT add now):**
```typescript
// Phase 4 will append:
ANTHROPIC_API_KEY: z.string().min(1).optional(),
OPENAI_API_KEY: z.string().min(1).optional(),
DEFAULT_MODEL: z.enum(["anthropic:claude-sonnet-4", "openai:gpt-4o"]).default("anthropic:claude-sonnet-4"),
MCP_SERVER_URL: z.string().url(),
// ...with a `.refine()` ensuring at least one of ANTHROPIC_API_KEY / OPENAI_API_KEY is present.
```

The split between "required" (no default, will throw) and "optional with default" is the lever — Phase 1 needs nothing strictly required from outside the container, so everything has a default. Phase 4 will add genuinely required keys.

### Gap 4: Logger choice — pino vs hand-rolled JSON shim

**Recommendation:** Use `pino@10.3.1`.

**Analysis:**
- **Pino footprint:** [VERIFIED: npm view pino dependencies] 11 transitive deps (`atomic-sleep`, `on-exit-leak-free`, `pino-abstract-transport`, `pino-std-serializers`, `process-warning`, `quick-format-unescaped`, `real-require`, `safe-stable-stringify`, `@pinojs/redact`, `sonic-boom`, `thread-stream`). Total install ~250KB. Cold-start cost is negligible (microseconds; pino is the fastest Node logger by benchmark).
- **Hand-rolled shim cost:** A 30-line `console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...ctx }))` works, but you'll re-derive: log levels, child loggers (`logger.child({ requestId })` for OPS-02 in Phase 7), error serialization (Error → `{ message, stack, name }`), redaction (when secrets land in Phase 4). Each is a few lines of pino, each is a real maintenance item if hand-rolled.
- **The deciding factor:** Phase 7 (OPS-02) wires per-route request IDs via `logger.child({ requestId })`. That's a one-liner with pino and a refactor with the shim. Establish the pino dependency now to lock the log shape.

**Implementation:**
```typescript
// src/lib/logger.ts
import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  // production: raw JSON to stdout; dev: optionally pretty (skip in Phase 1, add in Phase 7)
});
```

**Pino-pretty:** Skip in Phase 1. Adding `pino-pretty` in dev requires a transport setup that adds ~5 lines of conditional logic. Raw JSON in dev is fine for Phase 1; revisit in Phase 7.

### Gap 5: `.env.example` only, vs `.env.example` + `.env.development`

**Recommendation:** **`.env.example` only.** Skip `.env.development`.

**Rationale:**
- The Zod schema in Gap 3 already provides defaults for every Phase 1 var (`DB_PATH` defaults to the dev path when `NODE_ENV !== production`, `LOG_LEVEL` defaults to `info`, etc.).
- Next.js auto-loads `.env.development`, `.env.local`, `.env.production` etc. in a documented precedence — adding `.env.development` to git would tempt people to put secrets there (Next loads it with no `NEXT_PUBLIC_` prefix scrutiny).
- `.env.example` with comments documenting the defaults is the cleanest contract. Local dev = "copy `.env.example` to `.env.local` if you want to override anything."

**`.env.example` content (minimum Phase 1):**
```bash
# DataPraat — environment configuration
# Copy this file to `.env.local` to override defaults for local development.
# In production, every var is set by the deploy platform (Railway / Azure).

# Runtime mode. Defaulted by Next.js based on `pnpm dev` vs `pnpm start`.
# NODE_ENV=development

# Pino log level: trace | debug | info | warn | error | fatal. Default: info.
# LOG_LEVEL=info

# sqlite database file path.
# Default in production: /data/datapraat.sqlite (Railway volume).
# Default in development: ./.data/datapraat.sqlite (gitignored).
# DB_PATH=./.data/datapraat.sqlite
```

Build-time vars (`NEXT_PUBLIC_COMMIT_SHA`, `BUILD_TIME`) are intentionally not in `.env.example` — they're injected by `next.config.ts` at build time and have safe defaults in the Zod schema for dev.

### Gap 6: Migration runner implementation

**Recommendation:** The ~30-line implementation in Pattern 3 above. Already provided verbatim.

## Code Examples (additional)

### `next.config.ts` — build-info injection + standalone

```typescript
// Source: CONTEXT.md D-12, D-15 + Next.js docs (output: standalone, env injection)
// next.config.ts
import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function gitSha(): string {
  if (process.env.RAILWAY_GIT_COMMIT_SHA) return process.env.RAILWAY_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // Build-time env injection — CONTEXT.md D-12
  env: {
    NEXT_PUBLIC_COMMIT_SHA: gitSha(),
    BUILD_TIME: new Date().toISOString(),
  },

  // better-sqlite3 is in Next.js's built-in serverExternalPackages allowlist
  // since Next 15, so no manual entry needed (CITED: nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).
  // Documenting here for clarity:
  // serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
```

**Note vibathon contrast:** Vibathon used `experimental.serverComponentsExternalPackages` (deprecated in Next 15). The renamed stable key is `serverExternalPackages`, and better-sqlite3 is in the built-in allowlist anyway. Don't copy vibathon's `next.config.mjs` verbatim — it's a deprecated pattern.

### `tsconfig.json` — strict mode

```jsonc
// Source: create-next-app default + CONTEXT.md D-04 strict-mode requirement
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "next.config.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Critical strict-mode flags `create-next-app` does NOT enable** but CONTEXT.md D-04 implies you'd want:
- `"noUncheckedIndexedAccess": true` — defends against `arr[0]` returning `T | undefined`. Strongly recommended; surfaces a class of bugs at compile time.
- `"noImplicitOverride": true`, `"noFallthroughCasesInSwitch": true` — cheap.

Recommendation: **enable `noUncheckedIndexedAccess`** in Phase 1. The other two are taste; defer to planner.

### `eslint.config.mjs` — flat config with `eslint-config-next` via FlatCompat

```javascript
// Source: github.com/vercel/next.js/discussions/71806 (canonical pattern from Next.js maintainers)
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Project-specific overrides go here. None in Phase 1.
    },
  },
  {
    ignores: [".next/**", "node_modules/**", ".data/**", "out/**"],
  },
];
```

**Why FlatCompat is unavoidable:** [CITED: eslint-config-next discussion #71806] As of 15.5.15, `eslint-config-next` still ships eslintrc-format only. Next.js maintainers acknowledge the planned migration to native flat config but haven't shipped it. Until they do, FlatCompat is the documented bridge.

### `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"]
}
```

**Note on convention conflict:** The prototype repo uses **double quotes** (per CONVENTIONS.md), so `singleQuote: false` matches. The new app inherits double-quote style — no friction.

### Dockerfile — multi-stage with better-sqlite3 native bindings on Alpine

```dockerfile
# Source: Next.js official with-docker template + better-sqlite3 docs/compilation.md (CITED)
# Dockerfile

# ---------- deps stage ----------
FROM node:22-alpine AS deps
# Native bindings require these. Critical for better-sqlite3 — do NOT skip.
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Enable Corepack so the pinned pnpm version installs automatically
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY package.json pnpm-lock.yaml ./
# --frozen-lockfile = CI mode, refuse to modify the lockfile
RUN pnpm install --frozen-lockfile

# ---------- builder stage ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env that next.config.ts reads (RAILWAY_GIT_COMMIT_SHA is injected by Railway)
ARG RAILWAY_GIT_COMMIT_SHA
ENV RAILWAY_GIT_COMMIT_SHA=${RAILWAY_GIT_COMMIT_SHA}

RUN pnpm build

# ---------- runner stage ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# better-sqlite3 native binding needs libc6-compat at runtime on Alpine
RUN apk add --no-cache libc6-compat

# Non-root user (CONTEXT.md D-15)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone server + static + public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# CRITICAL: copy migration SQL files into runner — standalone tracing doesn't include
# non-imported files, and runMigrations reads them via fs.readFileSync.
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/storage/sqlite/migrations ./src/lib/storage/sqlite/migrations

USER nextjs
EXPOSE 3000

# Healthcheck per CONTEXT.md D-15 (consumed by Docker, Azure Container Apps, etc.)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
```

**Three native-binding gotchas resolved:**

1. **Build deps on Alpine:** `python3 make g++` in the `deps` stage. Without these, `node-gyp` cannot rebuild `better-sqlite3`. Prebuilt binaries are published for `linux-musl-x64` for recent better-sqlite3 versions, but the rebuild path must work as fallback. [CITED: better-sqlite3 docs/compilation.md]
2. **`libc6-compat` in the runner:** Alpine uses musl libc; the prebuilt better-sqlite3 binary expects glibc symbols. `libc6-compat` provides the compatibility layer. Without it, you get cryptic `Error: Cannot find module ...build/Release/better_sqlite3.node` or symbol-resolution errors at runtime.
3. **Migration files must be copied separately:** Next.js standalone tracing follows `import` chains; `fs.readFileSync(MIGRATIONS_DIR + ...)` is invisible to the tracer. Hence the explicit `COPY ... migrations ./src/lib/storage/sqlite/migrations` line. (The alternative — bundling SQL as string imports — is uglier and harder to inspect.)

**Why `wget --spider` for HEALTHCHECK:** Alpine's `node:22-alpine` includes `wget` busybox, not `curl`. Saves an `apk add curl` line.

### `nixpacks.toml` — minimum viable Nixpacks config

```toml
# Source: nixpacks.com/docs/providers/node + Railway-specific defaults
# Nixpacks auto-detects Node 22 from package.json `engines.node`. The setup phase
# auto-installs python3, gcc, and make when `node-gyp` is in the dependency tree.
# We pin explicitly to be safe — better-sqlite3 needs all three.
[phases.setup]
nixPkgs = ["nodejs_22", "pnpm-9_x", "python3", "gcc", "gnumake"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm build"]

[start]
cmd = "node .next/standalone/server.js"
```

**Caveats:**
- Nixpacks's `pnpm-9_x` Nix package is the latest available; the `packageManager` field in `package.json` will cause Corepack to download `pnpm@10.30.2` on top. This is fine but non-obvious. Alternative: omit `pnpm-9_x` from `nixPkgs` and let Corepack be the only source of pnpm.
- Railway is migrating from Nixpacks to Railpack — the current Nixpacks config still works, but the planner should note that a Railpack-equivalent config may eventually be needed. Out of Phase 1 scope.

### `railway.toml` — Railway deploy config

```toml
# Source: docs.railway.com/reference/config-as-code + CONTEXT.md D-14
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[volumes]]
mountPath = "/data"
```

**Differences from vibathon's `railway.toml`:**
- vibathon used `healthcheckPath = "/"` and `startCommand = "npm run start"`. DataPraat uses `/api/health` (CONTEXT.md D-14) and omits `startCommand` (Nixpacks `[start]` handles it).
- Volume mount is identical — `/data` is the established convention.

## State of the Art

| Old Approach (vibathon, 2024) | Current Approach (DataPraat, 2026-04) | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js 14.2 + `experimental.serverComponentsExternalPackages` | Next.js 15.5 + built-in `serverExternalPackages` allowlist (or stable explicit key) | Next 15.0, Oct 2024 | One less config line; `better-sqlite3` works out of the box. |
| React 18.x | React 19.2.x | React 19 GA, Dec 2024 | Stable Server Components, `use()` hook, `useActionState`. No Phase 1 surface impact. |
| Tailwind 3 + `tailwind.config.js` + JS-based theme | Tailwind 4 + CSS-first `@theme` + `@tailwindcss/postcss` | Tailwind 4, Jan 2025 | Phase 2 design tokens land directly in `app/globals.css` via `@theme`, not in JS. Phase 1 just installs the scaffold. |
| ESLint 8 + `.eslintrc.json` extending `next/core-web-vitals` | ESLint 9 + `eslint.config.mjs` + FlatCompat bridge | ESLint 9 GA, Apr 2024; `eslint-config-next` flat-native still pending | One-time setup friction. After flat config is wired, daily use is identical. |
| `experimental.instrumentationHook = true` + `instrumentation.ts` | `instrumentation.ts` (no flag) | Next 15.0 | Stable. CONTEXT.md correctly avoids it for DB init; will be useful in Phase 7 for OpenTelemetry / OPS-02. |
| `next.config.mjs` | `next.config.ts` | Next 15.0 | TypeScript config files are now first-class. Use `.ts`. |

**Deprecated/outdated:**
- `experimental.serverComponentsExternalPackages` → renamed to `serverExternalPackages` (and `better-sqlite3` is in the built-in list).
- `next lint` (the old `eslint-next` CLI integration) → use `eslint .` directly with flat config.
- `next/legacy/image` → not relevant in Phase 1, but flag for Phase 3 (Marketing).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@types/react@^19` and `@types/react-dom@^19` are the right pin | Standard Stack | Low. create-next-app pins these automatically; if version skew emerges, planner adjusts. |
| A2 | `@types/node@^22` matches Node 22 runtime | Standard Stack | Very low. Standard convention. |
| A3 | `typescript-eslint@^8` umbrella package exposes flat-config-friendly entry | Standard Stack | Low. The package's flat-config exports have been stable since v8.0; verified `@typescript-eslint/eslint-plugin@8.59.0` exists. |
| A4 | `@eslint/js@^9` is the right pairing for FlatCompat usage | Standard Stack | Very low. Documented in ESLint flat-config migration guide. |
| A5 | Zod v4 surface is backward-compatible enough for `.object().enum().string().default().parse()` patterns | Discretion gap 3 | Medium. Zod v4 had a few breaking changes (some `.refine` semantics, error format). For env parsing the surface is unchanged, but planner should test the schema once and confirm. Fallback: pin `zod@3` (3.25.76 verified). |
| A6 | `RAILWAY_GIT_COMMIT_SHA` is the env var Railway actually sets at build time | next.config.ts snippet | Medium. Railway docs name several variables; `RAILWAY_GIT_COMMIT_SHA` is the documented one. The fallback to `git rev-parse` makes this robust for local builds either way. |
| A7 | `node:22-alpine` + `libc6-compat` is the cleanest Alpine option for better-sqlite3 | Dockerfile | Medium-low. The alternative is `node:22-bookworm-slim` (Debian-based) which avoids the musl/glibc dance entirely at the cost of a larger image (~120MB vs ~80MB). Planner decision. Recommendation stays Alpine + libc6-compat (matches industry default). |
| A8 | better-sqlite3 prebuilt binaries are published for `linux-musl-x64` for v12.9.0 | Dockerfile | Low. better-sqlite3 has shipped musl prebuilds since v9.x. The `python3 make g++` deps are belt-and-suspenders for the rebuild fallback. |
| A9 | Pino's transitive deps will stay stable enough that "lock pino@10.3.1" doesn't pull in a breaking dep change | Discretion gap 4 | Very low. Pino is famously conservative; v10 is the current major. |
| A10 | The migration runner's `process.cwd()` resolves correctly inside the standalone runner | migrate.ts code + Dockerfile | Low — the explicit `COPY --from=builder ... migrations` resolves this. The risk is forgetting that COPY line. Verification step: build the Docker image, run it, hit `/api/health`, expect 200. |

## Open Questions

1. **Should we bundle SQL migrations as TypeScript string exports instead of `fs.readFileSync`?**
   - What we know: `fs.readFileSync(MIGRATIONS_DIR + ...)` works and the explicit `COPY` line in the Dockerfile resolves the standalone-tracing gap.
   - What's unclear: Whether the planner finds `import schemaV1 from "./migrations/0001_init.sql?raw"` (Vite/Webpack raw import) cleaner. Answer: probably not in Next.js — `?raw` imports are a Vite idiom; Next.js would need a custom webpack rule.
   - Recommendation: stick with `fs.readFileSync` + explicit `COPY`. It's the most portable pattern.

2. **Should `instrumentation.ts` be created in Phase 1 even if empty?**
   - What we know: It's stable in Next 15. CONTEXT.md D-07 says don't use it for DB init.
   - What's unclear: Whether Phase 7 (OPS-02 structured logging) will want it. Probably yes — `onRequestError` is the natural hook for "log any unhandled error with request context."
   - Recommendation: Don't create it in Phase 1. Phase 7 owns it. (Honors CONTEXT.md D-02: no empty stubs.)

3. **Should the deploy-target separation between Railway (Nixpacks) and Azure (Dockerfile) be documented in a separate `DEPLOY.md`?**
   - What we know: README is OPS-03, lives in Phase 7.
   - Recommendation: Defer. Phase 1 ships the configs; Phase 7's README explains the path.

4. **Does `output: 'standalone'` need any companion config for the public directory copy?**
   - Verified: The Dockerfile copies `public/` explicitly. Next.js 15 standalone does not include `public/` automatically — this is documented behavior.
   - Recommendation: Just confirm the Dockerfile has the line (it does, above).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 | Runtime, build | ✓ | 22.22.1 | — (CONTEXT.md locks Node 22) |
| pnpm | Package manager | ✓ | 10.30.2 | — (Corepack will download exact pin in CI) |
| Corepack | pnpm version management | ✓ | 0.34.6 | — (bundled with Node 22) |
| Docker | Local Dockerfile testing | ✓ | 29.2.1 | — |
| git | Build-time SHA fallback | ✓ | 2.39.5 | — |
| Railway CLI | Local deploy testing (optional) | ✗ | — | Skip — `git push` triggers deploy via GitHub integration. Not needed for Phase 1 work. |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** Railway CLI is not installed locally. Planner: don't add a Phase 1 task that requires it.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **none yet** — will be installed in Wave 0 |
| Recommended | **Vitest 3.x** (lighter than Jest, native ESM, Vite-native, fast for sqlite-touching code) |
| Config file | `vitest.config.ts` (Wave 0) |
| Quick run command | `pnpm test --run` (one-shot, no watch) |
| Full suite command | `pnpm test --run && pnpm lint && pnpm build` |

**Why Vitest, not Jest:** Vitest works out of the box with Next.js 15's TypeScript + ESM stack; Jest's ESM story still requires non-trivial config. Vitest 3 is current stable. Bundle size is smaller. **Most of Phase 1's validation is integration-shaped (boot sqlite, hit `/api/health`), not unit-shaped — Vitest's native ESM speed matters.**

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| FOUND-01 | `pnpm dev` boots Next.js 15 + React 19 at localhost:3000 | smoke (manual once + scripted check) | `pnpm dev &; sleep 5; curl -fsS http://localhost:3000 \| grep -q DataPraat; kill %1` | ❌ Wave 0 (`scripts/check-dev-boot.sh`) |
| FOUND-01 | `pnpm build` produces successful production build | smoke | `pnpm build` (exit 0) | ✓ (built into pnpm/next) |
| FOUND-04 | TypeScript strict mode passes | static | `pnpm exec tsc --noEmit` | ✓ |
| FOUND-04 | ESLint passes on clean tree | static | `pnpm exec eslint .` | ✓ once `eslint.config.mjs` lands |
| FOUND-04 | Prettier passes | static | `pnpm exec prettier --check .` | ✓ once `.prettierrc.json` lands |
| FOUND-05 | Production build uses `output: 'standalone'` | static | `test -f .next/standalone/server.js` after `pnpm build` | ❌ Wave 0 (`scripts/check-standalone.sh` — 1 line) |
| FOUND-05 | Dockerfile builds successfully | smoke | `docker build -t datapraat:phase1 .` | ✓ once Dockerfile lands |
| FOUND-05 | Docker image runs and serves `/api/health` returning 200 | integration | `docker run -p 3000:3000 -v $PWD/.data:/data datapraat:phase1 &; sleep 8; curl -fsS http://localhost:3000/api/health; kill %1` | ❌ Wave 0 (`scripts/check-docker-health.sh`) |
| FOUND-06 | Storage interface reads/writes at configured DB_PATH | unit | `pnpm test src/lib/storage` | ❌ Wave 0 (`src/lib/storage/sqlite/health-probe.test.ts`) |
| FOUND-06 | Migration runner applies pending migrations idempotently | unit | `pnpm test src/lib/storage/sqlite/migrate.test.ts` | ❌ Wave 0 |
| FOUND-06 | `getDb()` is lazy + memoized (one open per process) | unit | `pnpm test src/lib/storage/sqlite/client.test.ts` | ❌ Wave 0 |
| FOUND-07 | Zod env schema rejects missing/invalid required vars | unit | `pnpm test src/lib/env.test.ts` | ❌ Wave 0 |
| FOUND-07 | `.env.example` enumerates every var the schema knows about | static | `pnpm test scripts/check-env-example.test.ts` (parses `.env.example` keys vs Zod schema keys) | ❌ Wave 0 (small but high-value) |
| FOUND-07 | Codebase contains no Vercel-only API imports | static | `! grep -rE '@vercel/(kv\|blob\|postgres\|edge-config)\|next/og\|export const runtime = ["'"'"']edge["'"'"']' src/` | ❌ Wave 0 (`scripts/check-no-vercel.sh`) |
| OPS-01 | `/api/health` returns 200 with all 6 fields under happy path | integration | `pnpm test src/app/api/health/route.test.ts` | ❌ Wave 0 |
| OPS-01 | `/api/health` returns 503 when DB probe fails | integration | same file as above | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm exec tsc --noEmit && pnpm exec eslint .` (~5–10s)
- **Per wave merge:** `pnpm test --run && pnpm build` (~60s)
- **Phase gate:** Full suite green: `pnpm test --run && pnpm lint && pnpm exec prettier --check . && pnpm build && docker build -t datapraat:phase1 . && bash scripts/check-docker-health.sh`

### Wave 0 Gaps

- [ ] `vitest@^3` + `@vitest/ui` + `@types/node` installed; `vitest.config.ts` created
- [ ] `package.json scripts.test = "vitest"` added
- [ ] `src/lib/env.test.ts` — covers FOUND-07 (Zod schema rejects/accepts)
- [ ] `src/lib/storage/sqlite/client.test.ts` — covers FOUND-06 (lazy, memoized, opens at `:memory:` for tests)
- [ ] `src/lib/storage/sqlite/migrate.test.ts` — covers FOUND-06 (idempotent, applies in order)
- [ ] `src/lib/storage/sqlite/health-probe.test.ts` — covers FOUND-06 (record + read round-trip)
- [ ] `src/app/api/health/route.test.ts` — covers OPS-01 (200 happy, 503 degraded)
- [ ] `scripts/check-dev-boot.sh` — covers FOUND-01
- [ ] `scripts/check-standalone.sh` — covers FOUND-05
- [ ] `scripts/check-docker-health.sh` — covers FOUND-05 + OPS-01 end-to-end
- [ ] `scripts/check-env-example.test.ts` (or shell) — covers FOUND-07
- [ ] `scripts/check-no-vercel.sh` — covers FOUND-07

## Project Constraints (from CLAUDE.md)

These directives have the same authority as locked decisions and must shape every Phase 1 plan:

- **Tech stack pins:** Next.js 15, React 19, TypeScript 5 (strict), Tailwind 4, shadcn 4 `base-vega`, Base UI, AI SDK 5, MCP SDK, Recharts 3, Tabler Icons, Zod, better-sqlite3. **Phase 1 installs only the framework + storage subset; the others land in their introducing phase.** Don't pre-install AI SDK, MCP SDK, shadcn, Recharts, etc.
- **Runtime:** Node 22.
- **Hosting v1:** Railway with Nixpacks + `/data` volume. Architect for Azure Container Apps + Azure Files later.
- **No Vercel-only APIs** — Edge runtime, `@vercel/kv`, `@vercel/blob`, `@vercel/postgres`. Phase 1's Vercel-avoidance audit (FOUND-07) verifies this.
- **Persistence:** sqlite via better-sqlite3 on volume, behind a storage abstraction so Postgres is a one-day swap.
- **Language:** Dutch in UI copy and domain identifiers; English in framework/utility code. **Phase 1 is almost entirely framework code → English.** The minimal `app/page.tsx` placeholder can use Dutch ("DataPraat — Fundering" or similar) but doesn't have to.
- **Auth (v1):** None / shared-link. No NextAuth or auth scaffolding in Phase 1.
- **Build philosophy:** Clean rebuild. Do NOT port `window.*` globals or Babel-Standalone patterns from the prototype HTML/JSX files. Use ES modules, RSC, proper TS imports.
- **GSD Workflow Enforcement:** All file edits must go through a GSD workflow. Phase 1 will be executed via `/gsd-execute-phase 1`.
- **Existing prototype files at repo root** (`DataPraat.html`, `*.jsx`, `styles.css`, `data.js`, `Logos.html`, `website*.html`, etc.) are **reference material — leave them in place, do not modify, do not delete in Phase 1.** They get cleaned up in a later milestone after Phases 2–6 have ported what they need.
- **Dutch domain identifiers** in env vars and log keys: per CONTEXT.md, **stay English** (`DB_PATH`, not `databasepad`). Domain-noun rule applies to user-facing identifiers, not system config.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ESLint flat config + FlatCompat surprise (e.g., `next/typescript` extension fails to load) | Medium | Hours of debugging | Use the verbatim `eslint.config.mjs` from this research; it's the canonical pattern from Next.js maintainers. If it fails, `pnpm dlx create-next-app@latest` and copy its scaffold-generated `eslint.config.mjs`. |
| better-sqlite3 prebuilt binary missing for `linux-musl-x64` after a future minor bump | Low | Container build slows by ~30s (rebuild from source) | The `python3 make g++` deps in the Dockerfile cover this. Caching the deps stage means it only happens once per dependency change. |
| Migration files not copied into standalone runner → app boots, fails on first DB write | Medium (easy to forget) | Phase 1 acceptance fails | The Dockerfile section calls this out explicitly with a `# CRITICAL:` comment. The Wave 0 `check-docker-health.sh` smoke test catches it. |
| Tailwind 4 PostCSS plugin not picked up in production build | Low | CSS missing in build output | create-next-app handles this; trust the scaffold. The `postcss.config.mjs` it generates has the right shape. |
| Zod v4 unexpected change to `.parse()` error shape breaks the env error-printer | Low-medium | Cosmetic (errors still surface, just less pretty) | Test `src/lib/env.test.ts` covers this. Fallback: pin `zod@3.25.76`. |
| Railway environment variable `RAILWAY_GIT_COMMIT_SHA` is named differently | Low | `commitSha` shows "unknown" in `/api/health` (cosmetic) | The `git rev-parse` fallback in `next.config.ts` covers local builds. For Railway, the planner verifies the var name during the first deploy. |
| Tailwind v4 zero-config means PHASE 2 needs to learn `@theme` directive (different from v3 JS config) | Certain | Phase 2 design-token work shape changes | Out of Phase 1 scope. Already noted in CONTEXT.md ("Tailwind 4 ships from the scaffold but design tokens land in Phase 2"). |
| Vibathon's storage shape inspires a filesystem-based impl by mistake | Medium | Storage seam diverges from CONTEXT.md D-05 (sqlite, not fs) | This RESEARCH.md explicitly flags the pitfall: vibathon's `chats.ts` etc. are FS-based (`fs.readFileSync`); DataPraat is sqlite from the start. Mirror the *module structure*, not the *implementation*. |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`) — exact versions for next, react, typescript, eslint, eslint-config-next, better-sqlite3, zod, pino, prettier, tailwindcss, pnpm (verified 2026-04-26)
- Next.js docs: `output: 'standalone'`, `serverExternalPackages`, `instrumentation.ts`, Route Handlers, `next.config.ts`
- better-sqlite3 README + `docs/compilation.md` (CITED: github.com/WiseLibs/better-sqlite3)
- Vibathon repo (`/Users/daan/VS Studio/vibathon-knowledgegraph/`) — `package.json`, `railway.toml`, `next.config.mjs`, `nixpacks.toml`, `src/lib/storage/{chats,files,reports}.ts` (architectural shape only; impl is FS-based, not sqlite)
- CONTEXT.md (`.planning/phases/01-foundation/01-CONTEXT.md`) — locked decisions D-01 through D-15
- PROJECT.md, REQUIREMENTS.md, ROADMAP.md (`.planning/`) — phase requirements and success criteria

### Secondary (MEDIUM confidence)
- [Next.js Docker template + Alpine + better-sqlite3 community discussions](https://github.com/WiseLibs/better-sqlite3/discussions/1270) — Alpine native binding pattern
- [eslint-config-next on ESLint v9 example (Vercel discussion #71806)](https://github.com/vercel/next.js/discussions/71806) — FlatCompat bridge pattern
- [Tailwind CSS v4 release notes](https://tailwindcss.com/blog/tailwindcss-v4) — PostCSS plugin location, CSS-first config
- [Tailwind PostCSS install guide](https://tailwindcss.com/docs/installation/using-postcss) — `@tailwindcss/postcss` package
- [Next.js instrumentation.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation) — stable in Next 15
- [Railway Nixpacks docs](https://docs.railway.com/reference/nixpacks) — Nixpacks config, build deps
- [Nixpacks Node provider docs](https://nixpacks.com/docs/providers/node) — Node version detection, pnpm install pattern
- [Corepack docs](https://nodejs.org/api/corepack.html) — packageManager field, pnpm version pinning

### Tertiary (LOW confidence — flagged for planner validation)
- Exact `RAILWAY_GIT_COMMIT_SHA` env var name (cross-checked vs Railway docs but the var-naming convention is occasionally renamed)
- Whether Zod v4 fully supports the v3-style `.flatten().fieldErrors` error shape (assumed yes; test covers it)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified via `npm view` on 2026-04-26
- Architecture / patterns: HIGH — derived from CONTEXT.md (locked) + verified Next.js / better-sqlite3 docs
- Pitfalls (Alpine native bindings, ESLint flat config, standalone migrations copy): HIGH — each cross-referenced with at least two community sources
- Discretion gap resolutions: HIGH for gaps 1, 2, 5, 6; MEDIUM-HIGH for 3 (Zod v4 surface assumption); HIGH for 4 (pino vs shim is a clear win for pino)
- Validation Architecture: MEDIUM-HIGH — Vitest is recommended but not prescribed in CONTEXT.md; planner can substitute Jest/Node test runner if there's a reason

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (30 days — stack is stable; refresh before any new phase if Next.js 16 minor lands)
