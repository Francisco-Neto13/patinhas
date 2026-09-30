import type { Metadata } from "next";
import * as organizacoes from "@/server/dados/organizacoes";
import { paraCampoData } from "@/lib/admin/formulario";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioRegistro } from "../../formularios";
import { salvarRegistro } from "../../actions";

export const metadata: Metadata = { title: "Registrar doação" };

export default async function PaginaNovoRegistro() {
  const opcoes = await organizacoes.opcoes();
  return (
    <>
      <CabecalhoPagina titulo="Registrar doação" />
      <FormularioRegistro
        acao={salvarRegistro.bind(null, null)}
        organizacoes={opcoes}
        // Hoje já preenchido: é o caso mais comum.
        inicial={{ organizacaoId: "", data: paraCampoData(new Date()), tipo: "", valor: null, item: null, quantidade: null, unidade: null, doador: null, anonimo: false, observacao: null }}
      />
    </>
  );
}
