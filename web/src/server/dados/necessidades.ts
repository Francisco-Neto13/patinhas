import "server-only";

import type { StatusNecessidade } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { exigirSessao } from "@/server/auth/sessao";
import { escopoDaOrganizacao } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { destinoValido } from "@/server/dados/organizacoes";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { erroNoCampo, errosDoZod } from "@/server/validacao/comum";
import { esquemaNecessidade } from "@/server/validacao/necessidades";

/** A lista do painel, com a contagem por status para os filtros. */
export async function listar(status?: StatusNecessidade) {
  const sessao = await exigirSessao();
  const escopo = escopoDaOrganizacao(sessao);
  const [necessidades, contagens] = await Promise.all([
    db.necessidade.findMany({
      where: { ...escopo, ...(status && { status }) },
      // Urgente antes de normal, e dentro de cada uma, a mais nova primeiro.
      orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
      select: {
        id: true, item: true, tipo: true, quantidade: true, unidade: true, prioridade: true,
        status: true, criadoEm: true, validadeEm: true, organizacao: { select: { nome: true } },
      },
    }),
    db.necessidade.groupBy({ by: ["status"], where: escopo, _count: true }),
  ]);
  return { necessidades, contagens };
}

export async function buscar(id: string) {
  const sessao = await exigirSessao();
  return db.necessidade.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
}

export async function salvar(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();

  let atual: { atendidaEm: Date | null } | null = null;
  if (id) {
    atual = await db.necessidade.findFirst({
      where: { id, ...escopoDaOrganizacao(sessao) },
      select: { atendidaEm: true },
    });
    if (!atual) return falha({ erroGeral: "Necessidade não encontrada." });
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquemaNecessidade.safeParse({ ...entrada, organizacaoId: sessao.organizacaoId ?? entrada.organizacaoId });
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;

  if (!(await destinoValido(sessao, d.organizacaoId))) {
    return erroNoCampo("organizacaoId", "Organização não encontrada.", dados);
  }

  // Guarda QUANDO foi atendida (histórico, seção 4.3). Voltar para ativa limpa.
  const atendidaEm = d.status === "ATENDIDA" ? (atual?.atendidaEm ?? new Date()) : null;

  const salva = id
    ? await db.necessidade.update({ where: { id }, data: { ...d, atendidaEm }, select: { item: true, organizacaoId: true } })
    : await db.necessidade.create({ data: { ...d, atendidaEm }, select: { item: true, organizacaoId: true } });

  await registrarAtividade({
    tipo: "necessidade",
    descricao: id ? `Necessidade "${salva.item}" foi atualizada` : `Nova necessidade cadastrada: ${salva.item}`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salva.organizacaoId,
  });
  return sucesso();
}

/** Atalho da lista: marca como atendida sem abrir o formulário. */
export async function marcarAtendida(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const n = await db.necessidade.findFirst({
    where: { id, ...escopoDaOrganizacao(sessao) },
    select: { item: true, organizacaoId: true, status: true },
  });
  if (!n) return falha({ erroGeral: "Necessidade não encontrada." });
  if (n.status === "ATENDIDA") return sucesso();

  await db.necessidade.update({ where: { id }, data: { status: "ATENDIDA", atendidaEm: new Date() } });
  await registrarAtividade({
    tipo: "necessidade",
    descricao: `Necessidade "${n.item}" foi atendida`,
    usuarioId: sessao.usuarioId,
    organizacaoId: n.organizacaoId,
  });
  return sucesso();
}

export async function excluir(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const n = await db.necessidade.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!n) return falha({ erroGeral: "Necessidade não encontrada." });

  await db.necessidade.delete({ where: { id } });
  return sucesso();
}
