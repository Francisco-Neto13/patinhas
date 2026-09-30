import "server-only";

import { db } from "@/server/db";

export type TipoAtividade =
  | "organizacao" | "animal" | "necessidade" | "mensagem" | "usuario"
  | "doacao" | "banner" | "conteudo";

/**
 * Registra uma linha na "Atividade recente" do Dashboard (seção 10.5).
 *
 * ⚠️ Nunca derruba a operação principal. Se gravar o histórico falhar, o animal
 * foi salvo mesmo assim e a pessoa não pode receber um erro por causa de um
 * registro que é só informativo.
 */
export async function registrarAtividade(dados: {
  tipo: TipoAtividade;
  descricao: string;
  usuarioId?: string | null;
  organizacaoId?: string | null;
}) {
  try {
    await db.atividade.create({ data: dados });
  } catch (erro) {
    console.error("[atividade] não foi possível registrar:", erro);
  }
}
