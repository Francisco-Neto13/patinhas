# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `npm run build` roda `prisma generate` antes do `next build`: o client do
# Prisma é gerado a partir do schema e nunca vai para o git.
RUN npm run build

# ---------------------------------------------------------------------------
# Migrations. Roda uma vez a cada deploy, ANTES da aplicação subir (o compose
# espera este serviço terminar com sucesso). Fica num estágio próprio porque a
# imagem final, standalone, não carrega a CLI do Prisma.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Script do primeiro administrador. Usa só `pg`, que já vem no standalone.
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Pasta dos uploads, onde o volume é montado. Criada aqui, com o dono certo:
# um volume novo herda as permissões da pasta da imagem, e sem isto o usuário
# `nextjs` não conseguiria gravar as fotos.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
ENV UPLOADS_DIR=/app/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
