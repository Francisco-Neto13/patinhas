import { Bone, Pill, PiggyBank } from "lucide-react";
import { PlatformCard } from "@/components/platform-card";
import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site-config";

const blocos = [
  {
    id: "racao",
    icon: Bone,
    titulo: "Doação de ração",
    intro: "Plataformas reais que já resolvem a logística de doar ração pra quem precisa.",
    plataformas: siteConfig.racaoPlatforms,
  },
  {
    id: "medicamentos",
    icon: Pill,
    titulo: "Doação de medicamentos",
    intro:
      "No Brasil ainda não existe uma rede nacional só pra isso, mas essas iniciativas reais aceitam e redistribuem medicamentos veterinários.",
    plataformas: siteConfig.medicamentosPlatforms,
  },
  {
    id: "financeira",
    icon: PiggyBank,
    titulo: "Doação financeira",
    intro:
      "O Patinhas não processa pagamentos — essas são plataformas de vaquinha online usadas por ONGs e protetores de verdade.",
    plataformas: siteConfig.financeiraPlatforms,
  },
];

export function ComoAjudar() {
  return (
    <section id="ajudar" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            Como ajudar
          </h2>
          <p className="mt-4 text-taupe">
            O Patinhas ainda não tem abrigo parceiro nem processa doações
            diretamente. Por enquanto, reunimos aqui iniciativas reais e
            verificadas pra você ajudar de verdade agora — cada card leva
            direto pro site de origem.
          </p>
        </Reveal>

        <div className="mt-14 space-y-16">
          {blocos.map((bloco) => (
            <div key={bloco.id}>
              <Reveal className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta/15 text-terracotta">
                  <bloco.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold text-brown-dark">
                    {bloco.titulo}
                  </h3>
                  <p className="text-sm text-taupe">{bloco.intro}</p>
                </div>
              </Reveal>

              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {bloco.plataformas.map((plataforma, i) => (
                  <Reveal key={plataforma.url} delay={(i % 2) * 0.08} className="h-full">
                    <PlatformCard platform={plataforma} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
