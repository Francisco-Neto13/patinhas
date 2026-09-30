import "server-only";

import { db } from "@/server/db";
import { exigirAdminPatinhas, hashDaSessaoAtual } from "@/server/auth/sessao";
import { gerarHashDeSenha, problemaNaSenha } from "@/server/auth/senha";
import { registrarAtividade } from "@/server/atividade";
import { falha, sucesso, type Resultado } from "@/server/resultado";
import { erroNoCampo, errosDoZod, valoresDe } from "@/server/validacao/comum";
import { esquemaUsuario } from "@/server/validacao/usuarios";

/*
 * Usuários do painel. Módulo exclusivo da equipe Patinhas (seção 11.1).
 *
 * ⚠️ `select` explícito em toda leitura: o `senhaHash` nunca sai daqui, nem
 * para uma tela que só o admin vê.
 */

export async function listar() {
  await exigirAdminPatinhas();
  return db.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    select: { id: true, nome: true, email: true, papel: true, ativo: true, ultimoAcessoEm: true, organizacao: { select: { nome: true } } },
  });
}

export async function buscar(id: string) {
  await exigirAdminPatinhas();
  return db.usuario.findUnique({
    where: { id },
    select: { id: true, nome: true, email: true, papel: true, organizacaoId: true, ativo: true },
  });
}

export async function salvar(id: string | null, dados: FormData): Promise<Resultado> {
  const sessao = await exigirAdminPatinhas();

  const resultado = esquemaUsuario.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;

  // Senha: obrigatória ao criar; ao editar, em branco significa "não mudar".
  if (!id || d.senha) {
    const problema = problemaNaSenha(d.senha);
    if (problema) return erroNoCampo("senha", problema, dados);
  }

  /*
   * A regra que o schema não expressa (ver schema.prisma): admin de ONG
   * precisa de uma organização; admin Patinhas não tem nenhuma.
   */
  if (d.papel === "ADMIN_ONG") {
    if (!d.organizacaoId) return erroNoCampo("organizacaoId", "Escolha a organização deste administrador.", dados);
    if (!(await db.organizacao.findUnique({ where: { id: d.organizacaoId }, select: { id: true } }))) {
      return erroNoCampo("organizacaoId", "Organização não encontrada.", dados);
    }
  }
  const organizacaoId = d.papel === "ADMIN_ONG" ? d.organizacaoId : null;

  if (id) {
    const atual = await db.usuario.findUnique({ where: { id }, select: { papel: true, ativo: true } });
    if (!atual) return falha({ erroGeral: "Usuário não encontrado." });

    // ⚠️ Ninguém se tranca para fora. Sem isto, um clique errado no próprio
    // cadastro deixa o painel sem ninguém que consiga desfazer.
    if (id === sessao.usuarioId && (!d.ativo || d.papel !== "ADMIN_PATINHAS")) {
      return falha({ erroGeral: "Você não pode desativar nem rebaixar a sua própria conta.", valores: valoresDe(dados) });
    }

    // Tirar o último admin Patinhas ativo deixaria o painel sem quem gerencie
    // usuários. A saída seria o script de linha de comando, na VPS.
    const deixaDeSerAdminAtivo = atual.papel === "ADMIN_PATINHAS" && atual.ativo && (d.papel !== "ADMIN_PATINHAS" || !d.ativo);
    if (deixaDeSerAdminAtivo) {
      const outros = await db.usuario.count({ where: { papel: "ADMIN_PATINHAS", ativo: true, id: { not: id } } });
      if (outros === 0) return falha({ erroGeral: "Este é o último Administrador Patinhas ativo. Crie outro antes.", valores: valoresDe(dados) });
    }
  }

  const emUso = await db.usuario.findFirst({ where: { email: d.email, ...(id && { id: { not: id } }) }, select: { id: true } });
  if (emUso) return erroNoCampo("email", "Já existe um usuário com este e-mail.", dados);

  const base = { nome: d.nome, email: d.email, papel: d.papel, organizacaoId, ativo: d.ativo };
  const senhaHash = d.senha ? await gerarHashDeSenha(d.senha) : undefined;

  const salvo = id
    ? await db.usuario.update({ where: { id }, data: { ...base, ...(senhaHash && { senhaHash }) }, select: { nome: true } })
    : await db.usuario.create({ data: { ...base, senhaHash: senhaHash! }, select: { nome: true } });

  /*
   * ⚠️ Desativar ou trocar a senha derruba as sessões abertas NA HORA. É o
   * motivo de as sessões morarem no banco: sem isto, quem foi desativado (ou
   * quem roubou a senha antiga) continuaria logado até o cookie vencer.
   */
  if (id && (!d.ativo || senhaHash)) {
    // Trocando a PRÓPRIA senha: derruba os outros dispositivos, mas não o
    // atual, senão a pessoa é jogada para o login no meio do que fazia.
    const poupar = id === sessao.usuarioId ? await hashDaSessaoAtual() : null;
    await db.sessao.deleteMany({ where: { usuarioId: id, ...(poupar && { tokenHash: { not: poupar } }) } });
  }

  await registrarAtividade({
    tipo: "usuario",
    descricao: id ? `Usuário ${salvo.nome} foi atualizado` : `Usuário ${salvo.nome} foi cadastrado`,
    usuarioId: sessao.usuarioId,
    organizacaoId,
  });
  return sucesso();
}
