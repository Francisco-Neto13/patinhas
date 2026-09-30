"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as conteudo from "@/server/dados/conteudo";
import type { EstadoFormulario } from "@/lib/admin/formulario";

/** Textos (`conteudo`) ou configurações (`configuracao`). Ver `conteudo.salvar`. */
export async function salvarConteudo(qual: conteudo.Qual, _anterior: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await conteudo.salvar(qual, dados);
  if (!r.ok) return r;
  // Textos e configurações aparecem em todas as páginas (topo e rodapé).
  revalidatePath("/", "layout");
  redirect(qual === "configuracao" ? "/admin/configuracoes?ok=1" : "/admin/conteudo/textos?ok=1");
}
