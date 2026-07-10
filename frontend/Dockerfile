# syntax=docker/dockerfile:1

# ---- deps: ставим зависимости по lockfile ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: сборка Next в standalone ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* и назначение rewrite вшиваются на этапе build,
# поэтому адреса приходят build-аргументами (см. docker-compose роли website).
ARG NEXT_PUBLIC_API_URL=""
ARG INTERNAL_API_URL="http://localhost:8000"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner: минимальный образ на standalone-выводе ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js генерируется Next при output: "standalone"
CMD ["node", "server.js"]
