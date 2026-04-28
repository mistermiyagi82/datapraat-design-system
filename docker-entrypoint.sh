#!/bin/sh
set -e

# Railway (and other platforms) mount volumes as root by default.
# Phase 1 D-07 puts the sqlite file at $DB_PATH (default /data/datapraat.sqlite).
# Chown the parent dir as root before dropping to the non-root app user.
DATA_DIR="$(dirname "${DB_PATH:-/data/datapraat.sqlite}")"
if [ -d "$DATA_DIR" ]; then
  chown -R nextjs:nodejs "$DATA_DIR" 2>/dev/null || true
fi

exec su-exec nextjs:nodejs "$@"
