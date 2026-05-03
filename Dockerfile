# ─────────────────────────────────────────────────────────────────────────────
# This Dockerfile uses a pre-built frontend dist folder.
# Run: cd Frontend && npm run build   BEFORE deploying.
# The Frontend/dist folder is copied directly into the image.
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build Node.js backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY Backend/tsconfig.json ./
COPY Backend/src ./src
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production backend dependencies
COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy pre-built React frontend (built locally before docker deploy)
COPY Frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/index.js"]
