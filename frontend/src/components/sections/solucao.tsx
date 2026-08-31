import { Package, HandHeart, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

const pilares = [
  {
    icon: Package,
    titulo: "Gestão inteligente de estoque",
    descricao:
      "Controle de entrada, saída e alertas de ração e medicamentos para evitar a escassez imprevisível.",
  },
  {
    icon: HandHeart,
    titulo: "Apoio à rotina dos voluntários",
    descricao:
      "Organização digital de prontuários, alimentação e tarefas, reduzindo a carga mental da equipe.",
  },
  {
    icon: Sparkles,
    titulo: "Engajamento contínuo da comunidade",
    descricao:
      "Um portal com metas e conteúdo que incentivam doações constantes e direcionam quem quer contribuir.",
  },
];

export function Solucao() {
  return (
    <section id="solucao" className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            Como o Patinhas ajuda
          </h2>
          <p className="mt-4 text-taupe">
            Uma plataforma gratuita que une a organização interna do abrigo com
            uma comunidade mais próxima e engajada.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pilares.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.1}>
              <div className="pulse-on-hover group flex h-full flex-col items-center rounded-3xl border border-border bg-bone p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <p.icon className="size-7" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-brown-dark">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm text-taupe">{p.descricao}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
