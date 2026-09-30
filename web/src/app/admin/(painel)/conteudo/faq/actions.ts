"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as conteudo from "@/server/dados/conteudo";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function salvarPergunta(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await conteudo.salvarPergunta(id, dados);
  if (!r.ok) return r;
  revalidatePath("/");
  redirect("/admin/conteudo/faq?ok=1");
}

export async function excluirPergunta(id: string): Promise<EstadoFormulario> {
  const r = await conteudo.excluirPergunta(id);
  if (!r.ok) return r;
  revalidatePath("/");
  redirect("/admin/conteudo/faq?ok=1");
}
