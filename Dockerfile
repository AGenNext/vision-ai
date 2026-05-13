FROM oven/bun:1.1-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN bun run typecheck
RUN bun run build

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1
CMD ["bun", "run", "dist/index.js"]
