#!/usr/bin/env bash
# FOUND-05: production build produces output: 'standalone'
set -euo pipefail

if [ ! -f .next/standalone/server.js ]; then
  echo "✗ .next/standalone/server.js not found. Did you run pnpm build with output: 'standalone'?"
  echo "  Check next.config.ts contains: output: 'standalone'"
  exit 1
fi

echo "✓ .next/standalone/server.js exists"
