import "server-only";

import { cache } from "react";
import { GRUPOS_CONFIGURACAO, GRUPOS_CONTEUDO, PADROES } from "@/lib/conteudo/campos";
import { db } from "@/server/db";
import { exigirAdminPatinhas } from "@/server/auth/sessao";
import { registrarAtividade } from "@/server/atividade";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { errosDoZod, valoresDe } from "@/server/validacao/comum";
import { esquemaPergunta, validarCampo } from "@/server/validacao/conteudo";

/*
 * Textos editáveis do site, configurações gerais e perguntas frequentes.
 * Ler os textos é público (o site inteiro usa); editar é só da equipe Patinhas.
 */

export type Textos = Record<string, string>;
export type Qual = "conteudo" | "configuracao";

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

/** Só o que foi personalizado, para preencher o formulário do painel. */
export async function valoresSalvos(qual: Qual): Promise<Record<string, string>> {
  await exigirAdminPatinhas();
  const salvos = await db.conteudo.findMany({
    where: { chave: qual === "configuracao" ? { startsWith: "config." } : { not: { startsWith: "config." } } },
  });
  return Object.fromEntries(salvos.map((s) => [s.chave, s.valor]));
}

/** Os números da página inicial da área de Conteúdo. */
export async function resumo() {
  await exigirAdminPatinhas();
  const [textos, perguntas, banners] = await Promise.all([
    db.conteudo.count({ where: { chave: { not: { startsWith: "config." } } } }),
    db.perguntaFrequente.count({ where: { ativa: true } }),
    db.banner.count({ where: { status: "ATIVO" } }),
  ]);
  return { textos, perguntas, banners };
}

/**
 * Salva textos (`conteudo`) ou configurações (`configuracao`).
 *
 * `qual` vem do `.bind` e passou pelo navegador: só escolhe QUAL lista de
 * campos validar, e as duas pedem admin Patinhas. As chaves aceitas são SÓ as
 * do registro em campos.ts; qualquer outra chave enviada no POST é ignorada,
 * então ninguém cria no banco um "texto" que o site não previu.
 */
export async function salvar(qual: Qual, dados: FormData): Promise<Resultado> {
  const sessao = await exigirAdminPatinhas();
  const grupos = qual === "configuracao" ? GRUPOS_CONFIGURACAO : GRUPOS_CONTEUDO;
  const campos = grupos.flatMap((g) => g.campos);

  const erros: Record<string, string[]> = {};
  const gravar: { chave: string; valor: string }[] = [];
  const apagar: string[] = [];

  for (const campo of campos) {
    const bruto = dados.get(campo.chave);
    if (typeof bruto !== "string") continue;
    const r = validarCampo(campo, bruto);
    if (!r.ok) {
      erros[campo.chave] = [r.erro];
      continue;
    }
    // Em branco ou igual ao padrão: não guarda nada, e o site usa o padrão.
    // Assim, se o texto original mudar no código, quem nunca editou recebe o
    // novo automaticamente.
    if (r.valor === "" || r.valor === campo.padrao) apagar.push(campo.chave);
    else gravar.push({ chave: campo.chave, valor: r.valor });
  }

  if (Object.keys(erros).length > 0) {
    return falha({ erros, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) });
  }

  // Tudo ou nada: metade dos textos salva e metade não deixaria a página
  // num estado que ninguém escreveu.
  await db.$transaction([
    db.conteudo.deleteMany({ where: { chave: { in: apagar } } }),
    ...gravar.map((g) => db.conteudo.upsert({ where: { chave: g.chave }, create: g, update: { valor: g.valor } })),
  ]);

  await registrarAtividade({
    tipo: "conteudo",
    descricao: qual === "configuracao" ? "Configurações gerais atualizadas" : "Textos do site atualizados",
    usuarioId: sessao.usuarioId,
  });
  return sucesso();
}

// ---------------------------------------------------------------------------
// Perguntas frequentes
// ---------------------------------------------------------------------------

export async function listarPerguntas() {
  await exigirAdminPatinhas();
  return db.perguntaFrequente.findMany({ orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }] });
}

export async function buscarPergunta(id: string) {
  await exigirAdminPatinhas();
  return db.perguntaFrequente.findUnique({ where: { id } });
}

export async function salvarPergunta(id: string | null, dados: FormData): Promise<Resultado> {
  await exigirAdminPatinhas();
  const r = esquemaPergunta.safeParse(Object.fromEntries(dados));
  if (!r.success) return errosDoZod(r.error, dados);

  if (id) {
    const existe = await db.perguntaFrequente.findUnique({ where: { id }, select: { id: true } });
    if (!existe) return falha({ erroGeral: "Pergunta não encontrada." });
    await db.perguntaFrequente.update({ where: { id }, data: r.data });
  } else {
    await db.perguntaFrequente.create({ data: r.data });
  }
  return sucesso();
}

export async function excluirPergunta(id: string): Promise<Resultado> {
  await exigirAdminPatinhas();
  await db.perguntaFrequente.deleteMany({ where: { id } });
  return sucesso();
}
