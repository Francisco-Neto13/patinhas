"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDeOrganizacoes, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { registrarAtividade } from "@/lib/admin/atividade";
import { reconhecerChavePix } from "@/lib/pix";
import {
  errosDoZod,
  galeria,
  imagemOpcional,
  instagramOpcional,
  linkOpcional,
  textoObrigatorio,
  textoOpcional,
  todos,
  UFS,
  whatsappOpcional,
  type EstadoFormulario,
} from "@/lib/admin/validacao";

const esquema = z.object({
  nome: textoObrigatorio("o nome da organização", 120),
  tipo: z.enum(["ONG", "ABRIGO", "PROTETOR_INDEPENDENTE", "PROJETO"], { error: "Escolha o tipo." }),
  status: z.enum(["PUBLICADA", "RASCUNHO", "INATIVA"], { error: "Escolha o status." }),
  descricaoCurta: textoObrigatorio("uma descrição curta", 280),
  descricaoCompleta: textoOpcional(5000),
  cidade: textoObrigatorio("a cidade", 80),
  estado: z.enum(UFS, { error: "Escolha o estado." }),
  endereco: textoOpcional(200),
  capaUrl: imagemOpcional,
  galeria,
  /*
   * A chave é reconhecida (CPF, CNPJ, e-mail, celular ou aleatória) e gravada
   * normalizada. Chave inválida precisa ser barrada AQUI: o QR Code é gerado
   * a partir dela, e um QR de chave errada leva a doação para lugar nenhum,
   * ou para outra pessoa.
   */
  chavePix: textoOpcional(140).transform((v, ctx) => {
    if (v === null) return null;
    const r = reconhecerChavePix(v);
    if (!r) {
      ctx.addIssue({ code: "custom", message: "Chave PIX inválida. Use CPF, CNPJ, e-mail, celular com DDD ou a chave aleatória." });
      return z.NEVER;
    }
    return r.chave;
  }),
  linkDoacao: linkOpcional,
  whatsapp: whatsappOpcional,
  instagram: instagramOpcional,
  facebook: linkOpcional,
  site: linkOpcional,
});

/**
 * Cria (`id` nulo) ou edita uma organização.
 *
 * O `id` chega pelo `.bind` da página, e por isso passou pelo navegador: NÃO é
 * confiável. Ele é só a referência de qual registro editar; se o usuário pode
 * editá-lo é decidido de novo aqui, pelo escopo da sessão.
 */
export async function salvarOrganizacao(
  id: string | null,
  _anterior: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();

  // Seção 2.3: quem decide QUAIS organizações existem é a equipe Patinhas.
  // O admin de ONG só edita a própria.
  if (!id && !ehAdminPatinhas(sessao)) {
    return { erroGeral: "Só a equipe Patinhas cadastra novas organizações." };
  }

  let atual: { status: "PUBLICADA" | "RASCUNHO" | "INATIVA" } | null = null;
  if (id) {
    atual = await db.organizacao.findFirst({
      where: { id, ...escopoDeOrganizacoes(sessao) },
      select: { status: true },
    });
    if (!atual) return { erroGeral: "Organização não encontrada." };
  }

  const entrada = Object.fromEntries(dados);
  const resultado = esquema.safeParse({
    ...entrada,
    galeria: todos(dados, "galeria"),
    // Admin de ONG não vê o campo de status: a publicação é decisão da equipe
    // Patinhas. O valor atual é mantido, e qualquer "status" forjado no POST é
    // ignorado aqui.
    status: ehAdminPatinhas(sessao) ? entrada.status : (atual?.status ?? "RASCUNHO"),
  });
  if (!resultado.success) return errosDoZod(resultado.error, dados);

  const d = resultado.data;
  const salva = id
    ? await db.organizacao.update({ where: { id }, data: d, select: { id: true, nome: true } })
    : await db.organizacao.create({ data: d, select: { id: true, nome: true } });

  await registrarAtividade({
    tipo: "organizacao",
    descricao: id ? `${salva.nome} foi atualizada` : `${salva.nome} foi cadastrada`,
    usuarioId: sessao.usuarioId,
    organizacaoId: salva.id,
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/"); // o site público lista as organizações publicadas
  redirect(`/admin/organizacoes?ok=${id ? "salva" : "criada"}`);
}

/**
 * Exclui uma organização, só se ela não tiver animais nem necessidades.
 *
 * Seção 2.2 pede "excluir OU desativar". Apagar uma ONG com animais apagaria
 * junto o histórico deles; o banco recusa (`onDelete: Restrict`), e a tela
 * orienta a desativar, que tira do site sem perder nada.
 */
export async function excluirOrganizacao(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  if (!ehAdminPatinhas(sessao)) return { erroGeral: "Só a equipe Patinhas exclui organizações." };

  const org = await db.organizacao.findUnique({
    where: { id },
    select: { nome: true, _count: { select: { animais: true, necessidades: true } } },
  });
  if (!org) return { erroGeral: "Organização não encontrada." };

  if (org._count.animais > 0 || org._count.necessidades > 0) {
    return {
      erroGeral: `${org.nome} tem ${org._count.animais} animal(is) e ${org._count.necessidades} necessidade(s) cadastrados. Mude o status para "Inativa": ela sai do site e nada se perde.`,
    };
  }

  await db.organizacao.delete({ where: { id } });
  await registrarAtividade({ tipo: "organizacao", descricao: `${org.nome} foi excluída`, usuarioId: sessao.usuarioId });

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  redirect("/admin/organizacoes?ok=excluida");
}
