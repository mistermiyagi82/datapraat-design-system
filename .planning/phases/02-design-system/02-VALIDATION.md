---
phase: 2
slug: design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 (Phase 1 pin) + jsdom 29.1.0 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` (extend Phase 1 config — add `test.environment: "jsdom"`, `test.globals: true`, `test.setupFiles: ["./vitest.setup.ts"]`) |
| **Quick run command** | `pnpm exec vitest --run src/lib/format src/components/design` (sub-30s feedback for Phase 2 tests) |
| **Full suite command** | `pnpm test:ci` (existing) |
| **Phase gate** | `pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm exec prettier --check . && pnpm test:ci && pnpm build && bash scripts/check-standalone.sh` |
| **Estimated runtime** | quick ~10–20s · full ~60–90s · phase gate ~2–3 min |

---

## Sampling Rate

- **After every task commit:** `pnpm exec vitest --run <files-touched>` (sub-30s)
- **After every plan wave:** `pnpm test:ci && pnpm exec tsc --noEmit && pnpm exec eslint .` (~60s)
- **Before `/gsd-verify-work`:** Full phase gate must be green
- **Max feedback latency:** 30s per-task, 90s per-wave

---

## Per-Task Verification Map

> Filled by the planner during PLAN.md authoring. Every task in every PLAN.md must have a row here, mapped to a Wave-0 test artifact OR an inline `<automated>` command. No 3 consecutive tasks may go without an automated verify.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _to be filled by planner_ | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test framework + scripts that must land BEFORE the implementation waves:

- [ ] `pnpm add -D @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1 jsdom@29.1.0 @vitejs/plugin-react@6.0.1`
- [ ] `vitest.config.ts` extended with `test.environment: "jsdom"`, `test.globals: true`, `test.setupFiles: ["./vitest.setup.ts"]`, and `@vitejs/plugin-react` in `plugins`
- [ ] `vitest.setup.ts` — imports `@testing-library/jest-dom/vitest`; registers `afterEach(cleanup)` from `@testing-library/react`
- [ ] `src/lib/format/index.test.ts` — covers DS-03a (4 helpers × 3 cases each: `fmtEUR`, `fmtNum`, `fmtPercent`, `fmtCompact`)
- [ ] `src/components/design/Icon.test.tsx` — covers DS-03b (every `IconName` renders without throwing; exports `IconName` literal union)
- [ ] `src/components/design/TrustBadge.test.tsx` — covers DS-03c (tier classes for scores 95 / 80 / 60)
- [ ] `src/components/design/AskButton.test.tsx` — covers DS-03d (sizes sm/md/lg; `e.stopPropagation` invoked on click)
- [ ] (Optional) `src/app/globals.css.test.ts` — string-presence regression net for the prototype `:root` token names (catches accidental deletions)
- [ ] (Optional) shadcn primitive snapshot tests in `src/components/ui/*.test.tsx` — one render-snapshot per primitive (button, card, input, dialog, dropdown-menu, tabs, tooltip, separator, sonner Toaster)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Side-by-side token swatch comparison vs prototype | FOUND-02, DS-01 (success criterion #1) | Pixel-fidelity check across 40+ tokens — automated visual diff is overkill for a one-shot reference; eyeball is faster and catches subtleties (warm-cool balance, tint contrast) | 1. `pnpm dev`. 2. Open `/internal/design#tokens` in one tab. 3. Open `Logos.html` in another tab (or the prototype `DataPraat.html` page rendering tokens). 4. Compare swatches column-by-column. 5. Take a screenshot of the new page; paste into VERIFICATION.md as evidence. |
| `pnpm dlx shadcn@latest add separator` works against the configured `base-vega` style | FOUND-03, DS-02 (success criterion #2) | The CLI is interactive on first run; documented in PLAN as a one-shot smoke check during execution | After `shadcn init` lands, run `pnpm dlx shadcn@latest add separator` — should exit 0, write `src/components/ui/separator.tsx`, no manual edit needed. |
| `/internal/design` renders all 6 sections without console errors | DS-04 (success criterion #4) | Visual + console correctness; no automated check substitutes for opening it | 1. `pnpm dev`. 2. Visit `http://localhost:3000/internal/design`. 3. Confirm 6 section anchors render (Tokens / Typography / Custom primitives / shadcn primitives / Trust legend / Format helpers). 4. Open browser devtools — no errors, no hydration warnings. 5. Click a Dialog trigger, a Dropdown trigger, a Tabs trigger — all open without errors. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references in the per-task map
- [ ] No watch-mode flags (`--watch`, `--ui`) in any automated command
- [ ] Feedback latency < 30s per-task, < 90s per-wave
- [ ] `nyquist_compliant: true` set in frontmatter once planner has filled the per-task map and the plan-checker has verified coverage

**Approval:** pending
