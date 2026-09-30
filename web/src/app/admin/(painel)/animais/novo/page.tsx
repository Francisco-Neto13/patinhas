import type { Metadata } from "next";
import * as organizacoes from "@/server/dados/organizacoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioAnimal } from "../formulario";
import { salvarAnimal } from "../actions";

export const metadata: Metadata = { title: "Cadastrar animal" };

export default async function PaginaNovoAnimal() {
  const opcoes = await organizacoes.opcoes();

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar animal" />
      <FormularioAnimal acao={salvarAnimal.bind(null, null)} organizacoes={opcoes} />
    </>
  );
}
