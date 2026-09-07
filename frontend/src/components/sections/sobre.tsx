import { HeartPulse, Factory, Trees } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";

const ods = [
  {
    numero: "3",
    titulo: "Saúde e bem-estar",
    icon: HeartPulse,
    descricao: "Reduz a carga mental dos voluntários e ajuda a prevenir surtos zoonóticos.",
  },
  {
    numero: "9",
    titulo: "Indústria, inovação e infraestrutura",
    icon: Factory,
    descricao: "Moderniza a gestão da ONG com uma solução digital gratuita e acessível.",
  },
  {
    numero: "15",
    titulo: "Vida terrestre",
    icon: Trees,
    descricao: "Ajuda a garantir segurança alimentar contínua para os animais resgatados.",
  },
];

export function Sobre() {
  return (
    <section id="sobre" className="relative overflow-hidden bg-beige/60 py-20 sm:py-28">
      <AnimalDeFundo animal="tartaruga" className="left-2 bottom-8 size-48 text-brown/[0.11] lg:size-56" />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            Sobre o Patinhas
          </h2>
          <p className="mt-4 text-taupe">
            O Patinhas nasceu como projeto de extensão universitária com um
            objetivo simples: usar tecnologia para aproximar a comunidade dos
            animais resgatados e aliviar o peso que recai sobre abrigos e
            voluntários. É uma plataforma gratuita, pensada para ONGs e
            abrigos de proteção animal.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {ods.map((o) => (
              <div key={o.numero} className="rounded-3xl bg-bone p-6 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {o.numero}
                  </span>
                  <o.icon className="size-5 text-terracotta-text" />
                </div>
                <h3 className="mt-3 font-heading text-base font-semibold text-brown-dark">
                  {o.titulo}
                </h3>
                <p className="mt-1 text-sm text-taupe">{o.descricao}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
