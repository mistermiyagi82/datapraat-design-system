#!/usr/bin/env bash
# FOUND-07: no Vercel-only API imports, no edge runtime, no hardcoded secrets
set -euo pipefail

FAIL=0

# 1. No @vercel/* SDK imports
if grep -rE "from ['\"]@vercel/(kv|blob|postgres|edge-config)" src/ 2>/dev/null; then
  echo "✗ Found @vercel/* SDK import — forbidden per FOUND-07"
  FAIL=1
fi

# 2. No next/og imports (Vercel-tied OG image renderer)
if grep -rE "from ['\"]next/og" src/ 2>/dev/null; then
  echo "✗ Found next/og import — forbidden per FOUND-07"
  FAIL=1
fi

# 3. No edge runtime exports
if grep -rE "runtime\s*[:=]\s*['\"]edge['\"]" src/ 2>/dev/null; then
  echo "✗ Found edge runtime export — incompatible with better-sqlite3 + violates FOUND-07"
  FAIL=1
fi

# 4. No obvious hardcoded API keys (sk-, pk_live_, etc.)
if grep -rE "sk-[a-zA-Z0-9]{20,}|pk_live_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}" src/ 2>/dev/null; then
  echo "✗ Found what looks like a hardcoded API key/secret"
  FAIL=1
fi

if [ "$FAIL" -eq 0 ]; then
  echo "✓ No Vercel-only APIs, no edge runtime, no obvious hardcoded secrets in src/"
fi
exit "$FAIL"
