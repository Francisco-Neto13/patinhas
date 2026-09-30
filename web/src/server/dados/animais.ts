import "server-only";

import type { StatusAnimal } from "@/generated/prisma/enums";
import { db } from "@/server/db";
import { exigirSessao } from "@/server/auth/sessao";
import { escopoDaOrganizacao } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { destinoValido } from "@/server/dados/organizacoes";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { erroNoCampo, errosDoZod, todos } from "@/server/validacao/comum";
import { esquemaAnimal } from "@/server/validacao/animais";

/** A lista do painel, com a contagem por status para os filtros. */
export async function listar(status?: StatusAnimal) {
  const sessao = await exigirSessao();
  const escopo = escopoDaOrganizacao(sessao);
  const [animais, contagens] = await Promise.all([
    db.animal.findMany({
      where: { ...escopo, ...(status && { status }) },
      orderBy: { atualizadoEm: "desc" },
      select: {
        id: true, nome: true, status: true, sexo: true, porte: true, idade: true, fotoUrl: true,
        organizacao: { select: { nome: true } },
      },
    }),
    db.animal.groupBy({ by: ["status"], where: escopo, _count: true }),
  ]);
  return { animais, contagens };
}

export async function buscar(id: string) {
  const sessao = await exigirSessao();
  return db.animal.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
}

export async function salvar(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();

  if (id) {
    const existe = await db.animal.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
    if (!existe) return falha({ erroGeral: "Animal não encontrado." });
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquemaAnimal.safeParse({
    ...entrada,
    galeria: todos(dados, "galeria"),
    // Admin de ONG não escolhe organização: o animal é sempre da dele.
    organizacaoId: sessao.organizacaoId ?? entrada.organizacaoId,
  });
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;

  /*
   * ⚠️ Segunda checagem, sobre o DESTINO. A primeira (acima) garante que o
   * animal que está sendo editado é acessível. Esta garante que ele não está
   * sendo MOVIDO para uma organização inacessível.
   */
  if (!(await destinoValido(sessao, d.organizacaoId))) {
    return erroNoCampo("organizacaoId", "Organização não encontrada.", dados);
  }

  const salvo = id
    ? await db.animal.update({ where: { id }, data: d, select: { id: true, nome: true, organizacaoId: true } })
    : await db.animal.create({ data: d, select: { id: true, nome: true, organizacaoId: true } });

  await registrarAtividade({
    tipo: "animal",
    descricao: id ? `${salvo.nome} foi atualizado` : `${salvo.nome} foi adicionado`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salvo.organizacaoId,
  });
  return sucesso();
}

export async function excluir(id: string): Promise<Resultado> {
  const sessao = await exigirSessao();
  const animal = await db.animal.findFirst({
    where: { id, ...escopoDaOrganizacao(sessao) },
    select: { nome: true, organizacaoId: true },
  });
  if (!animal) return falha({ erroGeral: "Animal não encontrado." });

  await db.animal.delete({ where: { id } });
  await registrarAtividade({
    tipo: "animal",
    descricao: `${animal.nome} foi removido`,
    usuarioId: sessao.usuarioId,
    organizacaoId: animal.organizacaoId,
  });
  return sucesso();
}
