import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { paraCampoData } from "@/lib/admin/validacao";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioRegistro } from "../../formularios";
import { salvarRegistro } from "../../actions";

export const metadata: Metadata = { title: "Registrar doação" };

export default async function PaginaNovoRegistro() {
  const sessao = await exigirSessao();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;
  return (
    <>
      <CabecalhoPagina titulo="Registrar doação" />
      <FormularioRegistro
        acao={salvarRegistro.bind(null, null)}
        organizacoes={organizacoes}
        // Hoje já preenchido: é o caso mais comum.
        inicial={{ organizacaoId: "", data: paraCampoData(new Date()), tipo: "", valor: null, item: null, quantidade: null, unidade: null, doador: null, anonimo: false, observacao: null }}
      />
    </>
  );
}
