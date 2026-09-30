import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioPergunta } from "../formulario";
import { excluirPergunta, salvarPergunta } from "../actions";

export const metadata: Metadata = { title: "Editar pergunta" };

export default async function PaginaEditarPergunta({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdminPatinhas();
  const { id } = await params;
  const p = await db.perguntaFrequente.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <>
      <CabecalhoPagina titulo="Editar pergunta" />
      <FormularioPergunta acao={salvarPergunta.bind(null, p.id)} inicial={p} />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirPergunta.bind(null, p.id)} titulo="Excluir esta pergunta?" descricao="Ela sai da seção de perguntas frequentes do site. Não dá para desfazer. Para só esconder, desmarque Mostrar no site." />
      </section>
    </>
  );
}
