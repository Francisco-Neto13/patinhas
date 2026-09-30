import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioNecessidade } from "../formulario";
import { salvarNecessidade } from "../actions";

export const metadata: Metadata = { title: "Cadastrar necessidade" };

export default async function PaginaNovaNecessidade() {
  const sessao = await exigirSessao();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar necessidade" />
      <FormularioNecessidade acao={salvarNecessidade.bind(null, null)} organizacoes={organizacoes} />
    </>
  );
}
