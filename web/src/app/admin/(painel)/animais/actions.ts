"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as animais from "@/server/dados/animais";
import type { EstadoFormulario } from "@/lib/admin/formulario";

// Sessão, isolamento entre ONGs, validação e banco ficam em `server/dados/animais`.

export async function salvarAnimal(id: string | null, _anterior: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await animais.salvar(id, dados);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(`/admin/animais?ok=${id ? "salvo" : "criado"}`);
}

export async function excluirAnimal(id: string): Promise<EstadoFormulario> {
  const r = await animais.excluir(id);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/animais?ok=excluido");
}
