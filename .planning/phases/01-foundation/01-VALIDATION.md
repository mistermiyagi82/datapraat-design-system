---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x (installed in Wave 0; no framework today) |
| **Config file** | `vitest.config.ts` (Wave 0) |
| **Quick run command** | `pnpm exec tsc --noEmit && pnpm exec eslint .` (~5–10s) |
| **Full suite command** | `pnpm test --run && pnpm lint && pnpm exec prettier --check . && pnpm build` (~60s) |
| **Estimated runtime** | quick ~10s · full ~60s · phase gate (incl. docker) ~3–5 min |

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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _to be filled by planner_ | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| First Railway deploy succeeds and `/api/health` returns 200 from the public URL | FOUND-05, OPS-01 | Requires Railway account + project + volume mount + push to remote — out-of-band of CI | 1. Push branch to GitHub. 2. Create Railway project linked to repo. 3. Add `/data` volume. 4. Deploy. 5. `curl https://<railway-url>/api/health` returns 200 with `db.ok: true`. |
| `RAILWAY_GIT_COMMIT_SHA` is the actual var Railway exposes (vs `RAILWAY_GIT_COMMIT_HASH` or similar) | OPS-01 | Variable naming has been renamed historically; verify on first deploy | After first Railway deploy, hit `/api/health` and confirm `commitSha` matches the deployed commit (not "unknown"). If "unknown", check Railway dashboard env vars and update `next.config.ts` accordingly. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references in the per-task map
- [ ] No watch-mode flags in any automated command (`--watch`, `--ui` forbidden in CI commands)
- [ ] Feedback latency < 10s per-task, < 60s per-wave
- [ ] `nyquist_compliant: true` set in frontmatter once planner has filled the per-task map and the plan-checker has verified coverage

**Approval:** pending
