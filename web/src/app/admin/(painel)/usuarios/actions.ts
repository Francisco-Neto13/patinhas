"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as usuarios from "@/server/dados/usuarios";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function salvarUsuario(id: string | null, _anterior: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await usuarios.salvar(id, dados);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  redirect(`/admin/usuarios?ok=${id ? "salvo" : "criado"}`);
}
