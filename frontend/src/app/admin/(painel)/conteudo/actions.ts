"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { registrarAtividade } from "@/lib/admin/atividade";
import { GRUPOS_CONFIGURACAO, GRUPOS_CONTEUDO } from "@/lib/conteudo/campos";
import { validarCampo } from "@/lib/conteudo/validar";
import { valoresDe, type EstadoFormulario } from "@/lib/admin/validacao";

/**
 * Salva textos (`conteudo`) ou configurações (`configuracao`).
 *
 * `qual` vem do `.bind` e passou pelo navegador: só escolhe QUAL lista de
 * campos validar, e as duas pedem admin Patinhas. As chaves aceitas são SÓ as
 * do registro em campos.ts; qualquer outra chave enviada no POST é ignorada,
 * então ninguém cria no banco um "texto" que o site não previu.
 */
export async function salvarConteudo(
  qual: "conteudo" | "configuracao",
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirAdminPatinhas();
  const grupos = qual === "configuracao" ? GRUPOS_CONFIGURACAO : GRUPOS_CONTEUDO;
  const campos = grupos.flatMap((g) => g.campos);

  const erros: Record<string, string[]> = {};
  const gravar: { chave: string; valor: string }[] = [];
  const apagar: string[] = [];

  for (const campo of campos) {
    const bruto = dados.get(campo.chave);
    if (typeof bruto !== "string") continue;
    const r = validarCampo(campo, bruto);
    if (!r.ok) {
      erros[campo.chave] = [r.erro];
      continue;
    }
    // Em branco ou igual ao padrão: não guarda nada, e o site usa o padrão.
    // Assim, se o texto original mudar no código, quem nunca editou recebe o
    // novo automaticamente.
    if (r.valor === "" || r.valor === campo.padrao) apagar.push(campo.chave);
    else gravar.push({ chave: campo.chave, valor: r.valor });
  }

  if (Object.keys(erros).length > 0) {
    return { erros, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) };
  }

  // Tudo ou nada: metade dos textos salva e metade não deixaria a página
  // num estado que ninguém escreveu.
  await db.$transaction([
    db.conteudo.deleteMany({ where: { chave: { in: apagar } } }),
    ...gravar.map((g) => db.conteudo.upsert({ where: { chave: g.chave }, create: g, update: { valor: g.valor } })),
  ]);

  await registrarAtividade({
    tipo: "conteudo",
    descricao: qual === "configuracao" ? "Configurações gerais atualizadas" : "Textos do site atualizados",
    usuarioId: sessao.usuarioId,
  });

  // Textos e configurações aparecem em todas as páginas (topo e rodapé).
  revalidatePath("/", "layout");
  redirect(qual === "configuracao" ? "/admin/configuracoes?ok=1" : "/admin/conteudo/textos?ok=1");
}
