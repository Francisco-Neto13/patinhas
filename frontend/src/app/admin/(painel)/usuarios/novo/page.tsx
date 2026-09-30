import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioUsuario } from "../formulario";
import { salvarUsuario } from "../actions";

export const metadata: Metadata = { title: "Cadastrar usuário" };

export default async function PaginaNovoUsuario() {
  await exigirAdminPatinhas();
  const organizacoes = await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });

  return (
    <>
      <CabecalhoPagina titulo="Cadastrar usuário" descricao="Passe a senha para a pessoa por um canal seguro. Ela pode ser trocada depois." />
      <FormularioUsuario acao={salvarUsuario.bind(null, null)} organizacoes={organizacoes} />
    </>
  );
}
