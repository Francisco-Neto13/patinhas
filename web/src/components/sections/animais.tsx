import { AtSign, PawPrint } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";
import { CartaoAnimal } from "@/components/publico/cartoes";
import type { DadosPublicos } from "@/server/dados/publico";

/*
 * Os animais da ONG parceira, cadastrados no painel. Só aparecem os de
 * organização PUBLICADA, com status Disponível ou Em processo de adoção.
 *
 * Sem nenhum, a seção diz isso com todas as letras e aponta para onde os
 * próximos resgates aparecem primeiro (o Instagram da ONG). Nunca mostra
 * animal de exemplo: o CONTEXTO.MD proíbe sugerir um pet que não existe.
 */
export function Animais({
  animais,
  organizacoes,
}: {
  animais: DadosPublicos["animais"];
  organizacoes: DadosPublicos["organizacoes"];
}) {
  const temAnimais = animais.length > 0;
  const varias = organizacoes.length > 1;
  const ong = organizacoes.length === 1 ? organizacoes[0] : null;

  return (
    <section id="animais" className="relative scroll-mt-16 overflow-hidden py-20 sm:py-28">
      <AnimalDeFundo animal="coelho" className="-right-12 top-40 size-64 -scale-x-100 text-brown/[0.10] lg:size-80" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-brown-dark sm:text-4xl">Animais para adoção</h2>
          <p className="mt-4 text-taupe">
            {temAnimais
              ? ong
                ? `Estes bichinhos estão sob os cuidados de ${ong.nome}. O botão de cada um leva direto ao contato de quem cuida dele.`
                : "Estes bichinhos estão sob os cuidados das nossas ONGs parceiras. O botão de cada um leva direto ao contato de quem cuida dele."
              : "Nenhum animal esperando adoção neste momento. Os próximos resgates aparecem aqui assim que forem cadastrados."}
          </p>
          {!temAnimais && ong?.instagram && (
            <a
              href={ong.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-borda-forte bg-bone px-5 py-2.5 text-sm font-semibold text-brown-dark hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <AtSign className="size-4" aria-hidden="true" /> Acompanhe os resgates no Instagram
              <span className="sr-only"> de {ong.nome} (abre em nova aba)</span>
            </a>
          )}
        </Reveal>

        {temAnimais && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {animais.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.08} className="h-full">
                <CartaoAnimal animal={a} mostrarOrganizacao={varias} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
