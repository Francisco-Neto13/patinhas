"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as mensagens from "@/server/dados/mensagens";
import type { StatusMensagem } from "@/generated/prisma/enums";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function alterarStatusMensagem(id: string, status: StatusMensagem) {
  const r = await mensagens.alterarStatus(id, status);
  if (r.ok) revalidatePath("/admin", "layout");
}

export async function excluirMensagem(id: string): Promise<EstadoFormulario> {
  const r = await mensagens.excluir(id);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  redirect("/admin/mensagens?ok=excluida");
}
