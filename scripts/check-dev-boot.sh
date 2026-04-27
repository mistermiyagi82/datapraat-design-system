#!/usr/bin/env bash
# FOUND-01: pnpm dev boots Next.js and serves /
set -euo pipefail

PORT="${PORT:-3000}"

# Start dev server in background
pnpm dev > /tmp/datapraat-dev.log 2>&1 &
DEV_PID=$!

cleanup() { kill "$DEV_PID" 2>/dev/null || true; }
trap cleanup EXIT

# Wait up to 30s for the server to respond
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${PORT}/" > /dev/null 2>&1; then
    echo "✓ pnpm dev boots and serves / on port ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "✗ pnpm dev failed to respond on port ${PORT} within 30s"
echo "--- dev log tail ---"
tail -50 /tmp/datapraat-dev.log
exit 1
