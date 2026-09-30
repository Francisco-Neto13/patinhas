import { Coins, ClipboardList, HeartCrack, MessageCircleWarning } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { Textos } from "@/server/dados/conteudo";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";

const problemas = [
  {
    icon: Coins,
    titulo: "Falta de recursos",
    descricao: "Escassez recorrente e imprevisibilidade no estoque de ração e medicamentos.",
  },
  {
    icon: ClipboardList,
    titulo: "Dificuldade de organização",
    descricao: "Controles manuais ou inexistentes sobre estoque, alimentação e histórico dos animais.",
  },
  {
    icon: HeartCrack,
    titulo: "Sobrecarga dos cuidadores",
    descricao: "Alta taxa de estresse e esgotamento mental nos voluntários dos abrigos.",
  },
  {
    icon: MessageCircleWarning,
    titulo: "Falta de comunicação",
    descricao: "Baixo engajamento e falta de doações constantes por parte da comunidade.",
  },
];

export function Problema({ textos: t }: { textos: Textos }) {
  // Ícones ficam no código; título e texto de cada card vêm do painel.
  const itens = problemas.map((item, i) => ({
    ...item,
    titulo: t[`problema.card${i + 1}.titulo`],
    descricao: t[`problema.card${i + 1}.texto`],
  }));
  return (
    <section id="problema" className="relative overflow-hidden bg-beige/60 py-20 sm:py-28">
      <AnimalDeFundo animal="gato" className="-right-12 top-10 size-64 text-brown/[0.10] lg:size-80" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            {t["problema.titulo"]}
          </h2>
          <p className="mt-4 text-taupe">
            {t["problema.intro"]}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {itens.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.08}>
              <div className="pulse-on-hover group flex h-full items-start gap-4 rounded-3xl bg-bone p-6 shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/15 text-terracotta-text transition-transform duration-300 group-hover:scale-110">
                  <p.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-brown-dark">
                    {p.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-taupe">{p.descricao}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
