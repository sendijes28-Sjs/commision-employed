# Stage 1: Build base
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

# DOCKER-1: Install Python for OCR subprocess
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip curl && \
    rm -rf /var/lib/apt/lists/*

# Only copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/knexfile.js ./
COPY --from=builder /app/server/migrations ./server/migrations
COPY --from=builder /app/server/seeds ./server/seeds

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 4000
ENV NODE_ENV=production

# DOCKER-2: Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Startup script to handle migrations before starting the app
CMD ["sh", "-c", "npm run migrate:prod && node dist/server/index.js"]
