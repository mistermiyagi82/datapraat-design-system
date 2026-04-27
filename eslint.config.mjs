// ESLint 9 flat config with FlatCompat bridge for eslint-config-next.
// Source: github.com/vercel/next.js/discussions/71806 (canonical pattern from
// Next.js maintainers). eslint-config-next 15.5.x still ships eslintrc-format
// only; FlatCompat is the documented bridge until Next ships native flat config.
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
      // Project-specific overrides — none in Phase 1.
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".data/**",
      "out/**",
      "next-env.d.ts",
      // Prototype files at repo root (per CLAUDE.md, leave untouched).
      "*.html",
      "*.jsx",
      "data.js",
      "styles.css",
      "design-canvas.jsx",
    ],
  },
];
