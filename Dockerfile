# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./

RUN npm install --network-timeout 300000

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm build

# Stage 3: Runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV="production" \
    NEXT_PUBLIC_BASE_URL="https://radio.backend.ecocloud.tn" \
    AUTH_SECRET="s55T4WnE0XHfkljb+Hqvib2M4QR4uETFP/R9vv0QwMo" \
    AUTH_URL="https://radio.frontend.ecocloud.tn"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
