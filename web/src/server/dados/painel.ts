import "server-only";

import { limiteDeTermino } from "@/lib/datas";
import { db } from "@/server/db";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas, escopoDaOrganizacao, escopoDeOrganizacoes } from "@/server/auth/permissoes";

const DIA = 24 * 60 * 60 * 1000;
const NO_SITE = ["DISPONIVEL", "EM_ADOCAO"] as const;

/**
 * Tudo que o Dashboard mostra, numa ida só ao banco.
 *
 * Cada número já sai no escopo de quem pediu: a ONG vê só o dela, e o que é
 * exclusivo da equipe Patinhas (rascunhos, mensagens, lista de organizações)
 * nem é consultado para ela. `desde` é o início da janela do gráfico mensal.
 */
export async function dadosDoDashboard(desde: Date) {
  const sessao = await exigirSessao();
  const patinhas = ehAdminPatinhas(sessao);
  const escopo = escopoDaOrganizacao(sessao);

  const agora = new Date();
  const fimDaValidade = limiteDeTermino(agora);
  const daquiUmaSemana = new Date(agora.getTime() + 7 * DIA);
  const ativa = { ...escopo, status: "ATIVA" as const };

  const [
    animais,
    necessidades,
    urgentes,
    porTipo,
    vencidas,
    vencendo,
    semFoto,
    paradas,
    campanhasAcabando,
    registros,
    atividades,
    rascunhos,
    mensagensEsperando,
    organizacoes,
    minhaOrg,
  ] = await Promise.all([
    db.animal.groupBy({ by: ["status"], where: escopo, _count: true }),
    db.necessidade.groupBy({ by: ["status"], where: escopo, _count: true }),
    db.necessidade.count({ where: { ...ativa, prioridade: "URGENTE" } }),
    db.necessidade.groupBy({ by: ["tipo"], where: ativa, _count: true }),
    // Vencida e ainda ATIVA: já sumiu do site sozinha, mas continua na lista
    // de quem cuida. Alguém precisa decidir se foi atendida ou se renova.
    db.necessidade.count({ where: { ...ativa, validadeEm: { lt: fimDaValidade } } }),
    db.necessidade.count({ where: { ...ativa, validadeEm: { gte: fimDaValidade, lte: daquiUmaSemana } } }),
    db.animal.count({ where: { ...escopo, status: { in: [...NO_SITE] }, fotoUrl: null } }),
    db.animal.count({ where: { ...escopo, status: "EM_ADOCAO", atualizadoEm: { lt: new Date(agora.getTime() - 30 * DIA) } } }),
    db.banner.count({ where: { ...escopo, status: "ATIVO", fimEm: { gte: fimDaValidade, lte: daquiUmaSemana } } }),
    db.registroDoacao.findMany({ where: { ...escopo, data: { gte: desde } }, select: { data: true, tipo: true, valor: true } }),
    db.atividade.findMany({
      where: escopo,
      orderBy: { criadoEm: "desc" },
      take: 8,
      select: { id: true, descricao: true, tipo: true, criadoEm: true, usuario: { select: { nome: true } } },
    }),
    patinhas ? db.organizacao.count({ where: { status: "RASCUNHO" } }) : Promise.resolve(0),
    patinhas ? db.mensagem.count({ where: { status: "NAO_LIDA", criadoEm: { lt: new Date(agora.getTime() - 2 * DIA) } } }) : Promise.resolve(0),
    patinhas
      ? db.organizacao.findMany({
          where: escopoDeOrganizacoes(sessao),
          orderBy: { atualizadoEm: "desc" },
          take: 8,
          select: {
            id: true,
            nome: true,
            status: true,
            cidade: true,
            estado: true,
            _count: {
              select: {
                animais: { where: { status: { in: [...NO_SITE] } } },
                necessidades: { where: { status: "ATIVA" } },
              },
            },
          },
        })
      : Promise.resolve([]),
    patinhas || !sessao.organizacaoId
      ? Promise.resolve(null)
      : db.organizacao.findUnique({
          where: { id: sessao.organizacaoId },
          select: {
            id: true,
            status: true,
            capaUrl: true,
            chavePix: true,
            linkDoacao: true,
            descricaoCompleta: true,
            whatsapp: true,
            instagram: true,
            _count: { select: { formasDoacao: { where: { ativa: true } } } },
          },
        }),
  ]);

  return {
    animais, necessidades, urgentes, porTipo, vencidas, vencendo, semFoto, paradas, campanhasAcabando,
    registros, atividades, rascunhos, mensagensEsperando, organizacoes, minhaOrg,
  };
}
