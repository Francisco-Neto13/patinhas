import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioBanner } from "../formulario";
import { salvarBanner } from "../actions";

export const metadata: Metadata = { title: "Nova campanha" };

export default async function PaginaNovoBanner() {
  const sessao = await exigirSessao();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;
  return (
    <>
      <CabecalhoPagina titulo="Nova campanha" />
      <FormularioBanner acao={salvarBanner.bind(null, null)} organizacoes={organizacoes} />
    </>
  );
}
