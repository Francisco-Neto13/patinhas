import "server-only";

import type { SessaoAdmin } from "@/server/auth/sessao";

/*
 * ⚠️ O ISOLAMENTO ENTRE ONGs MORA AQUI.
 *
 * Seção 11.2 do ADMINISTRACAO.MD: o administrador de ONG "não possui acesso às
 * informações administrativas das demais organizações". Isso não pode depender
 * de esconder botão na tela: uma Server Action é um endpoint POST que qualquer
 * um pode chamar com o ID que quiser, com ou sem a interface.
 *
 * Então TODA consulta e TODA mutação de animais, necessidades e organizações
 * passa o `where` por `escopoDaOrganizacao`. Um admin de ONG que pedir o
 * animal de outra ONG recebe "não encontrado", exatamente como se o registro
 * não existisse, e não um "proibido" que confirmaria que ele existe.
 */

/** Filtro por `organizacaoId` para animais e necessidades. */
export function escopoDaOrganizacao(sessao: SessaoAdmin): { organizacaoId?: string } {
  if (sessao.papel === "ADMIN_PATINHAS") return {};
  // `exigirSessao` já garante que ADMIN_ONG sempre tem organização. O `!` não
  // é otimismo: é esse contrato.
  return { organizacaoId: sessao.organizacaoId! };
}

/** Filtro por `id` para a própria tabela de organizações. */
export function escopoDeOrganizacoes(sessao: SessaoAdmin): { id?: string } {
  if (sessao.papel === "ADMIN_PATINHAS") return {};
  return { id: sessao.organizacaoId! };
}

/** A organização informada num formulário pertence a quem está logado? */
export function podeUsarOrganizacao(sessao: SessaoAdmin, organizacaoId: string) {
  return sessao.papel === "ADMIN_PATINHAS" || sessao.organizacaoId === organizacaoId;
}

export const ehAdminPatinhas = (sessao: SessaoAdmin) => sessao.papel === "ADMIN_PATINHAS";
