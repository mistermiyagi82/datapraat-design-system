---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Framework**          | Vitest 3.x (installed in Wave 0; no framework today)                                |
| **Config file**        | `vitest.config.ts` (Wave 0)                                                         |
| **Quick run command**  | `pnpm exec tsc --noEmit && pnpm exec eslint .` (~5–10s)                             |
| **Full suite command** | `pnpm test --run && pnpm lint && pnpm exec prettier --check . && pnpm build` (~60s) |
| **Estimated runtime**  | quick ~10s · full ~60s · phase gate (incl. docker) ~3–5 min                         |

---

## Sampling Rate

- **After every task commit:** Run `pnpm exec tsc --noEmit && pnpm exec eslint .`
- **After every plan wave:** Run `pnpm test --run && pnpm build`
- **Before `/gsd-verify-work`:** Full phase gate must be green: `pnpm test --run && pnpm lint && pnpm exec prettier --check . && pnpm build && docker build -t datapraat:phase1 . && bash scripts/check-docker-health.sh`
- **Max feedback latency:** 10 seconds (per-task), 60 seconds (per-wave)

---

## Per-Task Verification Map

> Filled in by the planner during PLAN.md authoring. Every task in every PLAN.md
> must have a row here, mapped to a Wave-0 test artifact OR an inline `<automated>`
> command. No 3 consecutive tasks may go without an automated verify.

| Task ID  | Plan | Wave | Requirement                          | Threat Ref | Secure Behavior                                                                                                      | Test Type    | Automated Command                                                                                                                                                                                                                    | File Exists                                                                                                                                            | Status     |
| -------- | ---- | ---- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 01-01-T1 | 01   | 0    | FOUND-01, FOUND-07                   | T-1-01     | .gitignore covers .env\*, .data/ before any code lands                                                               | scaffold     | `grep -q "/.next/" .gitignore && grep -q "/.data/" .gitignore && pnpm exec vitest --version`                                                                                                                                         | inline                                                                                                                                                 | ⬜ pending |
| 01-01-T2 | 01   | 0    | FOUND-06, FOUND-07, OPS-01           | —          | Test scaffolds exist for every requirement (RED until impl)                                                          | unit         | `pnpm exec vitest --run (expects RED)`                                                                                                                                                                                               | src/lib/env.test.ts; src/lib/storage/sqlite/{client,migrate,health-probe}.test.ts; src/app/api/health/route.test.ts; scripts/check-env-example.test.ts | ⬜ pending |
| 01-01-T3 | 01   | 0    | FOUND-01, FOUND-05, FOUND-07, OPS-01 | T-1-01     | Vercel-avoidance + standalone + dev-boot + docker e2e shell scripts exist                                            | static/smoke | `bash -n scripts/*.sh && bash scripts/check-no-vercel.sh`                                                                                                                                                                            | scripts/check-{dev-boot,standalone,no-vercel,docker-health}.sh                                                                                         | ⬜ pending |
| 01-02-T1 | 02   | 1    | FOUND-01, FOUND-04                   | —          | Three-way Node/pnpm pin + exact version pins; no premature deps                                                      | static       | `node -e parse package.json (see 01-02-PLAN verify block)`                                                                                                                                                                           | inline                                                                                                                                                 | ⬜ pending |
| 01-02-T2 | 02   | 1    | FOUND-04, FOUND-07                   | T-1-01     | ESLint 9 flat + Prettier + strict TS + .env.example documents runtime contract                                       | static       | `pnpm exec eslint --version && pnpm exec prettier --version && pnpm exec tsc --version && pnpm exec vitest --run scripts/check-env-example.test.ts`                                                                                  | scripts/check-env-example.test.ts                                                                                                                      | ⬜ pending |
| 01-02-T3 | 02   | 1    | FOUND-01, FOUND-05                   | —          | next.config.ts: output:standalone + build-time env injection; lang=nl layout; minimal page                           | smoke        | `pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm build && bash scripts/check-standalone.sh`                                                                                                                                     | scripts/check-standalone.sh                                                                                                                            | ⬜ pending |
| 01-03-T1 | 03   | 2    | FOUND-07                             | T-1-01     | Zod fail-fast env parser + pino logger                                                                               | unit         | `pnpm exec vitest --run src/lib/env.test.ts`                                                                                                                                                                                         | src/lib/env.test.ts                                                                                                                                    | ⬜ pending |
| 01-03-T2 | 03   | 2    | FOUND-06                             | T-1-03     | Migration runner with strict regex (path-traversal mitigation) + lazy memoized getDb                                 | unit         | `pnpm exec vitest --run src/lib/storage/sqlite/migrate.test.ts src/lib/storage/sqlite/client.test.ts`                                                                                                                                | src/lib/storage/sqlite/{migrate,client}.test.ts                                                                                                        | ⬜ pending |
| 01-03-T3 | 03   | 2    | FOUND-06                             | —          | Repo-per-domain async storage seam (HealthProbeRepo + sqlite impl + barrel)                                          | unit         | `pnpm exec vitest --run src/lib/storage/sqlite/health-probe.test.ts`                                                                                                                                                                 | src/lib/storage/sqlite/health-probe.test.ts                                                                                                            | ⬜ pending |
| 01-04-T1 | 04   | 3    | OPS-01                               | T-1-02     | /api/health 6-field contract; 200 happy / 503 degraded; nodejs runtime; force-dynamic                                | integration  | `pnpm exec vitest --run src/app/api/health/route.test.ts && pnpm build`                                                                                                                                                              | src/app/api/health/route.test.ts                                                                                                                       | ⬜ pending |
| 01-05-T1 | 05   | 4    | FOUND-05                             | T-1-04     | Multi-stage Alpine Dockerfile (deps+builder+runner) with native-binding gotchas resolved + USER nextjs + HEALTHCHECK | smoke        | `docker build -t datapraat:phase1-local . && bash scripts/check-docker-health.sh`                                                                                                                                                    | scripts/check-docker-health.sh                                                                                                                         | ⬜ pending |
| 01-05-T2 | 05   | 4    | FOUND-05, FOUND-07                   | T-1-01     | nixpacks.toml + railway.toml correct + full phase gate green                                                         | gate         | `pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm exec prettier --check . && pnpm exec vitest --run && pnpm build && bash scripts/check-standalone.sh && bash scripts/check-no-vercel.sh && bash scripts/check-docker-health.sh` | scripts/check-{standalone,no-vercel,docker-health}.sh                                                                                                  | ⬜ pending |
| 01-05-T3 | 05   | 4    | FOUND-05, OPS-01                     | T-1-02     | Railway public deploy returns /api/health 200 + db.ok=true (volume mount real)                                       | manual       | `MANUAL — see 01-VALIDATION Manual-Only Verifications table`                                                                                                                                                                         | —                                                                                                                                                      | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

Test framework + scripts that must land BEFORE the implementation waves:

- [ ] `vitest@^3` + `@vitest/ui` + `@types/node` installed; `vitest.config.ts` created
- [ ] `package.json` scripts: `test = "vitest"`, `test:ci = "vitest --run"`
- [ ] `src/lib/env.test.ts` — covers FOUND-07 (Zod schema rejects/accepts)
- [ ] `src/lib/storage/sqlite/client.test.ts` — covers FOUND-06 (lazy, memoized, opens at `:memory:` for tests)
- [ ] `src/lib/storage/sqlite/migrate.test.ts` — covers FOUND-06 (idempotent, applies in order)
- [ ] `src/lib/storage/sqlite/health-probe.test.ts` — covers FOUND-06 (record + read round-trip)
- [ ] `src/app/api/health/route.test.ts` — covers OPS-01 (200 happy, 503 degraded)
- [ ] `scripts/check-dev-boot.sh` — covers FOUND-01 (`pnpm dev` boots and serves /)
- [ ] `scripts/check-standalone.sh` — covers FOUND-05 (`.next/standalone/server.js` exists after build)
- [ ] `scripts/check-docker-health.sh` — covers FOUND-05 + OPS-01 end-to-end (docker run + curl /api/health)
- [ ] `scripts/check-env-example.test.ts` (vitest) — covers FOUND-07 (`.env.example` keys ⊇ Zod schema keys)
- [ ] `scripts/check-no-vercel.sh` — covers FOUND-07 (no `@vercel/*` imports, no `runtime = 'edge'`)

---

## Manual-Only Verifications

| Behavior                                                                                             | Requirement      | Why Manual                                                                             | Test Instructions                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First Railway deploy succeeds and `/api/health` returns 200 from the public URL                      | FOUND-05, OPS-01 | Requires Railway account + project + volume mount + push to remote — out-of-band of CI | 1. Push branch to GitHub. 2. Create Railway project linked to repo. 3. Add `/data` volume. 4. Deploy. 5. `curl https://<railway-url>/api/health` returns 200 with `db.ok: true`.                           |
| `RAILWAY_GIT_COMMIT_SHA` is the actual var Railway exposes (vs `RAILWAY_GIT_COMMIT_HASH` or similar) | OPS-01           | Variable naming has been renamed historically; verify on first deploy                  | After first Railway deploy, hit `/api/health` and confirm `commitSha` matches the deployed commit (not "unknown"). If "unknown", check Railway dashboard env vars and update `next.config.ts` accordingly. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references in the per-task map
- [ ] No watch-mode flags in any automated command (`--watch`, `--ui` forbidden in CI commands)
- [ ] Feedback latency < 10s per-task, < 60s per-wave
- [ ] `nyquist_compliant: true` set in frontmatter once planner has filled the per-task map and the plan-checker has verified coverage

**Approval:** planner-filled — awaits plan-checker review and execution
