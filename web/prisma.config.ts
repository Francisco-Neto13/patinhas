// A CLI do Prisma 7 nao carrega mais o .env sozinha: sem esta linha,
// `prisma migrate` roda com DATABASE_URL indefinida. O Next continua
// carregando o .env por conta propria em tempo de execucao.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    /*
     * ⚠️ `process.env`, e NAO o helper `env()` do Prisma.
     *
     * O `env()` e estrito: sem a variavel ele derruba a CLI inteira, inclusive
     * o `prisma generate`, que so le o schema e nem encosta no banco. No build
     * da imagem Docker nao existe .env (e nao deve existir), entao o build
     * quebrava. Os comandos que precisam mesmo do banco (`migrate`) acusam a
     * falta da URL por conta propria.
     */
    url: process.env.DATABASE_URL,
  },
});
