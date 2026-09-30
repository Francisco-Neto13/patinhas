import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as doacoes from "@/server/dados/doacoes";
import * as organizacoes from "@/server/dados/organizacoes";
import { paraCampoData } from "@/lib/admin/formulario";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioRegistro } from "../../formularios";
import { excluirRegistro, salvarRegistro } from "../../actions";

export const metadata: Metadata = { title: "Editar registro de doação" };

/** `Decimal` não atravessa para Client Component: vira texto com vírgula. */
const texto = (d: { toString(): string } | null) => (d ? d.toString().replace(".", ",") : null);

export default async function PaginaEditarRegistro({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [r, opcoes] = await Promise.all([doacoes.buscarRegistro(id), organizacoes.opcoes()]);
  if (!r) notFound();

  return (
    <>
      <CabecalhoPagina titulo="Editar registro de doação" />
      <FormularioRegistro
        acao={salvarRegistro.bind(null, r.id)}
        organizacoes={opcoes}
        inicial={{ ...r, data: paraCampoData(r.data), valor: texto(r.valor), quantidade: texto(r.quantidade) }}
      />
      <section className="mt-10 border-t border-border pt-6">
        <BotaoExcluir acao={excluirRegistro.bind(null, r.id)} titulo="Excluir este registro de doação?" descricao="O registro some do controle interno e dos totais. Não dá para desfazer." />
      </section>
    </>
  );
}
