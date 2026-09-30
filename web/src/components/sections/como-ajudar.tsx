import { HeartHandshake, Siren } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";
import { CartaoNecessidade, PainelDoacao } from "@/components/publico/cartoes";
import type { DadosPublicos } from "@/server/dados/publico";

/**
 * Como ajudar a ONG parceira: o que ela está pedindo agora e, ao lado, como
 * doar direto para ela (PIX, link, formas de doação).
 *
 * Nada aqui passa pelo Patinhas: cada botão leva direto a quem recebe.
 */
export function ComoAjudar({
  necessidades,
  organizacoes,
}: {
  necessidades: DadosPublicos["necessidades"];
  organizacoes: DadosPublicos["organizacoes"];
}) {
  const varias = organizacoes.length > 1;
  const ong = organizacoes.length === 1 ? organizacoes[0] : null;

  return (
    <section id="ajudar" className="relative scroll-mt-16 overflow-hidden bg-beige/60 py-20 sm:py-28">
      <AnimalDeFundo animal="passaro" className="-left-12 top-16 size-56 text-brown/[0.09] lg:size-72" />
      <AnimalDeFundo animal="gato" className="-right-14 bottom-24 size-64 text-brown/[0.08] lg:size-80" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">Como ajudar</h2>
          <p className="mt-4 text-taupe">
            {organizacoes.length === 0
              ? "Em breve, os pedidos e as formas de doar da nossa ONG parceira aparecem aqui."
              : `Veja o que ${ong ? ong.nome : "as ONGs parceiras"} ${ong ? "está" : "estão"} precisando agora e doe direto, sem intermediário. O Patinhas não recebe nem repassa dinheiro.`}
          </p>
        </Reveal>

        {organizacoes.length > 0 && (
          <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_24rem]">
            <div>
              <Reveal className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.875rem] bg-terracotta/20 text-terracotta-text">
                  <Siren className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brown-dark">Precisam de ajuda agora</h3>
                  <p className="text-sm text-taupe">Os pedidos urgentes vêm primeiro.</p>
                </div>
              </Reveal>

              {necessidades.length > 0 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {necessidades.map((n, i) => (
                    <Reveal key={n.id} delay={(i % 2) * 0.06} className="h-full">
                      <CartaoNecessidade necessidade={n} mostrarOrganizacao={varias} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal>
                  <p className="mt-6 flex items-start gap-3 rounded-[1.25rem] border border-dashed border-borda-forte/50 bg-bone/70 p-6 text-sm text-taupe">
                    <HeartHandshake className="mt-0.5 size-5 shrink-0 text-terracotta-text" aria-hidden="true" />
                    Nenhum pedido em aberto agora. Uma doação pelo PIX ao lado ajuda a manter a rotina de ração, vacinas e castrações.
                  </p>
                </Reveal>
              )}
            </div>

            {/* No desktop o painel acompanha a rolagem dos pedidos. */}
            <div className="space-y-6 lg:sticky lg:top-24">
              {organizacoes.map((o) => (
                <Reveal key={o.id} delay={0.1}>
                  <PainelDoacao organizacao={o} mostrarNome={varias} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
