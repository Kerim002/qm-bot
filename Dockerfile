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
COPY .env .
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

# Copy .env from builder (so dotenv can load it at runtime)
COPY --from=builder /app/.env .

# Start bot
CMD ["node", "dist/index.js"]