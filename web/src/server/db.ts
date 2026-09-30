import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/*
 * Um único PrismaClient por processo, criado só no PRIMEIRO USO.
 *
 * ⚠️ Preguiçoso de propósito. O `next build` importa os módulos das rotas
 * para coletar configuração, e no build da imagem Docker não existe banco
 * nem DATABASE_URL. Criando o cliente na importação, o build quebrava antes
 * de qualquer consulta acontecer.
 *
 * ⚠️ Em desenvolvimento o Next recarrega os módulos a cada edição. Sem guardar
 * a instância no `globalThis`, cada recarga abriria um pool de conexões novo e
 * o antigo ficaria vivo, e em poucos minutos o Postgres recusa conexão por
 * limite atingido.
 *
 * O `server-only` no topo faz o build QUEBRAR se algum Client Component
 * importar este arquivo, em vez de tentar mandar a string de conexão do banco
 * para o navegador.
 */
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function obterCliente(): PrismaClient {
  if (globalParaPrisma.prisma) return globalParaPrisma.prisma;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida. Veja web/.env.example.");

  // O Prisma 7 exige um driver adapter: a conexão é do `pg`, e o Prisma
  // conversa com o banco através dele.
  const cliente = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  globalParaPrisma.prisma = cliente;
  return cliente;
}

/**
 * Use como um PrismaClient comum (`db.animal.findMany(...)`). Por baixo, cada
 * acesso passa por `obterCliente()`, e a conexão só nasce na primeira consulta.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_alvo, propriedade) {
    const cliente = obterCliente();
    const valor = Reflect.get(cliente, propriedade, cliente);
    // Métodos como `$transaction` dependem do `this` certo.
    return typeof valor === "function" ? valor.bind(cliente) : valor;
  },
});
