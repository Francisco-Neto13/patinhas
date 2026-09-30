import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioForma } from "../../formularios";
import { excluirForma, salvarForma } from "../../actions";

export const metadata: Metadata = { title: "Editar forma de doação" };

export default async function PaginaEditarForma({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirSessao();
  const { id } = await params;
  const f = await db.formaDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
  if (!f) notFound();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;

  return (
    <>
      <CabecalhoPagina titulo={f.titulo} descricao="Editar forma de doação." />
      <FormularioForma acao={salvarForma.bind(null, f.id)} inicial={{ ...f, ordem: String(f.ordem) }} organizacoes={organizacoes} />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirForma.bind(null, f.id)} titulo="Excluir esta forma de doação?" descricao={`"${f.titulo}" sai do card da organização no site. Não dá para desfazer. Para só esconder, desmarque Mostrar no site.`} />
      </section>
    </>
  );
}
