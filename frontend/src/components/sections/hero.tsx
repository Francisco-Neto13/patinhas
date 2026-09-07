import { ArrowRight, Heart, PawPrint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Blob, PawPrintScatter } from "@/components/decorative/blob";
import { Reveal } from "@/components/reveal";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <Blob className="pointer-events-none absolute -top-24 -right-24 size-[420px] text-terracotta/15" />
      <Blob className="pointer-events-none absolute -bottom-32 -left-20 size-[360px] text-brown/10 rotate-45" />
      <PawPrintScatter className="pointer-events-none absolute top-20 left-[8%] size-16 rotate-[-12deg] text-brown/15 hidden sm:block" />
      <PawPrintScatter className="pointer-events-none absolute bottom-16 right-[10%] size-20 rotate-[18deg] text-terracotta/20 hidden sm:block" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-beige px-4 py-1.5 text-sm font-medium text-brown">
            <PawPrint className="size-4" />
            Tecnologia a serviço da proteção animal
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-6 text-balance text-4xl font-semibold text-brown-dark sm:text-6xl">
            Cada patinha merece um lar, um prato cheio e um abrigo bem cuidado
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-taupe">
            O Patinhas conecta abrigos, voluntários e a comunidade para reduzir a
            falta de recursos, organizar as doações e dar mais visibilidade aos
            animais que esperam por adoção.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#ajudar" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
              Quero ajudar <Heart className="size-4" />
            </a>
            <a
              href="#animais"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                // A borda vem do proprio variant `outline` (ver ui/button.tsx):
                // `border-brown/30` que estava aqui dava contraste 1.50 contra o
                // creme — a borda mal existia, e o botao lia como texto solto ao
                // lado do primario.
                className: "rounded-full text-brown-dark hover:bg-beige",
              })}
            >
              Ver animais para adoção <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
