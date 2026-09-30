"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirAdminPatinhas, hashDaSessaoAtual } from "@/lib/auth/sessao";
import { gerarHashDeSenha, problemaNaSenha } from "@/lib/auth/senha";
import { registrarAtividade } from "@/lib/admin/atividade";
import { errosDoZod, textoObrigatorio, valoresDe, type EstadoFormulario } from "@/lib/admin/validacao";

const esquema = z.object({
  nome: textoObrigatorio("o nome", 100),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email({ error: "E-mail inválido." }).max(200),
  ),
  papel: z.enum(["ADMIN_PATINHAS", "ADMIN_ONG"], { error: "Escolha o perfil." }),
  organizacaoId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable()),
  // Checkbox desmarcado simplesmente não vai no FormData.
  ativo: z.preprocess((v) => v === "on", z.boolean()),
  senha: z.string().max(200).default(""),
});

export async function salvarUsuario(
  id: string | null,
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirAdminPatinhas();

  const resultado = esquema.safeParse(Object.fromEntries(dados));
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;
  const falha = (campo: string, msg: string): EstadoFormulario => ({
    erros: { [campo]: [msg] },
    erroGeral: "Confira os campos destacados.",
    valores: valoresDe(dados),
  });

  // Senha: obrigatória ao criar; ao editar, em branco significa "não mudar".
  if (!id || d.senha) {
    const problema = problemaNaSenha(d.senha);
    if (problema) return falha("senha", problema);
  }

  /*
   * A regra que o schema não expressa (ver schema.prisma): admin de ONG
   * precisa de uma organização; admin Patinhas não tem nenhuma.
   */
  if (d.papel === "ADMIN_ONG") {
    if (!d.organizacaoId) return falha("organizacaoId", "Escolha a organização deste administrador.");
    if (!(await db.organizacao.findUnique({ where: { id: d.organizacaoId }, select: { id: true } }))) {
      return falha("organizacaoId", "Organização não encontrada.");
    }
  }
  const organizacaoId = d.papel === "ADMIN_ONG" ? d.organizacaoId : null;

  if (id) {
    const atual = await db.usuario.findUnique({ where: { id }, select: { papel: true, ativo: true } });
    if (!atual) return { erroGeral: "Usuário não encontrado." };

    // ⚠️ Ninguém se tranca para fora. Sem isto, um clique errado no próprio
    // cadastro deixa o painel sem ninguém que consiga desfazer.
    if (id === sessao.usuarioId && (!d.ativo || d.papel !== "ADMIN_PATINHAS")) {
      return { erroGeral: "Você não pode desativar nem rebaixar a sua própria conta.", valores: valoresDe(dados) };
    }

    // Tirar o último admin Patinhas ativo deixaria o painel sem quem gerencie
    // usuários. A saída seria o script de linha de comando, na VPS.
    const deixaDeSerAdminAtivo = atual.papel === "ADMIN_PATINHAS" && atual.ativo && (d.papel !== "ADMIN_PATINHAS" || !d.ativo);
    if (deixaDeSerAdminAtivo) {
      const outros = await db.usuario.count({ where: { papel: "ADMIN_PATINHAS", ativo: true, id: { not: id } } });
      if (outros === 0) return { erroGeral: "Este é o último Administrador Patinhas ativo. Crie outro antes.", valores: valoresDe(dados) };
    }
  }

  const emUso = await db.usuario.findFirst({ where: { email: d.email, ...(id && { id: { not: id } }) }, select: { id: true } });
  if (emUso) return falha("email", "Já existe um usuário com este e-mail.");

  const base = { nome: d.nome, email: d.email, papel: d.papel, organizacaoId, ativo: d.ativo };
  const senhaHash = d.senha ? await gerarHashDeSenha(d.senha) : undefined;

  const salvo = id
    ? await db.usuario.update({ where: { id }, data: { ...base, ...(senhaHash && { senhaHash }) }, select: { id: true, nome: true } })
    : await db.usuario.create({ data: { ...base, senhaHash: senhaHash! }, select: { id: true, nome: true } });

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

  revalidatePath("/admin", "layout");
  redirect(`/admin/usuarios?ok=${id ? "salvo" : "criado"}`);
}
