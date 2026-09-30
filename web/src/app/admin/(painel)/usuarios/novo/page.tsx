import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/server/auth/sessao";
import * as organizacoes from "@/server/dados/organizacoes";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioUsuario } from "../formulario";
import { salvarUsuario } from "../actions";

export const metadata: Metadata = { title: "Cadastrar usuário" };

export default async function PaginaNovoUsuario() {
  await exigirAdminPatinhas();
  const opcoes = await organizacoes.opcoes();

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar usuário" descricao="Passe a senha para a pessoa por um canal seguro. Ela pode ser trocada depois." />
      <FormularioUsuario acao={salvarUsuario.bind(null, null)} organizacoes={opcoes ?? []} />
    </>
  );
}
