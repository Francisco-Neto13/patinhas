"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { registrarAtividade } from "@/lib/admin/atividade";
import {
  dataOpcional,
  errosDoZod,
  imagemOpcional,
  linkOuAncoraOpcional,
  textoObrigatorio,
  textoOpcional,
  valoresDe,
  type EstadoFormulario,
} from "@/lib/admin/validacao";

const esquema = z.object({
  titulo: textoObrigatorio("o título", 100),
  descricao: textoOpcional(300),
  imagemUrl: imagemOpcional,
  link: linkOuAncoraOpcional,
  textoBotao: textoOpcional(40),
  ordem: z.coerce.number({ error: "Use um número." }).int().min(0).max(999).default(0),
  inicioEm: dataOpcional,
  fimEm: dataOpcional,
  status: z.enum(["ATIVO", "INATIVO"], { error: "Escolha o status." }),
});

/**
 * Banners da equipe Patinhas e campanhas das ONGs (seções 8 e 11.2).
 *
 * Mesmo isolamento de animais e necessidades: o admin de ONG só enxerga e só
 * grava campanhas da própria organização, e o `organizacaoId` que ele mandar
 * no POST é ignorado. Só a equipe Patinhas escolhe a organização, ou deixa em
 * branco para um banner do próprio Patinhas.
 */
export async function salvarBanner(id: string | null, _a: EstadoFormulario, dados: FormData): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  if (id && !(await db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } }))) {
    return { erroGeral: "Campanha não encontrada." };
  }

  const entrada = Object.fromEntries(dados);
  const r = esquema.safeParse(entrada);
  if (!r.success) return errosDoZod(r.error, dados);
  const d = r.data;

  const falha = (campo: string, msg: string): EstadoFormulario => ({
    erros: { [campo]: [msg] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados),
  });
  if (d.inicioEm && d.fimEm && d.fimEm < d.inicioEm) return falha("fimEm", "O fim precisa ser depois do início.");
  // Botão sem destino, ou destino sem texto de botão, vira um banner quebrado.
  if (d.link && !d.textoBotao) return falha("textoBotao", "Informe o texto do botão.");
  if (d.textoBotao && !d.link) return falha("link", "Informe para onde o botão leva.");

  let organizacaoId: string | null;
  if (ehAdminPatinhas(sessao)) {
    const escolhida = typeof entrada.organizacaoId === "string" ? entrada.organizacaoId : "";
    organizacaoId = escolhida || null;
    if (organizacaoId && !(await db.organizacao.findUnique({ where: { id: organizacaoId }, select: { id: true } }))) {
      return falha("organizacaoId", "Organização não encontrada.");
    }
  } else {
    organizacaoId = sessao.organizacaoId;
  }

  const data = { ...d, organizacaoId };
  if (id) {
    await db.banner.update({ where: { id }, data });
  } else {
    await db.banner.create({ data });
    await registrarAtividade({
      tipo: "banner",
      descricao: organizacaoId ? `Nova campanha publicada: ${d.titulo}` : `Novo banner publicado: ${d.titulo}`,
      usuarioId: sessao.usuarioId,
      organizacaoId,
    });
  }
  revalidatePath("/");
  revalidatePath("/admin", "layout");
  redirect("/admin/campanhas?ok=1");
}

export async function excluirBanner(id: string): Promise<EstadoFormulario> {
  const sessao = await exigirSessao();
  const b = await db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) }, select: { id: true } });
  if (!b) return { erroGeral: "Campanha não encontrada." };
  await db.banner.delete({ where: { id } });
  revalidatePath("/");
  redirect("/admin/campanhas?ok=1");
}
