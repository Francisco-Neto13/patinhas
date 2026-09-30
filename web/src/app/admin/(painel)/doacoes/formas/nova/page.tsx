import type { Metadata } from "next";
import * as organizacoes from "@/server/dados/organizacoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioForma } from "../../formularios";
import { salvarForma } from "../../actions";

export const metadata: Metadata = { title: "Nova forma de doação" };

export default async function PaginaNovaForma() {
  const opcoes = await organizacoes.opcoes();
  return (
    <>
      <CabecalhoPagina titulo="Nova forma de doação" />
      <FormularioForma acao={salvarForma.bind(null, null)} organizacoes={opcoes} />
    </>
  );
}
