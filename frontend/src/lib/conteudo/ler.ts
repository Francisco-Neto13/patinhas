import "server-only";

import { cache } from "react";
import { db } from "@/lib/db";
import { PADROES } from "@/lib/conteudo/campos";

export type Textos = Record<string, string>;

/**
 * Todos os textos editáveis, já com o padrão aplicado onde ninguém mexeu.
 *
 * Memorizado por requisição: o topo, o rodapé e cada seção leem daqui, e o
 * banco é consultado uma vez só.
 */
export const obterTextos = cache(async (): Promise<Textos> => {
  try {
    const salvos = await db.conteudo.findMany({ select: { chave: true, valor: true } });
    return { ...PADROES, ...Object.fromEntries(salvos.map((s) => [s.chave, s.valor])) };
  } catch (erro) {
    // Mesmo princípio de obterDadosPublicos: banco fora do ar não derruba o
    // site, ele só volta aos textos originais.
    console.error("[conteudo] banco indisponível, usando textos padrão:", erro);
    return { ...PADROES };
  }
});
