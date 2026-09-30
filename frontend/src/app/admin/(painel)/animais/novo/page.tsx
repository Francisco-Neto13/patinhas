import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioAnimal } from "../formulario";
import { salvarAnimal } from "../actions";

export const metadata: Metadata = { title: "Cadastrar animal" };

export default async function PaginaNovoAnimal() {
  const sessao = await exigirSessao();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar animal" />
      <FormularioAnimal acao={salvarAnimal.bind(null, null)} organizacoes={organizacoes} />
    </>
  );
}
