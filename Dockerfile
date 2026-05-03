# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./

# Hardcode Firebase config for production build
ENV VITE_FIREBASE_API_KEY=AIzaSyAeLkXjD7asvDOkyHPSWlFEEwuoX96X-a8
ENV VITE_FIREBASE_AUTH_DOMAIN=virtualpromptwars-eb2fd.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=virtualpromptwars-eb2fd
ENV VITE_FIREBASE_STORAGE_BUCKET=virtualpromptwars-eb2fd.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=956621523535
ENV VITE_FIREBASE_APP_ID=1:956621523535:web:57aac2b2904a116d13f83a
ENV VITE_FIREBASE_MEASUREMENT_ID=G-GXPV32BCCE
ENV VITE_API_URL=/api

RUN npm run build

# Stage 2: Build Node.js backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY Backend/package*.json ./
RUN npm ci

COPY Backend/tsconfig.json ./
COPY Backend/src ./src
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=frontend-builder /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/index.js"]
