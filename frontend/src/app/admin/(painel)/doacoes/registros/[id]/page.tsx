import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { paraCampoData } from "@/lib/admin/validacao";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioRegistro } from "../../formularios";
import { excluirRegistro, salvarRegistro } from "../../actions";

export const metadata: Metadata = { title: "Editar registro de doação" };

/** `Decimal` não atravessa para Client Component: vira texto com vírgula. */
const texto = (d: { toString(): string } | null) => (d ? d.toString().replace(".", ",") : null);

export default async function PaginaEditarRegistro({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirSessao();
  const { id } = await params;
  const r = await db.registroDoacao.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
  if (!r) notFound();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;

  return (
    <>
      <CabecalhoPagina titulo="Editar registro de doação" />
      <FormularioRegistro
        acao={salvarRegistro.bind(null, r.id)}
        organizacoes={organizacoes}
        inicial={{ ...r, data: paraCampoData(r.data), valor: texto(r.valor), quantidade: texto(r.quantidade) }}
      />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirRegistro.bind(null, r.id)} titulo="Excluir este registro de doação?" descricao="O registro some do controle interno e dos totais. Não dá para desfazer." />
      </section>
    </>
  );
}
