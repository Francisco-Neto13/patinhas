"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { errosDoZod, textoObrigatorio, type EstadoFormulario } from "@/lib/admin/validacao";

const esquema = z.object({
  pergunta: textoObrigatorio("a pergunta", 200),
  resposta: textoObrigatorio("a resposta", 2000),
  ordem: z.coerce.number({ error: "Use um número." }).int("Use um número inteiro.").min(0).max(999).default(0),
  ativa: z.preprocess((v) => v === "on", z.boolean()),
});

export async function salvarPergunta(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  await exigirAdminPatinhas();
  const r = esquema.safeParse(Object.fromEntries(dados));
  if (!r.success) return errosDoZod(r.error, dados);

  if (id) {
    const existe = await db.perguntaFrequente.findUnique({ where: { id }, select: { id: true } });
    if (!existe) return { erroGeral: "Pergunta não encontrada." };
    await db.perguntaFrequente.update({ where: { id }, data: r.data });
  } else {
    await db.perguntaFrequente.create({ data: r.data });
  }
  revalidatePath("/");
  redirect("/admin/conteudo/faq?ok=1");
}

export async function excluirPergunta(id: string): Promise<EstadoFormulario> {
  await exigirAdminPatinhas();
  await db.perguntaFrequente.deleteMany({ where: { id } });
  revalidatePath("/");
  redirect("/admin/conteudo/faq?ok=1");
}
