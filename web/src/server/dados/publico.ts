import "server-only";

import { connection } from "next/server";
import { db } from "@/server/db";
import { limiteDeInicio, limiteDeTermino } from "@/lib/datas";

/*
 * O que o site público lê do banco.
 *
 * ⚠️ Só sai o que está PUBLICADO. A regra de visibilidade mora aqui, num lugar
 * só: organização precisa estar PUBLICADA, e o que pertence a ela (animais,
 * necessidades) só aparece se a organização aparece. Um animal "Disponível"
 * de uma ONG em rascunho continua invisível.
 */

const contatoDaOrganizacao = {
  id: true,
  nome: true,
  cidade: true,
  estado: true,
  whatsapp: true,
  site: true,
  instagram: true,
  linkDoacao: true,
} as const;

export type DadosPublicos = Awaited<ReturnType<typeof buscar>>;

async function buscar() {
  const agora = new Date();
  const publicada = { status: "PUBLICADA" as const };

  const [animais, necessidades, organizacoes, banners, perguntas, ...contagens] = await Promise.all([
    db.animal.findMany({
      where: { status: { in: ["DISPONIVEL", "EM_ADOCAO"] }, organizacao: publicada },
      // Disponíveis primeiro: quem está em processo de adoção já tem alguém.
      orderBy: [{ status: "asc" }, { atualizadoEm: "desc" }],
      take: 12,
      select: {
        id: true, nome: true, fotoUrl: true, sexo: true, idade: true, porte: true, raca: true,
        cidade: true, status: true, linkAdocao: true, descricao: true,
        organizacao: { select: contatoDaOrganizacao },
      },
    }),
    db.necessidade.findMany({
      where: {
        status: "ATIVA",
        organizacao: publicada,
        // Vencida some sozinha, sem ninguém precisar lembrar de inativar.
        OR: [{ validadeEm: null }, { validadeEm: { gte: limiteDeTermino(agora) } }],
      },
      orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
      take: 9,
      select: {
        id: true, item: true, tipo: true, descricao: true, quantidade: true, unidade: true,
        prioridade: true, linkAjuda: true,
        organizacao: { select: contatoDaOrganizacao },
      },
    }),
    db.organizacao.findMany({
      where: publicada,
      orderBy: { nome: "asc" },
      select: {
        id: true, nome: true, tipo: true, capaUrl: true, galeria: true, descricaoCurta: true, descricaoCompleta: true,
        cidade: true, estado: true,
        chavePix: true, linkDoacao: true, whatsapp: true, instagram: true,
        facebook: true, site: true,
        formasDoacao: {
          where: { ativa: true },
          orderBy: { ordem: "asc" },
          select: { id: true, tipo: true, titulo: true, descricao: true, link: true },
        },
      },
    }),
    db.banner.findMany({
      where: {
        status: "ATIVO",
        // Campanha de ONG segue a regra de tudo que é da ONG: só aparece se a
        // organização estiver publicada.
        OR: [{ organizacaoId: null }, { organizacao: publicada }],
        // Dentro da janela de datas, contando o dia inteiro nas duas pontas.
        AND: [
          { OR: [{ inicioEm: null }, { inicioEm: { lte: limiteDeInicio(agora) } }] },
          { OR: [{ fimEm: null }, { fimEm: { gte: limiteDeTermino(agora) } }] },
        ],
      },
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      take: 3,
      // `fimEm` alimenta o "faltam N dias": urgência só quando o prazo é real.
      select: { id: true, titulo: true, descricao: true, imagemUrl: true, link: true, textoBotao: true, fimEm: true, organizacao: { select: { nome: true } } },
    }),
    db.perguntaFrequente.findMany({
      where: { ativa: true },
      orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
      select: { id: true, pergunta: true, resposta: true },
    }),
    // Números da seção "Sobre" (6.1, "Estatísticas, caso existam"): contados,
    // nunca digitados, e só do que é público.
    db.organizacao.count({ where: publicada }),
    db.animal.count({ where: { status: "DISPONIVEL", organizacao: publicada } }),
    db.animal.count({ where: { status: "ADOTADO", organizacao: publicada } }),
    db.necessidade.count({ where: { status: "ATENDIDA", organizacao: publicada } }),
  ]);
  const [ongs, disponiveis, adotados, atendidas] = contagens;

  return {
    animais,
    // `Decimal` não atravessa para Client Component: vira texto aqui.
    necessidades: necessidades.map((n) => ({
      ...n,
      quantidade: n.quantidade ? n.quantidade.toString().replace(".", ",") : null,
    })),
    organizacoes,
    banners,
    perguntas,
    numeros: { ongs, disponiveis, adotados, atendidas },
  };
}

const VAZIO = {
  animais: [], necessidades: [], organizacoes: [], banners: [], perguntas: [],
  numeros: { ongs: 0, disponiveis: 0, adotados: 0, atendidas: 0 },
} satisfies DadosPublicos;

export async function obterDadosPublicos(): Promise<DadosPublicos> {
  // Sem isto o Next tentaria pré-renderizar a Home no `next build`, e no build
  // da imagem Docker não existe banco nenhum.
  await connection();
  try {
    return await buscar();
  } catch (erro) {
    /*
     * ⚠️ Banco fora do ar NÃO derruba a landing page.
     *
     * O site público existia antes do banco e tem todo o conteúdo fixo (redes
     * de adoção, plataformas de doação). Sem os dados do painel ele volta a ser
     * exatamente o que era, e ninguém vê uma página de erro.
     */
    console.error("[site] dados do painel indisponíveis, seguindo sem eles:", erro);
    return VAZIO;
  }
}
