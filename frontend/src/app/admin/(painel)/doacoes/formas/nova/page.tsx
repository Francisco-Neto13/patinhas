import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioForma } from "../../formularios";
import { salvarForma } from "../../actions";

export const metadata: Metadata = { title: "Nova forma de doação" };

export default async function PaginaNovaForma() {
  const sessao = await exigirSessao();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;
  return (
    <>
      <CabecalhoPagina titulo="Nova forma de doação" />
      <FormularioForma acao={salvarForma.bind(null, null)} organizacoes={organizacoes} />
    </>
  );
}
