---
phase: 2
slug: design-system
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-28
last_updated: 2026-04-28
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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 0 | DS-03 | T-2-02 | Exact-pin supply chain (5 dev deps) | inline | `node -e "const p=require('./package.json').devDependencies; ...mismatched-pin check..."` | n/a (inline) | ⬜ pending |
| 02-01-T2 | 01 | 0 | DS-03 | — | jsdom env wired; jest-dom matchers register | inline | `grep + pnpm test:ci` (Phase 1 GREEN) | vitest.config.ts, vitest.setup.ts | ⬜ pending |
| 02-01-T3 | 01 | 0 | DS-03 | — | RED test scaffolds exist & fail import-resolution | inline | `pnpm exec vitest --run src/lib/format src/components/design` (expect non-zero exit, "Cannot find module" / "Failed to resolve") | 4 RED test files | ⬜ pending |
| 02-02-T1 | 02 | 1 | FOUND-03 | T-2-02 | shadcn init writes components.json + cn(); @tabler pinned exact | inline | `grep "base-vega" components.json && grep "twMerge" src/lib/utils.ts && pin-check @tabler/icons-react==3.41.1` | components.json, src/lib/utils.ts | ⬜ pending |
| 02-02-T2 | 02 | 1 | FOUND-02, DS-01 | T-2-04 | globals.css 4-layer skeleton with hex pins + 8 sidebar aliases; no oklch | inline | `grep "#5E5A53|#4338CA|#3b82f6|--sidebar:|--sidebar-ring:|@theme inline" + ! grep "oklch|prefers-color-scheme" + pnpm build` | src/app/globals.css | ⬜ pending |
| 02-02-T3 | 02 | 1 | FOUND-02, DS-03 | T-2-03 | next/font self-hosts 3 fonts with CSS vars + Dutch latin-ext | inline | `grep "Inter\|Fraunces\|JetBrains_Mono\|axes:.*opsz\|--font-sans" src/app/layout.tsx && pnpm build` | src/app/layout.tsx | ⬜ pending |
| 02-02-T4 | 02 | 1 | DS-03 | — | 4 fmt helpers; tree-shakable named exports; no default export | unit | `pnpm exec vitest --run src/lib/format/index.test.ts` (12 GREEN) | src/lib/format/index.ts + .test.ts | ⬜ pending |
| 02-03-T1 | 03 | 2 | DS-03 | — | Icon: 24-name IconName union + Record exhaustiveness + viewBox 16x16 + stroke 1.5 | unit | `pnpm exec vitest --run src/components/design/Icon.test.tsx` + tsc | src/components/design/Icon.tsx | ⬜ pending |
| 02-03-T2 | 03 | 2 | DS-03 | T-2-04, T-2-05 | TrustBadge tier 90/70 formula; AskButton "Vraag hierover" + 3 sizes + type="button" + stopPropagation | unit | `pnpm exec vitest --run src/components/design/TrustBadge.test.tsx src/components/design/AskButton.test.tsx` | TrustBadge.tsx + AskButton.tsx | ⬜ pending |
| 02-03-T3 | 03 | 2 | DS-03 | — | Barrel exports exactly 3 primitives + types; no placeholders | inline | `pnpm exec vitest --run src/components/design && pnpm test:ci && pnpm build && bash scripts/check-standalone.sh` | src/components/design/index.ts | ⬜ pending |
| 02-04-T1 | 04 | 3 | FOUND-03, DS-02 | T-2-02 | 9 shadcn primitives (sonner replaces toast) installed + Toaster mounted | inline | `for-each ui/*.tsx exists + grep Toaster src/app/layout.tsx + ! grep react-toast package.json + pnpm build` | 9 ui/*.tsx + layout.tsx | ⬜ pending |
| 02-04-T2 | 04 | 3 | DS-04 | T-2-01 | /internal/design server component + 6 anchor IDs + ClientPreview island; "Internal reference" banner | inline | `grep id="tokens"..."format" + grep "use client" client-preview.tsx + ! grep "use client" page.tsx + pnpm build (mentions /internal/design)` | page.tsx + client-preview.tsx | ⬜ pending |
| 02-04-T3 | 04 | 3 | FOUND-02, FOUND-03, DS-01, DS-02, DS-03, DS-04 | T-2-01 | Manual side-by-side token comparison + interactive primitive smoke + console-clean | manual + phase-gate | `pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm exec prettier --check . && pnpm test:ci && pnpm build && bash scripts/check-standalone.sh` (after human approves) | screenshot pair captured | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity check:** No 3 consecutive tasks lack an automated verify — every task above has either a Wave-0 RTL test reference, an inline grep/build assertion, or the phase-gate command. The sole manual-only step (Task 02-04-T3 visual side-by-side) is paired with the full phase-gate command.

---

## Wave 0 Requirements

Test framework + scripts that must land BEFORE the implementation waves:

- [ ] `pnpm add -D @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1 jsdom@29.1.0 @vitejs/plugin-react@6.0.1` (Plan 01 Task 1)
- [ ] `vitest.config.ts` extended with `test.environment: "jsdom"`, `test.globals: true`, `test.setupFiles: ["./vitest.setup.ts"]`, and `@vitejs/plugin-react` in `plugins` (Plan 01 Task 2)
- [ ] `vitest.setup.ts` — imports `@testing-library/jest-dom/vitest`; registers `afterEach(cleanup)` from `@testing-library/react` (Plan 01 Task 2)
- [ ] `src/lib/format/index.test.ts` — covers DS-03a (4 helpers × 3 cases each: `fmtEUR`, `fmtNum`, `fmtPercent`, `fmtCompact`) (Plan 01 Task 3)
- [ ] `src/components/design/Icon.test.tsx` — covers DS-03b (every `IconName` renders without throwing; exports `IconName` literal union) (Plan 01 Task 3)
- [ ] `src/components/design/TrustBadge.test.tsx` — covers DS-03c (tier classes for scores 95 / 80 / 60) (Plan 01 Task 3)
- [ ] `src/components/design/AskButton.test.tsx` — covers DS-03d (sizes sm/md/lg; `e.stopPropagation` invoked on click) (Plan 01 Task 3)
- [ ] (Optional) `src/app/globals.css.test.ts` — string-presence regression net for the prototype `:root` token names — DEFERRED; covered by Plan 02 Task 2's grep-based acceptance instead.
- [ ] (Optional) shadcn primitive snapshot tests — DEFERRED; covered by Plan 04 Task 1's grep + `pnpm build` round-trip and the human-verify checkpoint in Plan 04 Task 3.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Owner |
|----------|-------------|------------|-------------------|-------|
| Side-by-side token swatch comparison vs prototype | FOUND-02, DS-01 (success criterion #1) | Pixel-fidelity check across 40+ tokens — automated visual diff is overkill for a one-shot reference; eyeball is faster and catches subtleties (warm-cool balance, tint contrast) | 1. `pnpm dev`. 2. Open `/internal/design#tokens` in one tab. 3. Open `Logos.html` in another tab. 4. Compare swatches column-by-column. 5. Take a screenshot of the new page; paste into VERIFICATION.md as evidence. | Plan 04 Task 3 |
| `pnpm dlx shadcn@latest add separator` works against the configured `base-vega` style | FOUND-03, DS-02 (success criterion #2) | The CLI smoke is implicit in Plan 04 Task 1 — running `shadcn add button card input ... separator sonner` IS the smoke check; if it fails, Task 1 fails its acceptance gate. | Plan 04 Task 1 acceptance: all 9 `src/components/ui/*.tsx` files exist after one CLI run. | Plan 04 Task 1 |
| `/internal/design` renders all 6 sections without console errors | DS-04 (success criterion #4) | Visual + console correctness; no automated check substitutes for opening it | 1. `pnpm dev`. 2. Visit `http://localhost:3000/internal/design`. 3. Confirm 6 section anchors render. 4. Open browser devtools — no errors, no hydration warnings. 5. Click Dialog/Dropdown/Tabs/Tooltip/Sonner triggers. | Plan 04 Task 3 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (Per-Task Verification Map populated above)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (verified — every implementation task has inline/unit/build automation; Plan 04 Task 3 manual step is paired with the full phase-gate)
- [x] Wave 0 covers all MISSING references in the per-task map (4 RED test files cover DS-03a/b/c/d; Plan 02+03 turn them GREEN)
- [x] No watch-mode flags (`--watch`, `--ui`) in any automated command
- [x] Feedback latency < 30s per-task, < 90s per-wave (vitest sub-suites stay under 30s; phase gate ~2-3min only at plan boundary)
- [x] `nyquist_compliant: true` set in frontmatter — planner has filled the per-task map; ready for plan-checker review.

**Approval:** ready-for-checker
