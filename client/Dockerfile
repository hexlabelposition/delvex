# Dependencies stage
FROM oven/bun:1.3.14-alpine AS dependencies

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build stage
FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Standalone output does not include public assets, so the runner copies the
# directory explicitly. Create it here to keep that copy valid while the
# client has no static files of its own.
RUN mkdir -p public

# Declared after COPY so that changing the URL does not invalidate the
# source layer. Next.js embeds NEXT_PUBLIC_ values into the browser bundle
# during the build, so this cannot be supplied at container runtime.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

RUN test -n "$NEXT_PUBLIC_API_URL" \
    || (echo "NEXT_PUBLIC_API_URL build argument is required" >&2; exit 1)
RUN test -n "$NEXT_PUBLIC_SITE_URL" \
    || (echo "NEXT_PUBLIC_SITE_URL build argument is required" >&2; exit 1)
RUN bun run build

# Run stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
