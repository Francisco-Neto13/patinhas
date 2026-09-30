import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Papel } from "@/generated/prisma/client";
import { NOME_COOKIE } from "@/lib/auth/nome-cookie";

export { NOME_COOKIE };
const DURACAO_MS = 7 * 24 * 60 * 60 * 1000;

/** O que o resto do app enxerga da sessão. Nunca o registro cru do banco. */
export type SessaoAdmin = {
  usuarioId: string;
  nome: string;
  email: string;
  papel: Papel;
  /** Preenchido só para ADMIN_ONG. */
  organizacaoId: string | null;
  organizacaoNome: string | null;
};

const hashDoToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function criarSessao(usuarioId: string) {
  // 32 bytes aleatórios: impossível de adivinhar, e por isso não precisa de
  // assinatura. A validade vem de o hash existir na tabela, não de criptografia.
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_MS);

  await db.sessao.create({ data: { tokenHash: hashDoToken(token), usuarioId, expiraEm } });
  await db.usuario.update({ where: { id: usuarioId }, data: { ultimoAcessoEm: new Date() } });

  (await cookies()).set(NOME_COOKIE, token, {
    // Nenhum JavaScript da página lê este cookie, nem um script injetado.
    httpOnly: true,
    // Em produção só trafega por HTTPS. Em desenvolvimento o localhost é http.
    secure: process.env.NODE_ENV === "production",
    // `lax` bloqueia o cookie em POST vindo de outro site, a base contra CSRF.
    sameSite: "lax",
    // ⚠️ Só /admin. O site público não precisa da sessão, e um cookie que nem
    // chega nas outras rotas não tem como vazar por elas.
    path: "/admin",
    expires: expiraEm,
  });
}

export async function encerrarSessao() {
  const loja = await cookies();
  const token = loja.get(NOME_COOKIE)?.value;
  if (token) await db.sessao.deleteMany({ where: { tokenHash: hashDoToken(token) } });
  loja.delete({ name: NOME_COOKIE, path: "/admin" });
}

/**
 * Sessão da requisição atual, ou `null`.
 *
 * `cache` do React memoriza o resultado durante UMA renderização: a página, o
 * layout e três componentes podem chamar isto e o banco é consultado uma vez.
 */
export const obterSessao = cache(async (): Promise<SessaoAdmin | null> => {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { tokenHash: hashDoToken(token) },
    select: {
      expiraEm: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
          papel: true,
          ativo: true,
          organizacaoId: true,
          organizacao: { select: { nome: true } },
        },
      },
    },
  });

  if (!sessao || sessao.expiraEm < new Date()) return null;

  const u = sessao.usuario;
  /*
   * ⚠️ Conferido a CADA requisição, e é por isso que a sessão mora no banco.
   * Desativar um usuário corta o acesso dele no próximo clique, e não daqui a
   * sete dias quando o cookie expirar.
   */
  if (!u.ativo) return null;
  // Admin de ONG cuja organização foi apagada não tem sobre o que agir.
  if (u.papel === "ADMIN_ONG" && !u.organizacaoId) return null;

  return {
    usuarioId: u.id,
    nome: u.nome,
    email: u.email,
    papel: u.papel,
    organizacaoId: u.papel === "ADMIN_ONG" ? u.organizacaoId : null,
    organizacaoNome: u.papel === "ADMIN_ONG" ? (u.organizacao?.nome ?? null) : null,
  };
});

/** Hash da sessão desta requisição, para poupá-la ao derrubar as outras. */
export async function hashDaSessaoAtual(): Promise<string | null> {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  return token ? hashDoToken(token) : null;
}

/** Para páginas e actions do admin: sem sessão válida, volta para o login. */
export async function exigirSessao(): Promise<SessaoAdmin> {
  const sessao = await obterSessao();
  if (!sessao) redirect("/admin/login");
  return sessao;
}

/** Módulos exclusivos da equipe Patinhas: usuários e mensagens (seção 11.1). */
export async function exigirAdminPatinhas(): Promise<SessaoAdmin> {
  const sessao = await exigirSessao();
  if (sessao.papel !== "ADMIN_PATINHAS") redirect("/admin?acesso=negado");
  return sessao;
}
