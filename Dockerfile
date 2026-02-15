# ── Stage 1: Base ────────────────────────────────────────────────
FROM node:22-alpine AS base

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Native dependencies required by the "canvas" npm package
# fontconfig + font-noto = text rendering in generated images
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    giflib-dev \
    libjpeg-turbo-dev \
    librsvg-dev \
    pixman-dev \
    fontconfig \
    font-noto \
    python3 \
    g++ \
    make

WORKDIR /app

# ── Stage 2: Install dependencies ───────────────────────────────
FROM base AS deps

# Copy workspace config & lockfile first (layer caching)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/
COPY apps/web/pnpm-workspace.yaml apps/web/

RUN pnpm install --frozen-lockfile

# ── Stage 3: Build ───────────────────────────────────────────────
FROM deps AS build

# Copy source code
COPY packages/core/ packages/core/
COPY apps/web/ apps/web/
COPY tsconfig.json ./

# Build @qr/core first, then Nuxt app
RUN pnpm --filter @qr/core build && \
    pnpm --filter @qr/web build

# ── Stage 4: Production ─────────────────────────────────────────
FROM base AS production

WORKDIR /app

# Copy the self-contained Nitro output
COPY --from=build /app/apps/web/.output .output/

# canvas & qr-code-styling-node are externalized in Nitro (rollupConfig.external)
# and NOT bundled into .output – install them with their transitive deps
RUN npm install --omit=dev canvas@3 pdfkit@0 qr-code-styling-node@1 && \
    # Remove build tools to shrink the image
    apk del python3 g++ make && \
    rm -rf /root/.npm /tmp/*

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

# Ensure externalized modules are found
ENV NODE_PATH=/app/node_modules
CMD ["node", ".output/server/index.mjs"]
