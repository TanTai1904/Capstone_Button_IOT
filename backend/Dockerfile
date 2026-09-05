FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

# Fallback DATABASE_URL so prisma generate succeeds during build
ENV DATABASE_URL="postgresql://smartorder:smartorder@localhost:5432/smart_order_db?schema=public"

RUN npm ci
RUN npx prisma generate --schema=prisma/schema.postgresql.prisma

COPY src ./src
RUN npm run build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target ES2021 --esModuleInterop --skipLibCheck || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
