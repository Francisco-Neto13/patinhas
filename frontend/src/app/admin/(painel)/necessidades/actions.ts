"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, podeUsarOrganizacao } from "@/lib/auth/permissoes";
import { registrarAtividade } from "@/lib/admin/atividade";
import {
  errosDoZod,
  linkOpcional,
  paraNumeroBR,
  textoObrigatorio,
  textoOpcional,
  valoresDe,
  type EstadoFormulario,
} from "@/lib/admin/validacao";

const vazioParaNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const esquema = z.object({
  organizacaoId: z.string({ error: "Escolha a organização." }).min(1, "Escolha a organização."),
  tipo: z.enum(["RACAO", "MEDICAMENTO", "DINHEIRO", "LIMPEZA", "HIGIENE", "OUTROS"], { error: "Escolha o tipo." }),
  item: textoObrigatorio("o item", 120),
  descricao: textoOpcional(1000),
  // "2,5" é como se escreve número no Brasil; o `Number()` só entende "2.5".
  quantidade: z.preprocess(
    paraNumeroBR,
    z.coerce.number({ error: "Use só números." }).positive("A quantidade precisa ser maior que zero.").max(9_999_999, "Quantidade alta demais.").nullable(),
  ),
  unidade: textoOpcional(20),
  prioridade: z.enum(["NORMAL", "URGENTE"], { error: "Escolha a prioridade." }),
  status: z.enum(["ATIVA", "ATENDIDA", "INATIVA"], { error: "Escolha o status." }),
  validadeEm: z.preprocess(
    vazioParaNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")
      // Meio-dia no horário de Brasília: gravar meia-noite UTC fazia a data
      // aparecer um dia ANTES para quem está no Brasil (UTC-3).
      .transform((d) => new Date(`${d}T12:00:00-03:00`))
      .nullable(),
  ),
  linkAjuda: linkOpcional,
});

export async function salvarNecessidade(
  id: string | null,
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();

  let atual: { status: string; atendidaEm: Date | null } | null = null;
  if (id) {
    atual = await db.necessidade.findFirst({
      where: { id, ...escopoDaOrganizacao(sessao) },
      select: { status: true, atendidaEm: true },
    });
    if (!atual) return { erroGeral: "Necessidade não encontrada." };
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquema.safeParse({ ...entrada, organizacaoId: sessao.organizacaoId ?? entrada.organizacaoId });
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;

  if (!podeUsarOrganizacao(sessao, d.organizacaoId)) return { erroGeral: "Organização inválida." };
  if (!(await db.organizacao.findUnique({ where: { id: d.organizacaoId }, select: { id: true } }))) {
    return { erros: { organizacaoId: ["Organização não encontrada."] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) };
  }

  // Guarda QUANDO foi atendida (histórico, seção 4.3). Voltar para ativa limpa.
  const atendidaEm = d.status === "ATENDIDA" ? (atual?.atendidaEm ?? new Date()) : null;

  const salva = id
    ? await db.necessidade.update({ where: { id }, data: { ...d, atendidaEm }, select: { id: true, item: true, organizacaoId: true } })
    : await db.necessidade.create({ data: { ...d, atendidaEm }, select: { id: true, item: true, organizacaoId: true } });

  await registrarAtividade({
    tipo: "necessidade",
    descricao: id ? `Necessidade "${salva.item}" foi atualizada` : `Nova necessidade cadastrada: ${salva.item}`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salva.organizacaoId,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(`/admin/necessidades?ok=${id ? "salva" : "criada"}`);
}

/** Atalho da lista: marca como atendida sem abrir o formulário. */
export async function marcarAtendida(id: string) {
  const sessao = await exigirSessao();
  const n = await db.necessidade.findFirst({
    where: { id, ...escopoDaOrganizacao(sessao) },
    select: { item: true, organizacaoId: true, status: true },
  });
  if (!n || n.status === "ATENDIDA") return;

  await db.necessidade.update({ where: { id }, data: { status: "ATENDIDA", atendidaEm: new Date() } });
  await registrarAtividade({
    tipo: "necessidade",
    descricao: `Necessidade "${n.item}" foi atendida`,
    usuarioId: sessao.usuarioId,
    organizacaoId: n.organizacaoId,
  });
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

export async function excluirNecessidade(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const n = await db.necessidade.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { item: true } });
  if (!n) return { erroGeral: "Necessidade não encontrada." };

  await db.necessidade.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/necessidades?ok=excluida");
}
