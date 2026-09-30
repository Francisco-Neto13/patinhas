/*
 * Nome do cookie de sessão em arquivo próprio, sem nenhum import.
 *
 * O `proxy.ts` precisa dele, e importar de `sessao.ts` arrastaria junto o
 * Prisma, o `server-only` e o `next/headers` para dentro do proxy, que roda
 * antes de toda requisição do /admin e deve ser o mais leve possível.
 */
export const NOME_COOKIE = "patinhas_sessao";
