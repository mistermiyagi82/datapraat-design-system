# Source: Next.js official with-docker template + better-sqlite3 docs/compilation.md
# + RESEARCH.md Pattern (Three native-binding gotchas resolved)

# ---------- deps stage ----------
FROM node:22-alpine AS deps
# Native bindings require these. Critical for better-sqlite3 — do NOT skip.
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Enable Corepack so the pinned pnpm version installs automatically
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY package.json pnpm-lock.yaml ./
# --frozen-lockfile = CI mode, refuse to modify the lockfile
RUN pnpm install --frozen-lockfile

# ---------- builder stage ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env that next.config.ts reads (RAILWAY_GIT_COMMIT_SHA is injected by Railway)
ARG RAILWAY_GIT_COMMIT_SHA
ENV RAILWAY_GIT_COMMIT_SHA=${RAILWAY_GIT_COMMIT_SHA}

RUN pnpm build

# ---------- runner stage ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# better-sqlite3 native binding needs libc6-compat at runtime on Alpine.
# su-exec drops privileges in the entrypoint so we can chown the volume mount as root
# and then run the app as a non-root user (Railway bind-mounts are root-owned by default).
RUN apk add --no-cache libc6-compat su-exec

# Non-root user (CONTEXT.md D-15)
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone server + static + public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# CRITICAL: copy migration SQL files into runner — standalone tracing doesn't include
# non-imported files, and runMigrations reads them via fs.readFileSync.
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/storage/sqlite/migrations ./src/lib/storage/sqlite/migrations

# Entrypoint: chown the data volume as root, then drop to nextjs.
# Railway mounts volumes at the configured mount path with root ownership, so the
# non-root app user cannot write to /data without this shim. The local docker-compose
# scenario (host-bound /data dir) doesn't hit this because the host owns the directory.
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Healthcheck per CONTEXT.md D-15 (consumed by Docker, Azure Container Apps, etc.)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
