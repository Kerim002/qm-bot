# -------------------------
# 1) Build stage (TypeScript -> JS)
# -------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (use npm ci for clean, reproducible installs)
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# -------------------------
# 2) Runtime stage (small, prod-only deps)
# -------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Keep container lean: only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built JS
COPY --from=builder /app/dist ./dist

# Create data dir for persistent files (mounted by compose)
RUN mkdir -p /app/data && chown -R node:node /app

# Run as non-root user
USER node

# Default envs (can be overridden via docker-compose/.env)
ENV NODE_ENV=production \
    ACTIVE_BOTS_FILE=/app/data/active-bots.json

# No ports needed; this is a worker/bot
CMD ["node", "dist/index.js"]
