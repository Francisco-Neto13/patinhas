import { HeartPulse, Factory, Trees } from "lucide-react";
import { Reveal } from "@/components/reveal";
import type { Textos } from "@/lib/conteudo/ler";
import type { DadosPublicos } from "@/lib/publico/dados";
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

export function Sobre({ textos: t, numeros }: { textos: Textos; numeros: DadosPublicos["numeros"] }) {
  const itensNumeros = [
    { rotulo: "Animais para adoção", valor: numeros.disponiveis },
    { rotulo: "Animais adotados", valor: numeros.adotados },
    { rotulo: "Necessidades atendidas", valor: numeros.atendidas },
  ];
  // Ligado no painel E com algum dado real. Um bloco de zeros diria o
  // contrário do que se quer mostrar.
  const mostrarNumeros = t["numeros.mostrar"] === "sim" && itensNumeros.some((n) => n.valor > 0);

  // Ícones ficam no código; título e texto de cada card vêm do painel.
  const itens = ods.map((item, i) => ({
    ...item,
    titulo: t[`sobre.ods${i + 1}.titulo`],
    descricao: t[`sobre.ods${i + 1}.texto`],
  }));
  return (
    <section id="sobre" className="relative scroll-mt-16 overflow-hidden py-20 sm:py-28">
      <AnimalDeFundo animal="tartaruga" className="left-2 bottom-8 size-48 text-brown/[0.11] lg:size-56" />
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            {t["sobre.titulo"]}
          </h2>
          <p className="mt-4 text-taupe">
            {t["sobre.texto"]}
          </p>
        </Reveal>

        {mostrarNumeros && (
          <Reveal delay={0.1}>
            <h3 className="mt-12 font-heading text-xl font-semibold text-brown-dark">{t["numeros.titulo"]}</h3>
            {/* Lista de definição: cada número fica ligado ao que ele conta,
                para quem usa leitor de tela. */}
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {itensNumeros.map((n) => (
                // `<dt>` antes do `<dd>` é o que o HTML exige; o
                // `flex-col-reverse` só põe o número em cima na tela.
                <div key={n.rotulo} className="flex flex-col-reverse rounded-[1.25rem] bg-bone px-5 py-6 shadow-sm ring-1 ring-border">
                  <dt className="mt-1 text-sm text-taupe">{n.rotulo}</dt>
                  <dd className="font-heading text-3xl font-semibold text-brown">{n.valor.toLocaleString("pt-BR")}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {itens.map((o) => (
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
