# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Prisma needs OpenSSL 3 on Debian (Render-compatible glibc image)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Install dependencies. `npm install` (not `npm ci`) is used because the
# project is developed with pnpm, so package-lock.json may be out of sync.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Generate Prisma client (debian-openssl-3.0.x engine) then build Nuxt
RUN npx prisma generate
RUN npm run build

# ---- Runtime stage ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV PORT=3000

# Built server + full node_modules (Prisma engines must stay on disk, not bundled)
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY scripts/start-production.sh ./start-production.sh
RUN chmod +x ./start-production.sh

EXPOSE 3000

CMD ["./start-production.sh"]
