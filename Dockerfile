# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Prisma needs OpenSSL to download/run its query engine
RUN apk add --no-cache openssl

# Install dependencies. `npm install` (not `npm ci`) is used because the
# project is developed with pnpm, so package-lock.json may be out of sync.
# This resolves from package.json and won't hard-fail on a stale lockfile.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Generate the Prisma client then build Nuxt
RUN npx prisma generate
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV PORT=3000

# Copy the built server, dependencies (incl. generated Prisma client),
# and the prisma schema/migrations needed for `migrate deploy` at startup.
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY scripts/start-production.sh ./start-production.sh
RUN chmod +x ./start-production.sh

EXPOSE 3000

# Migrate (with P3009 auto-recovery), then start the Nuxt/Nitro server.
CMD ["./start-production.sh"]
