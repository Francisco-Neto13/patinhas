"use server";

import { redirect } from "next/navigation";
import * as conta from "@/server/auth/conta";
import { encerrarSessao } from "@/server/auth/sessao";

export type EstadoLogin = { erro?: string; email?: string };

export async function entrar(_anterior: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const email = String(dados.get("email") ?? "");
  const erro = await conta.entrar(email, String(dados.get("senha") ?? ""));
  if (erro) return { erro, email: email.trim().toLowerCase().slice(0, 200) };
  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}
