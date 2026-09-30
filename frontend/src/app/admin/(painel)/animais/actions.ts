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
  galeria,
  imagemOpcional,
  linkOpcional,
  textoObrigatorio,
  textoOpcional,
  todos,
  valoresDe,
  type EstadoFormulario,
} from "@/lib/admin/validacao";

const vazioParaNull = (v: unknown) => (v === "" ? null : v);

const esquema = z.object({
  nome: textoObrigatorio("o nome do animal", 80),
  organizacaoId: z.string({ error: "Escolha a organização responsável." }).min(1, "Escolha a organização responsável."),
  status: z.enum(["DISPONIVEL", "EM_ADOCAO", "ADOTADO", "INATIVO"], { error: "Escolha o status." }),
  sexo: z.enum(["MACHO", "FEMEA", "NAO_INFORMADO"], { error: "Escolha o sexo." }),
  porte: z.preprocess(vazioParaNull, z.enum(["PEQUENO", "MEDIO", "GRANDE"]).nullable()),
  idade: textoOpcional(30),
  raca: textoOpcional(60),
  cidade: textoOpcional(80),
  descricao: textoOpcional(3000),
  fotoUrl: imagemOpcional,
  galeria,
  linkAdocao: linkOpcional,
});

export async function salvarAnimal(
  id: string | null,
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();

  if (id) {
    const existe = await db.animal.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
    if (!existe) return { erroGeral: "Animal não encontrado." };
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquema.safeParse({
    ...entrada,
    galeria: todos(dados, "galeria"),
    // Admin de ONG não escolhe organização: o animal é sempre da dele. Um
    // `organizacaoId` de outra ONG forjado no POST é descartado aqui.
    organizacaoId: sessao.organizacaoId ?? entrada.organizacaoId,
  });
  if (!resultado.success) return errosDoZod(resultado.error, dados);
  const d = resultado.data;

  /*
   * ⚠️ Segunda checagem, sobre o DESTINO. A primeira (acima) garante que o
   * animal que está sendo editado é acessível. Esta garante que ele não está
   * sendo MOVIDO para uma organização inacessível.
   */
  if (!podeUsarOrganizacao(sessao, d.organizacaoId)) return { erroGeral: "Organização inválida." };
  const orgExiste = await db.organizacao.findUnique({ where: { id: d.organizacaoId }, select: { id: true } });
  if (!orgExiste) {
    return {
      erros: { organizacaoId: ["Organização não encontrada."] },
      erroGeral: "Confira os campos destacados.",
      valores: valoresDe(dados),
    };
  }

  const salvo = id
    ? await db.animal.update({ where: { id }, data: d, select: { id: true, nome: true, organizacaoId: true } })
    : await db.animal.create({ data: d, select: { id: true, nome: true, organizacaoId: true } });

  await registrarAtividade({
    tipo: "animal",
    descricao: id ? `${salvo.nome} foi atualizado` : `${salvo.nome} foi adicionado`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salvo.organizacaoId,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect(`/admin/animais?ok=${id ? "salvo" : "criado"}`);
}

export async function excluirAnimal(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const animal = await db.animal.findFirst({
    where: { id, ...escopoDaOrganizacao(sessao) },
    select: { nome: true, organizacaoId: true },
  });
  if (!animal) return { erroGeral: "Animal não encontrado." };

  await db.animal.delete({ where: { id } });
  await registrarAtividade({
    tipo: "animal",
    descricao: `${animal.nome} foi removido`,
    usuarioId: sessao.usuarioId,
    organizacaoId: animal.organizacaoId,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/animais?ok=excluido");
}
