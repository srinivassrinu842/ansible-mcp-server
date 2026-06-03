# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Run as non-root user
USER node

# We use stdio, so no port needs to be exposed
ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
