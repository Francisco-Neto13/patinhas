import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as doacoes from "@/server/dados/doacoes";
import * as organizacoes from "@/server/dados/organizacoes";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioForma } from "../../formularios";
import { excluirForma, salvarForma } from "../../actions";

export const metadata: Metadata = { title: "Editar forma de doação" };

export default async function PaginaEditarForma({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [f, opcoes] = await Promise.all([doacoes.buscarForma(id), organizacoes.opcoes()]);
  if (!f) notFound();

  return (
    <>
      <CabecalhoPagina titulo={f.titulo} descricao="Editar forma de doação." />
      <FormularioForma acao={salvarForma.bind(null, f.id)} inicial={{ ...f, ordem: String(f.ordem) }} organizacoes={opcoes} />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirForma.bind(null, f.id)} titulo="Excluir esta forma de doação?" descricao={`"${f.titulo}" sai do card da organização no site. Não dá para desfazer. Para só esconder, desmarque Mostrar no site.`} />
      </section>
    </>
  );
}
