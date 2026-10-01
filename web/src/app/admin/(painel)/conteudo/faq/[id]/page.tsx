import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as conteudo from "@/server/dados/conteudo";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { exclusao } from "@/lib/admin/exclusao";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioPergunta } from "../formulario";
import { excluirPergunta, salvarPergunta } from "../actions";

export const metadata: Metadata = { title: "Editar pergunta" };

export default async function PaginaEditarPergunta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await conteudo.buscarPergunta(id);
  if (!p) notFound();

  return (
    <>
      <CabecalhoPagina titulo="Editar pergunta" />
      <FormularioPergunta acao={salvarPergunta.bind(null, p.id)} inicial={p} />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirPergunta.bind(null, p.id)} {...exclusao.pergunta()} />
      </section>
    </>
  );
}
