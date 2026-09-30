"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, podeUsarOrganizacao } from "@/lib/auth/permissoes";
import { registrarAtividade } from "@/lib/admin/atividade";
import {
  dataOpcional,
  errosDoZod,
  linkOpcional,
  paraNumeroBR,
  textoObrigatorio,
  textoOpcional,
  valoresDe,
  type EstadoFormulario,
} from "@/lib/admin/validacao";

const numeroOpcional = (rotulo: string) =>
  z.preprocess(
    paraNumeroBR,
    z.coerce.number({ error: `${rotulo}: use só números.` }).positive(`${rotulo} precisa ser maior que zero.`).max(99_999_999).nullable(),
  );

/**
 * Confere a organização escolhida (ou força a do admin de ONG). Mesma regra de
 * animais e necessidades: o destino tem de estar no escopo de quem salva.
 */
async function organizacaoValida(sessao: Awaited<ReturnType<typeof exigirSessao>>, enviada: unknown) {
  const id = sessao.organizacaoId ?? (typeof enviada === "string" ? enviada : "");
  if (!id || !podeUsarOrganizacao(sessao, id)) return null;
  return (await db.organizacao.findUnique({ where: { id }, select: { id: true } }))?.id ?? null;
}

// ---------------------------------------------------------------------------
// Formas de doação (seção 5.1): aparecem no site, no card da organização.
// ---------------------------------------------------------------------------

const esquemaForma = z.object({
  tipo: z.enum(["PIX", "VAQUINHA", "OUTRA_PLATAFORMA", "RACAO", "MEDICAMENTO", "OUTRO"], { error: "Escolha o tipo." }),
  titulo: textoObrigatorio("o título", 80),
  descricao: textoOpcional(400),
  link: linkOpcional,
  ordem: z.coerce.number({ error: "Use um número." }).int().min(0).max(999).default(0),
  ativa: z.preprocess((v) => v === "on", z.boolean()),
});

export async function salvarForma(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  if (id && !(await db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return { erroGeral: "Forma de doação não encontrada." };
  }

  const entrada = Object.fromEntries(dados);
  const r = esquemaForma.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);

  const organizacaoId = await organizacaoValida(sessao, entrada.organizacaoId);
  if (!organizacaoId) return { erros: { organizacaoId: ["Escolha a organização."] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) };

  // Vaquinha e "outra plataforma" sem link não levam a lugar nenhum.
  if ((r.data.tipo === "VAQUINHA" || r.data.tipo === "OUTRA_PLATAFORMA") && !r.data.link) {
    return { erros: { link: ["Informe o link da campanha."] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) };
  }

  const data = { ...r.data, organizacaoId };
  if (id) await db.formaDoacao.update({ where: { id }, data });
  else await db.formaDoacao.create({ data });

  revalidatePath("/");
  redirect("/admin/doacoes?ok=1");
}

export async function excluirForma(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const f = await db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!f) return { erroGeral: "Forma de doação não encontrada." };
  await db.formaDoacao.delete({ where: { id } });
  revalidatePath("/");
  redirect("/admin/doacoes?ok=1");
}

// ---------------------------------------------------------------------------
// Registros de doações informadas (seção 5.2): só no painel.
// ---------------------------------------------------------------------------

const esquemaRegistro = z.object({
  data: dataOpcional.refine((d) => d !== null, "Informe a data."),
  tipo: z.enum(["DINHEIRO", "RACAO", "MEDICAMENTO", "OUTRO"], { error: "Escolha o tipo." }),
  valor: numeroOpcional("O valor"),
  item: textoOpcional(120),
  quantidade: numeroOpcional("A quantidade"),
  unidade: textoOpcional(20),
  doador: textoOpcional(120),
  anonimo: z.preprocess((v) => v === "on", z.boolean()),
  observacao: textoOpcional(1000),
});

export async function salvarRegistro(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  if (id && !(await db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return { erroGeral: "Registro não encontrado." };
  }

  const entrada = Object.fromEntries(dados);
  const r = esquemaRegistro.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);
  const d = r.data;
  const falha = (campo: string, msg: string): EstadoFormulario => ({ erros: { [campo]: [msg] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) });

  const organizacaoId = await organizacaoValida(sessao, entrada.organizacaoId);
  if (!organizacaoId) return falha("organizacaoId", "Escolha a organização.");
  if (d.tipo === "DINHEIRO" && !d.valor) return falha("valor", "Informe o valor recebido.");
  if (d.tipo !== "DINHEIRO" && !d.item) return falha("item", "Informe o que foi doado.");
  // Doação anônima não guarda o nome, nem por engano: o campo é descartado.
  if (d.data && d.data > new Date(Date.now() + 24 * 3600 * 1000)) return falha("data", "A data não pode estar no futuro.");

  const salvar = { ...d, data: d.data!, doador: d.anonimo ? null : d.doador, organizacaoId };
  if (id) {
    await db.registroDoacao.update({ where: { id }, data: salvar });
  } else {
    await db.registroDoacao.create({ data: salvar });
    await registrarAtividade({ tipo: "doacao", descricao: "Nova doação registrada", usuarioId: sessao.usuarioId, organizacaoId });
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/doacoes/registros?ok=1");
}

export async function excluirRegistro(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const r = await db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!r) return { erroGeral: "Registro não encontrado." };
  await db.registroDoacao.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  redirect("/admin/doacoes/registros?ok=1");
}
