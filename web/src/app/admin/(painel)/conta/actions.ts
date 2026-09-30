"use server";

import { redirect } from "next/navigation";
import * as conta from "@/server/auth/conta";
import type { EstadoFormulario } from "@/lib/admin/formulario";

/** Troca da própria senha. Ver `conta.trocarSenha`. */
export async function trocarSenha(_a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const r = await conta.trocarSenha(dados);
  if (!r.ok) return r;
  redirect("/admin/conta?ok=1");
}
