import "server-only";

import { db } from "@/server/db";
import { exigirSessao } from "@/server/auth/sessao";
import { escopoDaOrganizacao } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { destinoValido } from "@/server/dados/organizacoes";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { erroNoCampo, errosDoZod } from "@/server/validacao/comum";
import { esquemaForma, esquemaRegistro } from "@/server/validacao/doacoes";

/*
 * Doações. Nenhum valor passa pelo Patinhas: as formas de doação só levam o
 * visitante até a organização, e os registros são o controle que ela informa.
 * Mesma regra de animais e necessidades: tudo filtrado pelo escopo da sessão,
 * e o destino de um cadastro tem de estar no escopo de quem salva.
 */

// ---------------------------------------------------------------------------
// Formas de doação (seção 5.1): aparecem no site, no card da organização.
// ---------------------------------------------------------------------------

export async function listarFormas() {
  const sessao = await exigirSessao();
  return db.formaDoacao.findMany({
    where: escopoDaOrganizacao(sessao),
    orderBy: [{ organizacao: { nome: "asc" } }, { ordem: "asc" }],
    select: { id: true, tipo: true, titulo: true, ativa: true, organizacao: { select: { nome: true } } },
  });
}

export async function buscarForma(id: string) {
  const sessao = await exigirSessao();
  return db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
}

export async function salvarForma(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();
  if (id && !(await db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return falha({ erroGeral: "Forma de doação não encontrada." });
  }

  const entrada = Object.fromEntries(dados);
  const r = esquemaForma.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);

  const organizacaoId = await destinoValido(sessao, entrada.organizacaoId);
  if (!organizacaoId) return erroNoCampo("organizacaoId", "Escolha a organização.", dados);

  // Vaquinha e "outra plataforma" sem link não levam a lugar nenhum.
  if ((r.data.tipo === "VAQUINHA" || r.data.tipo === "OUTRA_PLATAFORMA") && !r.data.link) {
    return erroNoCampo("link", "Informe o link da campanha.", dados);
  }

  const data = { ...r.data, organizacaoId };
  if (id) await db.formaDoacao.update({ where: { id }, data });
  else await db.formaDoacao.create({ data });
  return sucesso();
}

export async function excluirForma(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const f = await db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!f) return falha({ erroGeral: "Forma de doação não encontrada." });
  await db.formaDoacao.delete({ where: { id } });
  return sucesso();
}

// ---------------------------------------------------------------------------
// Registros de doações informadas (seção 5.2): só no painel.
// ---------------------------------------------------------------------------

/** Os 200 registros mais recentes e os totais do topo da página. */
export async function listarRegistros() {
  const sessao = await exigirSessao();
  const escopo = escopoDaOrganizacao(sessao);
  const [registros, somaDinheiro, itens] = await Promise.all([
    db.registroDoacao.findMany({
      where: escopo,
      orderBy: { data: "desc" },
      take: 200,
      select: {
        id: true, data: true, tipo: true, valor: true, item: true, quantidade: true, unidade: true,
        doador: true, anonimo: true, organizacao: { select: { nome: true } },
      },
    }),
    db.registroDoacao.aggregate({ where: { ...escopo, tipo: "DINHEIRO" }, _sum: { valor: true }, _count: true }),
    db.registroDoacao.count({ where: { ...escopo, tipo: { not: "DINHEIRO" } } }),
  ]);
  return { registros, somaDinheiro, itens };
}

export async function buscarRegistro(id: string) {
  const sessao = await exigirSessao();
  return db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
}

export async function salvarRegistro(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();
  if (id && !(await db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return falha({ erroGeral: "Registro não encontrado." });
  }

  const entrada = Object.fromEntries(dados);
  const r = esquemaRegistro.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);
  const d = r.data;

  const organizacaoId = await destinoValido(sessao, entrada.organizacaoId);
  if (!organizacaoId) return erroNoCampo("organizacaoId", "Escolha a organização.", dados);
  if (d.tipo === "DINHEIRO" && !d.valor) return erroNoCampo("valor", "Informe o valor recebido.", dados);
  if (d.tipo !== "DINHEIRO" && !d.item) return erroNoCampo("item", "Informe o que foi doado.", dados);
  if (d.data && d.data > new Date(Date.now() + 24 * 3600 * 1000)) return erroNoCampo("data", "A data não pode estar no futuro.", dados);

  // Doação anônima não guarda o nome, nem por engano: o campo é descartado.
  const salvar = { ...d, data: d.data!, doador: d.anonimo ? null : d.doador, organizacaoId };
  if (id) {
    await db.registroDoacao.update({ where: { id }, data: salvar });
  } else {
    await db.registroDoacao.create({ data: salvar });
    await registrarAtividade({ tipo: "doacao", descricao: "Nova doação registrada", usuarioId: sessao.usuarioId, organizacaoId });
  }
  return sucesso();
}

export async function excluirRegistro(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const r = await db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!r) return falha({ erroGeral: "Registro não encontrado." });
  await db.registroDoacao.delete({ where: { id } });
  return sucesso();
}
