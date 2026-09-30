import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as necessidades from "@/server/dados/necessidades";
import * as organizacoes from "@/server/dados/organizacoes";
import { formatarData } from "@/lib/admin/rotulos";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioNecessidade } from "../formulario";
import { excluirNecessidade, salvarNecessidade } from "../actions";

export const metadata: Metadata = { title: "Editar necessidade" };

/** "YYYY-MM-DD" no fuso de Brasília, que é o que o <input type="date"> espera. */
const paraCampoData = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

export default async function PaginaEditarNecessidade({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [n, opcoes] = await Promise.all([necessidades.buscar(id), organizacoes.opcoes()]);
  if (!n) notFound();

  return (
    <>
      <CabecalhoPagina
        titulo={n.item}
        descricao={`Cadastrada em ${formatarData(n.criadoEm)}${n.atendidaEm ? ` · atendida em ${formatarData(n.atendidaEm)}` : ""}`}
      />
      <FormularioNecessidade
        acao={salvarNecessidade.bind(null, n.id)}
        organizacoes={opcoes}
        inicial={{
          ...n,
          // ⚠️ `Decimal` do Prisma é uma classe: não atravessa para Client
          // Component. Vai como texto, com vírgula, que é como se digita.
          quantidade: n.quantidade ? n.quantidade.toString().replace(".", ",") : null,
          validadeEm: n.validadeEm ? paraCampoData(n.validadeEm) : null,
        }}
      />

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="zona-exclusao">
        <h2 id="zona-exclusao" className="font-heading text-xl font-semibold text-brown-dark">
          Excluir necessidade
        </h2>
        <p className="mt-1 mb-4 text-sm text-taupe">
          Apaga do histórico. Para tirar do site mantendo o registro, marque como Atendida ou Inativa.
        </p>
        <BotaoExcluir acao={excluirNecessidade.bind(null, n.id)} titulo="Excluir esta necessidade?" descricao={`"${n.item}" sai do painel e do site. Não dá para desfazer. Se ela foi atendida, marque como Atendida: assim ela conta nos números.`} />
      </section>
    </>
  );
}
