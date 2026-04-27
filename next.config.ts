// next.config.ts
// Sources: CONTEXT.md D-12 (build-info), D-15 (standalone) + Next.js docs.
import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import path from "node:path";

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

  // Pin the workspace root to this project. Without this, Next.js may infer
  // a parent directory (e.g. when an unrelated package-lock.json exists higher
  // in the tree) and emit `.next/standalone/<deep>/server.js`, breaking the
  // FOUND-05 standalone contract. Anchoring to __dirname keeps the standalone
  // tree at `.next/standalone/server.js`.
  outputFileTracingRoot: path.join(__dirname),

  // Build-time env injection — CONTEXT.md D-12.
  // NEXT_PUBLIC_* vars are inlined into the bundle at build time.
  env: {
    NEXT_PUBLIC_COMMIT_SHA: gitSha(),
    BUILD_TIME: new Date().toISOString(),
  },

  // better-sqlite3 is in Next.js 15's built-in serverExternalPackages allowlist;
  // no manual config needed. Documented here for future maintainers.
  // serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
