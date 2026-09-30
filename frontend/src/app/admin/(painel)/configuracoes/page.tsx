import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { GRUPOS_CONFIGURACAO } from "@/lib/conteudo/campos";
import { AvisoOk, CabecalhoPagina } from "@/components/admin/ui";
import { FormularioConteudo } from "@/components/admin/formulario-conteudo";
import { salvarConteudo } from "../conteudo/actions";

export const metadata: Metadata = { title: "Configurações" };

export default async function PaginaConfiguracoes({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await exigirAdminPatinhas();
  const { ok } = await searchParams;
  const salvos = await db.conteudo.findMany({ where: { chave: { startsWith: "config." } } });

  return (
    <>
      <CabecalhoPagina titulo="Configurações" descricao="Nome, logo e canais de contato que aparecem em todo o site." />
      <AvisoOk texto={ok ? "Configurações salvas." : null} />
      <FormularioConteudo
        acao={salvarConteudo.bind(null, "configuracao")}
        grupos={GRUPOS_CONFIGURACAO}
        valores={Object.fromEntries(salvos.map((s) => [s.chave, s.valor]))}
      />
    </>
  );
}
