# ==========================================
# Multi-stage Dockerfile for Google Cloud Run
# Builds React Vite client & Express backend
# ==========================================

# Stage 1: Build Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY client/package*.json ./client/
COPY shared/ ./shared/
WORKDIR /app/client
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY server/package*.json ./server/
COPY shared/ ./shared/
WORKDIR /app/server
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./dist
# Copy shared code
COPY --from=server-builder /app/shared ../shared
# Copy compiled frontend client
COPY --from=client-builder /app/client/dist ../client/dist

WORKDIR /app
EXPOSE 8080

CMD ["node", "server/dist/server/src/index.js"]
