import type { Metadata } from "next";
import * as organizacoes from "@/server/dados/organizacoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioBanner } from "../formulario";
import { salvarBanner } from "../actions";

export const metadata: Metadata = { title: "Nova campanha" };

export default async function PaginaNovoBanner() {
  const opcoes = await organizacoes.opcoes();
  return (
    <>
      <CabecalhoPagina titulo="Nova campanha" />
      <FormularioBanner acao={salvarBanner.bind(null, null)} organizacoes={opcoes} />
    </>
  );
}
