"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirSessao, hashDaSessaoAtual } from "@/lib/auth/sessao";
import { conferirSenha, gerarHashDeSenha, problemaNaSenha } from "@/lib/auth/senha";
import { bloqueado, limpar, registrarFalha } from "@/lib/limitador";
import type { EstadoFormulario } from "@/lib/admin/validacao";

/**
 * Troca da própria senha.
 *
 * ⚠️ Pede a senha ATUAL. Sem isso, qualquer pessoa diante de um computador com
 * o painel aberto trocaria a senha e trancaria o dono para fora da conta.
 * Pelo mesmo motivo, a tentativa de senha atual passa pelo limitador do login.
 */
export async function trocarSenha(_a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const atual = String(dados.get("senhaAtual") ?? "").slice(0, 200);
  const nova = String(dados.get("novaSenha") ?? "").slice(0, 200);
  const confirmacao = String(dados.get("confirmacao") ?? "").slice(0, 200);

  const chave = `troca-senha:${sessao.usuarioId}`;
  if (bloqueado(chave)) return { erroGeral: "Muitas tentativas seguidas. Aguarde 15 minutos." };

  const usuario = await db.usuario.findUnique({ where: { id: sessao.usuarioId }, select: { senhaHash: true } });
  if (!usuario || !(await conferirSenha(atual, usuario.senhaHash))) {
    registrarFalha(chave);
    return { erros: { senhaAtual: ["Senha atual incorreta."] }, erroGeral: "Confira os campos destacados." };
  }

  const problema = problemaNaSenha(nova);
  if (problema) return { erros: { novaSenha: [problema] }, erroGeral: "Confira os campos destacados." };
  if (nova !== confirmacao) return { erros: { confirmacao: ["As duas senhas não são iguais."] }, erroGeral: "Confira os campos destacados." };
  if (nova === atual) return { erros: { novaSenha: ["A nova senha precisa ser diferente da atual."] }, erroGeral: "Confira os campos destacados." };

  limpar(chave);
  await db.usuario.update({ where: { id: sessao.usuarioId }, data: { senhaHash: await gerarHashDeSenha(nova) } });

  // Derruba os OUTROS dispositivos (onde a senha antiga pode ter vazado), mas
  // mantém este, para a pessoa não cair no login no meio da troca.
  const poupar = await hashDaSessaoAtual();
  await db.sessao.deleteMany({ where: { usuarioId: sessao.usuarioId, ...(poupar && { tokenHash: { not: poupar } }) } });

  redirect("/admin/conta?ok=1");
}
