#!/usr/bin/env bash
# FOUND-05 + OPS-01: docker image builds, runs, and /api/health returns 200
set -euo pipefail

IMAGE="datapraat:phase1-test"
CONTAINER="datapraat-phase1-test"
HOST_DATA_DIR="$(pwd)/.data-docker-test"
PORT=3001

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  rm -rf "$HOST_DATA_DIR" 2>/dev/null || true
}
trap cleanup EXIT

mkdir -p "$HOST_DATA_DIR"

echo "→ Building docker image $IMAGE …"
docker build -t "$IMAGE" .

echo "→ Running container on port $PORT (volume: $HOST_DATA_DIR → /data) …"
docker run -d --name "$CONTAINER" \
  -p "${PORT}:3000" \
  -v "${HOST_DATA_DIR}:/data" \
  "$IMAGE"

# Wait up to 30s for /api/health
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${PORT}/api/health" > /tmp/datapraat-health.json 2>/dev/null; then
    STATUS=$(node -pe "require('/tmp/datapraat-health.json').status" 2>/dev/null || echo "parse-error")
    if [ "$STATUS" = "ok" ]; then
      echo "✓ /api/health returned 200 with status=ok"
      cat /tmp/datapraat-health.json
      exit 0
    fi
  fi
  sleep 1
done

echo "✗ /api/health did not return ok within 30s"
docker logs "$CONTAINER" | tail -50
exit 1
