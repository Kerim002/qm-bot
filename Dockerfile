# 1️⃣ Base image
FROM node:20-alpine AS builder

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy only package.json & package-lock.json first (better caching)
COPY package*.json tsconfig.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy source code
COPY . .

# 6️⃣ Build TypeScript
RUN npm run build


# --- Production image ---
FROM node:20-alpine

WORKDIR /app

# 7️⃣ Copy built files and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# 8️⃣ Start app
CMD ["node", "dist/index.js"]
