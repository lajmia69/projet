# Stage 1: Dependencies
#FROM node:22-alpine AS deps
#RUN apk add --no-cache libc6-compat
#WORKDIR /app
#COPY package.json ./
#RUN npm install -g npm@11.16.0
#RUN npm install --force

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
#COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g npm@11.16.0
RUN npm install
RUN npm run build

# Stage 3: Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ARG APP_PORT=${APP_PORT}
ARG NODE_ENV=${NODE_ENV}
ARG NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ARG AUTH_SECRET=${AUTH_SECRET}
ARG AUTH_URL=${AUTH_URL}

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
ENV PORT=${APP_PORT}
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV AUTH_URL=${AUTH_URL}

EXPOSE ${APP_PORT}
CMD ["node", "server.js"]
