"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as campanhas from "@/server/dados/campanhas";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export async function salvarBanner(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await campanhas.salvar(id, dados);
  if (!r.ok) return r;
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  redirect("/admin/campanhas?ok=1");
}

export async function excluirBanner(id: string): Promise<EstadoFormulario> {
  const r = await campanhas.excluir(id);
  if (!r.ok) return r;
  revalidatePath("/");
  redirect("/admin/campanhas?ok=1");
}
