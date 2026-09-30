"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import type { StatusMensagem } from "@/generated/prisma/enums";
import type { EstadoFormulario } from "@/lib/admin/validacao";

const VALIDOS: StatusMensagem[] = ["NAO_LIDA", "LIDA", "RESPONDIDA", "ARQUIVADA"];

export async function alterarStatusMensagem(id: string, status: StatusMensagem) {
  await exigirAdminPatinhas();
  // `status` também vem do cliente pelo `.bind`: só um dos quatro passa.
  if (!VALIDOS.includes(status)) return;
  await db.mensagem.updateMany({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function excluirMensagem(id: string): Promise<EstadoFormulario> {
  await exigirAdminPatinhas();
  await db.mensagem.deleteMany({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/mensagens?ok=excluida");
}
