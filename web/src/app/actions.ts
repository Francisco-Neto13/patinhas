"use server";

import { revalidatePath } from "next/cache";
import * as mensagens from "@/server/dados/mensagens";
import type { CamposContato } from "@/lib/validacao-contato";

/**
 * Formulário de contato do site (seção 9).
 *
 * ⚠️ A ÚNICA Server Action que qualquer visitante, sem login, consegue chamar.
 * Validação, anti-robô e limite por origem ficam em `mensagens.receber`.
 */
export async function enviarMensagem(entrada: CamposContato & { armadilha?: string }): Promise<mensagens.ResultadoEnvio> {
  const r = await mensagens.receber(entrada);
  if (r.ok) revalidatePath("/admin", "layout");
  return r;
}
