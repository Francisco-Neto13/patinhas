"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as organizacoes from "@/server/dados/organizacoes";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function salvarOrganizacao(id: string | null, _anterior: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await organizacoes.salvar(id, dados);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/"); // o site público lista as organizações publicadas
  redirect(`/admin/organizacoes?ok=${id ? "salva" : "criada"}`);
}

export async function excluirOrganizacao(id: string): Promise<EstadoFormulario> {
  const r = await organizacoes.excluir(id);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/organizacoes?ok=excluida");
}
