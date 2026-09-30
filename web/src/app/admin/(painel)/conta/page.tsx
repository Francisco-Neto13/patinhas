import type { Metadata } from "next";
import { exigirSessao } from "@/server/auth/sessao";
import { PAPEL } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina } from "@/components/admin/ui";
import { ControlesAcessibilidade } from "@/components/acessibilidade/controles";
import { FormularioSenha } from "./formulario";

export const metadata: Metadata = { title: "Minha conta" };

export default async function PaginaConta({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirSessao();
  const { ok } = await searchParams;

  return (
    <>
      <CabecalhoPagina titulo="Minha conta" />
      <AvisoOk texto={ok ? "Senha trocada. As sessões abertas em outros dispositivos foram encerradas." : null} />
      <dl className="mb-6 grid gap-3 rounded-[1.25rem] border border-border bg-bone p-6 text-sm shadow-sm sm:grid-cols-3">
        <div><dt className="text-xs text-taupe">Nome</dt><dd className="font-medium text-brown-dark">{sessao.nome}</dd></div>
        <div><dt className="text-xs text-taupe">E-mail</dt><dd className="font-medium text-brown-dark">{sessao.email}</dd></div>
        <div>
          <dt className="text-xs text-taupe">Perfil</dt>
          <dd className="font-medium text-brown-dark">
            {PAPEL[sessao.papel].rotulo}
            {sessao.organizacaoNome && ` · ${sessao.organizacaoNome}`}
          </dd>
        </div>
      </dl>
      <p className="mb-6 text-sm text-taupe">Para mudar nome ou e-mail, fale com a equipe Patinhas.</p>
      <FormularioSenha />

      {/* Os ajustes que no site ficam na barra do topo. No painel eles moram
          aqui, como nas configurações de conta de qualquer ferramenta interna,
          e não num botão flutuante por cima das tabelas. Valem para este
          navegador, no painel e no site. */}
      <section id="acessibilidade" aria-labelledby="titulo-acessibilidade" className="mt-10 max-w-md scroll-mt-24">
        <h2 id="titulo-acessibilidade" className="font-heading text-xl font-semibold text-brown-dark">
          Acessibilidade
        </h2>
        <p className="mt-1 mb-5 text-sm text-taupe">Valem para este navegador, no painel e no site.</p>
        <div className="rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm">
          <ControlesAcessibilidade />
        </div>
      </section>
    </>
  );
}
