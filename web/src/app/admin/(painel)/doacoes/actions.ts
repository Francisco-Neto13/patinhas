"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as doacoes from "@/server/dados/doacoes";
import type { EstadoFormulario } from "@/lib/admin/formulario";

// Formas de doação aparecem no site; registros ficam só no painel.

export async function salvarForma(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await doacoes.salvarForma(id, dados);
  if (!r.ok) return r;
  revalidatePath("/");
  redirect("/admin/doacoes?ok=1");
}

export async function excluirForma(id: string): Promise<EstadoFormulario> {
  const r = await doacoes.excluirForma(id);
  if (!r.ok) return r;
  revalidatePath("/");
  redirect("/admin/doacoes?ok=1");
}

export async function salvarRegistro(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await doacoes.salvarRegistro(id, dados);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  redirect("/admin/doacoes/registros?ok=1");
}

export async function excluirRegistro(id: string): Promise<EstadoFormulario> {
  const r = await doacoes.excluirRegistro(id);
  if (!r.ok) return r;
  revalidatePath("/admin", "layout");
  redirect("/admin/doacoes/registros?ok=1");
}
