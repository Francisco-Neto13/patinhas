import "server-only";

import { db } from "@/server/db";
import { exigirSessao, type SessaoAdmin } from "@/server/auth/sessao";
import { ehAdminPatinhas, escopoDeOrganizacoes, podeUsarOrganizacao } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { errosDoZod, todos } from "@/server/validacao/comum";
import { esquemaOrganizacao } from "@/server/validacao/organizacoes";

/*
 * Organizações (seção 2). O admin de ONG enxerga uma só, a dele; quem decide
 * QUAIS organizações existem é a equipe Patinhas.
 */

export async function listar() {
  const sessao = await exigirSessao();
  return db.organizacao.findMany({
    where: escopoDeOrganizacoes(sessao),
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      tipo: true,
      status: true,
      cidade: true,
      estado: true,
      _count: { select: { animais: true, necessidades: { where: { status: "ATIVA" } } } },
    },
  });
}

/** Fora do escopo = `null`, igual a um ID que não existe. Ver auth/permissoes.ts. */
export async function buscar(id: string) {
  const sessao = await exigirSessao();
  return db.organizacao.findFirst({ where: { id, ...escopoDeOrganizacoes(sessao) } });
}

/**
 * As opções do campo "Organização" dos formulários. Só a equipe Patinhas
 * escolhe; para o admin de ONG é `null` e o formulário nem mostra o campo.
 */
export async function opcoes(): Promise<{ id: string; nome: string }[] | null> {
  const sessao = await exigirSessao();
  if (!ehAdminPatinhas(sessao)) return null;
  return db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

/** Já existe alguma? Sem nenhuma, não dá para cadastrar animal, necessidade ou doação. */
export async function existeAlguma() {
  await exigirSessao();
  return (await db.organizacao.count()) > 0;
}

/**
 * O destino de um cadastro (animal, necessidade, doação) é válido para quem
 * salva? Admin de ONG não escolhe: vai sempre para a dele, e um
 * `organizacaoId` de outra ONG forjado no POST é descartado aqui.
 */
export async function destinoValido(sessao: SessaoAdmin, enviada: unknown): Promise<string | null> {
  const id = sessao.organizacaoId ?? (typeof enviada === "string" ? enviada : "");
  if (!id || !podeUsarOrganizacao(sessao, id)) return null;
  return (await db.organizacao.findUnique({ where: { id }, select: { id: true } }))?.id ?? null;
}

/**
 * Cria (`id` nulo) ou edita uma organização.
 *
 * O `id` chega pelo `.bind` da página, e por isso passou pelo navegador: NÃO é
 * confiável. Ele é só a referência de qual registro editar; se o usuário pode
 * editá-lo é decidido de novo aqui, pelo escopo da sessão.
 */
export async function salvar(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();

  // Seção 2.3: quem decide QUAIS organizações existem é a equipe Patinhas.
  // O admin de ONG só edita a própria.
  if (!id && !ehAdminPatinhas(sessao)) {
    return falha({ erroGeral: "Só a equipe Patinhas cadastra novas organizações." });
  }

  let atual: { status: "PUBLICADA" | "RASCUNHO" | "INATIVA" } | null = null;
  if (id) {
    atual = await db.organizacao.findFirst({
      where: { id, ...escopoDeOrganizacoes(sessao) },
      select: { status: true },
    });
    if (!atual) return falha({ erroGeral: "Organização não encontrada." });
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquemaOrganizacao.safeParse({
    ...entrada,
    galeria: todos(dados, "galeria"),
    // Admin de ONG não vê o campo de status: a publicação é decisão da equipe
    // Patinhas. O valor atual é mantido, e qualquer "status" forjado no POST é
    // ignorado aqui.
    status: ehAdminPatinhas(sessao) ? entrada.status : (atual?.status ?? "RASCUNHO"),
  });
  if (!resultado.success) return errosDoZod(resultado.error, dados);

  const d = resultado.data;
  const salva = id
    ? await db.organizacao.update({ where: { id }, data: d, select: { id: true, nome: true } })
    : await db.organizacao.create({ data: d, select: { id: true, nome: true } });

  await registrarAtividade({
    tipo: "organizacao",
    descricao: id ? `${salva.nome} foi atualizada` : `${salva.nome} foi cadastrada`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salva.id,
  });
  return sucesso();
}

/**
 * Exclui uma organização, só se ela não tiver animais nem necessidades.
 *
 * Seção 2.2 pede "excluir OU desativar". Apagar uma ONG com animais apagaria
 * junto o histórico deles; o banco recusa (`onDelete: Restrict`), e a tela
 * orienta a desativar, que tira do site sem perder nada.
 */
export async function excluir(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  if (!ehAdminPatinhas(sessao)) return falha({ erroGeral: "Só a equipe Patinhas exclui organizações." });

  const org = await db.organizacao.findUnique({
    where: { id },
    select: { nome: true, _count: { select: { animais: true, necessidades: true } } },
  });
  if (!org) return falha({ erroGeral: "Organização não encontrada." });

  if (org._count.animais > 0 || org._count.necessidades > 0) {
    return falha({
      erroGeral: `${org.nome} tem ${org._count.animais} animal(is) e ${org._count.necessidades} necessidade(s) cadastrados. Mude o status para "Inativa": ela sai do site e nada se perde.`,
    });
  }

  await db.organizacao.delete({ where: { id } });
  await registrarAtividade({ tipo: "organizacao", descricao: `${org.nome} foi excluída`, usuarioId: sessao.usuarioId });
  return sucesso();
}
