# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---- Build ----
FROM deps AS build
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
COPY . .
RUN npm run build

# ---- Production dependencies apenas ----
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]