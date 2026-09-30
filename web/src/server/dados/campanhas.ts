import "server-only";

import { db } from "@/server/db";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas, escopoDaOrganizacao } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { erroNoCampo, errosDoZod } from "@/server/validacao/comum";
import { esquemaCampanha } from "@/server/validacao/campanhas";

/*
 * Banners da equipe Patinhas e campanhas das ONGs (seções 8 e 11.2).
 *
 * Mesmo isolamento de animais e necessidades: o admin de ONG só enxerga e só
 * grava campanhas da própria organização, e o `organizacaoId` que ele mandar
 * no POST é ignorado. Só a equipe Patinhas escolhe a organização, ou deixa em
 * branco para um banner do próprio Patinhas.
 */

export async function listar() {
  const sessao = await exigirSessao();
  return db.banner.findMany({
    where: escopoDaOrganizacao(sessao),
    orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
    include: { organizacao: { select: { nome: true, status: true } } },
  });
}

export async function buscar(id: string) {
  const sessao = await exigirSessao();
  return db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
}

export async function salvar(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();
  if (id && !(await db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return falha({ erroGeral: "Campanha não encontrada." });
  }

  const entrada = Object.fromEntries(dados);
  const r = esquemaCampanha.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);
  const d = r.data;

  if (d.inicioEm && d.fimEm && d.fimEm < d.inicioEm) return erroNoCampo("fimEm", "O fim precisa ser depois do início.", dados);
  // Botão sem destino, ou destino sem texto de botão, vira um banner quebrado.
  if (d.link && !d.textoBotao) return erroNoCampo("textoBotao", "Informe o texto do botão.", dados);
  if (d.textoBotao && !d.link) return erroNoCampo("link", "Informe para onde o botão leva.", dados);

  let organizacaoId: string | null;
  if (ehAdminPatinhas(sessao)) {
    const escolhida = typeof entrada.organizacaoId === "string" ? entrada.organizacaoId : "";
    organizacaoId = escolhida || null;
    if (organizacaoId && !(await db.organizacao.findUnique({ where: { id: organizacaoId }, select: { id: true } }))) {
      return erroNoCampo("organizacaoId", "Organização não encontrada.", dados);
    }
  } else {
    organizacaoId = sessao.organizacaoId;
  }

  const data = { ...d, organizacaoId };
  if (id) {
    await db.banner.update({ where: { id }, data });
  } else {
    await db.banner.create({ data });
    await registrarAtividade({
      tipo: "banner",
      descricao: organizacaoId ? `Nova campanha publicada: ${d.titulo}` : `Novo banner publicado: ${d.titulo}`,
      usuarioId: sessao.usuarioId,
      organizacaoId,
    });
  }
  return sucesso();
}

export async function excluir(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const b = await db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!b) return falha({ erroGeral: "Campanha não encontrada." });
  await db.banner.delete({ where: { id } });
  return sucesso();
}
