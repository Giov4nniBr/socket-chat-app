# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app

# ---- Dependencies (todas, incluindo dev, para build) ----
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ---- Build ----
FROM deps AS build
COPY . .
# gera o Prisma Client (precisa do schema.prisma copiado acima)
RUN npx prisma generate
RUN npm run build

# ---- Production dependencies apenas ----
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3333

CMD ["node", "dist/server.js"]