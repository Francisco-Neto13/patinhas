"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as necessidades from "@/server/dados/necessidades";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function salvarNecessidade(id: string | null, _anterior: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await necessidades.salvar(id, dados);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(`/admin/necessidades?ok=${id ? "salva" : "criada"}`);
}

/** Atalho da lista: marca como atendida sem abrir o formulário. */
export async function marcarAtendida(id: string) {
  const r = await necessidades.marcarAtendida(id);
  if (!r.ok) return;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

export async function excluirNecessidade(id: string): Promise<EstadoFormulario> {
  const r = await necessidades.excluir(id);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/necessidades?ok=excluida");
}
