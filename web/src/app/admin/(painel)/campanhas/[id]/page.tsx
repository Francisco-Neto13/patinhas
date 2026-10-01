import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as campanhas from "@/server/dados/campanhas";
import * as organizacoes from "@/server/dados/organizacoes";
import { paraCampoData } from "@/lib/admin/formulario";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { exclusao } from "@/lib/admin/exclusao";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioBanner } from "../formulario";
import { excluirBanner, salvarBanner } from "../actions";

export const metadata: Metadata = { title: "Editar campanha" };

export default async function PaginaEditarBanner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [b, opcoes] = await Promise.all([campanhas.buscar(id), organizacoes.opcoes()]);
  if (!b) notFound();

  return (
    <>
      <CabecalhoPagina titulo={b.titulo} descricao="Editar campanha." />
      <FormularioBanner
        acao={salvarBanner.bind(null, b.id)}
        inicial={{ ...b, ordem: String(b.ordem), inicioEm: paraCampoData(b.inicioEm), fimEm: paraCampoData(b.fimEm) }}
        organizacoes={opcoes}
      />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirBanner.bind(null, b.id)} {...exclusao.campanha(b.titulo)} />
      </section>
    </>
  );
}
