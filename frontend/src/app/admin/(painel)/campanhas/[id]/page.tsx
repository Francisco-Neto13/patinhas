import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { paraCampoData } from "@/lib/admin/validacao";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioBanner } from "../formulario";
import { excluirBanner, salvarBanner } from "../actions";

export const metadata: Metadata = { title: "Editar campanha" };

export default async function PaginaEditarBanner({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirSessao();
  const { id } = await params;
  const b = await db.banner.findFirst({ where: { id, ...escopoDaOrganizacao(sessao) } });
  if (!b) notFound();
  const organizacoes = ehAdminPatinhas(sessao)
    ? await db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
    : null;

  return (
    <>
      <CabecalhoPagina titulo={b.titulo} descricao="Editar campanha." />
      <FormularioBanner
        acao={salvarBanner.bind(null, b.id)}
        inicial={{ ...b, ordem: String(b.ordem), inicioEm: paraCampoData(b.inicioEm), fimEm: paraCampoData(b.fimEm) }}
        organizacoes={organizacoes}
      />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirBanner.bind(null, b.id)} titulo="Excluir esta campanha?" descricao={`"${b.titulo}" sai do site e do painel. Não dá para desfazer. Para só pausar, mude o status para Inativo.`} />
      </section>
    </>
  );
}
