import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { GRUPOS_CONTEUDO } from "@/lib/conteudo/campos";
import { AvisoOk, CabecalhoPagina } from "@/components/admin/ui";
import { FormularioConteudo } from "@/components/admin/formulario-conteudo";
import { salvarConteudo } from "../actions";

export const metadata: Metadata = { title: "Textos do site" };

export default async function PaginaTextos({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await exigirAdminPatinhas();
  const { ok } = await searchParams;
  const salvos = await db.conteudo.findMany({ where: { chave: { not: { startsWith: "config." } } } });

  return (
    <>
      <CabecalhoPagina titulo="Página inicial e textos" descricao="Os textos de cada seção do site. Campo em branco volta ao texto original." />
      <AvisoOk texto={ok ? "Textos salvos. O site já mostra a nova versão." : null} />
      <FormularioConteudo
        acao={salvarConteudo.bind(null, "conteudo")}
        grupos={GRUPOS_CONTEUDO}
        valores={Object.fromEntries(salvos.map((s) => [s.chave, s.valor]))}
      />
    </>
  );
}
