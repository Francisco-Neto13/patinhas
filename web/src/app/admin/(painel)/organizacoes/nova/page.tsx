import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioOrganizacao } from "../formulario";
import { salvarOrganizacao } from "../actions";

export const metadata: Metadata = { title: "Cadastrar organização" };

export default async function PaginaNovaOrganizacao() {
  const sessao = await exigirSessao();
  // A action recusa também; aqui é só para não mostrar um formulário inútil.
  if (!ehAdminPatinhas(sessao)) redirect("/admin/organizacoes");

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar organização" descricao="Começa como rascunho: só aparece no site depois de publicada." />
      <FormularioOrganizacao acao={salvarOrganizacao.bind(null, null)} podePublicar />
    </>
  );
}
