"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { conferirSenha, obterHashFantasma } from "@/lib/auth/senha";
import { criarSessao, encerrarSessao } from "@/lib/auth/sessao";
import { bloqueado, limpar, registrarFalha } from "@/lib/limitador";
import { origemDaRequisicao } from "@/lib/origem";

export type EstadoLogin = { erro?: string; email?: string };

export async function entrar(_anterior: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const senha = String(dados.get("senha") ?? "").slice(0, 200);

  if (!email || !senha) return { erro: "Informe e-mail e senha.", email };

  // Por origem E e-mail: travar só pelo e-mail deixaria qualquer um bloquear o
  // login de um administrador de propósito, errando a senha dele cinco vezes.
  const chave = `${await origemDaRequisicao()}:${email}`;
  if (bloqueado(chave)) {
    return { erro: "Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo.", email };
  }

  const usuario = await db.usuario.findUnique({
    where: { email },
    select: { id: true, senhaHash: true, ativo: true },
  });

  // Com e-mail inexistente compara contra um hash descartável, para as duas
  // respostas custarem o mesmo tempo. Ver `obterHashFantasma`.
  const senhaConfere = await conferirSenha(
    senha,
    usuario?.senhaHash ?? (await obterHashFantasma()),
  );

  /*
   * ⚠️ UMA mensagem para os três casos: e-mail que não existe, senha errada e
   * usuário desativado. Mensagens diferentes ensinariam a quem está tentando
   * quais e-mails têm conta no painel.
   */
  if (!usuario || !senhaConfere || !usuario.ativo) {
    registrarFalha(chave);
    return { erro: "E-mail ou senha incorretos.", email };
  }

  limpar(chave);
  await criarSessao(usuario.id);
  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}
