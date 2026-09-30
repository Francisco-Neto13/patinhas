import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioPergunta } from "../formulario";
import { salvarPergunta } from "../actions";

export const metadata: Metadata = { title: "Nova pergunta" };

export default async function PaginaNovaPergunta() {
  await exigirAdminPatinhas();
  return (
    <>
      <CabecalhoPagina titulo="Nova pergunta" />
      <FormularioPergunta acao={salvarPergunta.bind(null, null)} />
    </>
  );
}
