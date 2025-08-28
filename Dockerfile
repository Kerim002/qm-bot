# -------------------------
# 1) Build stage (TypeScript -> JS)
# -------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# -------------------------
# 2) Runtime stage
# -------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built JS from builder
COPY --from=builder /app/dist ./dist

# Create data directory (no ownership change needed; will rely on Docker volume)
RUN mkdir -p /app/data

# Run as non-root
USER node

# Environment
ENV NODE_ENV=production \
    ACTIVE_BOTS_FILE=/app/data/active-bots.json

# Start bot
CMD ["node", "dist/index.js"]
