import type { Metadata } from "next";
import * as organizacoes from "@/server/dados/organizacoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioNecessidade } from "../formulario";
import { salvarNecessidade } from "../actions";

export const metadata: Metadata = { title: "Cadastrar necessidade" };

export default async function PaginaNovaNecessidade() {
  const opcoes = await organizacoes.opcoes();

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar necessidade" />
      <FormularioNecessidade acao={salvarNecessidade.bind(null, null)} organizacoes={opcoes} />
    </>
  );
}
