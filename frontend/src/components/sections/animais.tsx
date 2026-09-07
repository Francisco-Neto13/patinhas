import { PawPrint } from "lucide-react";
import { PlatformCard } from "@/components/platform-card";
import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site-config";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";

// Sem abrigo parceiro confirmado hoje, então esta seção não mostra nenhum
// animal (real ou de exemplo) — só redireciona para redes de adoção
// brasileiras reais. Ver documentation/contexto/CONTEXTO.MD, seção
// "Catálogo de adoção".
export function Animais() {
  return (
    <section id="animais" className="relative overflow-hidden bg-beige/60 py-20 sm:py-28">
      <AnimalDeFundo animal="coelho" className="-right-12 top-40 size-64 -scale-x-100 text-brown/[0.10] lg:size-80" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PawPrint className="size-7" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-brown-dark sm:text-4xl">
            Animais para adoção
          </h2>
          <p className="mt-4 text-taupe">
            O Patinhas ainda não tem um abrigo parceiro confirmado, então não
            mostramos nenhum animal aqui pra não arriscar exibir um bichinho
            que não existe de verdade. Enquanto isso, conheça de perto as
            maiores redes de adoção reais do Brasil — cada uma delas já
            transformou milhares de histórias.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {siteConfig.adoptionPlatforms.map((platform, i) => (
            <Reveal key={platform.url} delay={(i % 2) * 0.1} className="h-full">
              <PlatformCard platform={platform} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
