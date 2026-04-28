# Phase 02 — Deferred Items

Items discovered during Plan 02-04 execution that are out of scope for this plan.

## Pre-existing prettier non-compliance in `.planning/*` files (16 files)

`pnpm exec prettier --check .` flags 16 `.planning/*` files as needing formatting. These were modified externally (planner / orchestrator edits during phase iteration) and not formatted on save. Out of scope for Plan 02-04 (which owns only `src/app/internal/design/*` + `src/components/ui/*` + Toaster mount). Files affected:

- `.planning/config.json`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/01-foundation/01-05-SUMMARY.md`
- `.planning/phases/01-foundation/01-REVIEW.md`
- `.planning/phases/01-foundation/01-VERIFICATION.md`
- `.planning/phases/02-design-system/02-01-PLAN.md`
- `.planning/phases/02-design-system/02-02-PLAN.md`
- `.planning/phases/02-design-system/02-02-SUMMARY.md`
- `.planning/phases/02-design-system/02-03-PLAN.md`
- `.planning/phases/02-design-system/02-03-SUMMARY.md`
- `.planning/phases/02-design-system/02-04-PLAN.md`
- `.planning/phases/02-design-system/02-CONTEXT.md`
- `.planning/phases/02-design-system/02-DISCUSSION-LOG.md`
- `.planning/phases/02-design-system/02-RESEARCH.md`
- `.planning/phases/02-design-system/02-VALIDATION.md`

**Resolution:** A future ops/cleanup pass should either (a) run `pnpm exec prettier --write .planning/` once and commit, or (b) add `.planning/**/*.md` to `.prettierignore` if planning prose shouldn't be reformatted. Recommend (b) — markdown reflow can hurt manual structure.

## Pre-existing in-scope source: `src/lib/utils.ts` (resolved during Plan 02-04)

`src/lib/utils.ts` (created in Plan 02-02) was missing trailing semicolons that prettier expects. Plan 02's SUMMARY claimed prettier passed but only ran narrow checks (`prettier --check src/app/globals.css src/lib/format/index.ts`). Plan 02-04 fixed this in passing as a Rule-1 cleanup since it's in-scope project source.
