import { ArrowRight, Heart, PawPrint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Blob, PawPrintScatter } from "@/components/decorative/blob";
import { Reveal } from "@/components/reveal";
import type { Textos } from "@/lib/conteudo/ler";

/** Textos editáveis pelo painel (Conteúdo > Página inicial). Padrões em campos.ts. */
export function Hero({ textos: t }: { textos: Textos }) {
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
            {t["inicio.selo"]}
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-6 text-balance text-4xl font-semibold text-brown-dark sm:text-6xl">
            {t["inicio.titulo"]}
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-taupe">
            {t["inicio.subtitulo"]}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={t["inicio.botao1.link"]} className={buttonVariants({ size: "lg", className: "rounded-full" })}>
              {t["inicio.botao1.texto"]} <Heart className="size-4" />
            </a>
            <a
              href={t["inicio.botao2.link"]}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                // A borda vem do proprio variant `outline` (ver ui/button.tsx):
                // `border-brown/30` que estava aqui dava contraste 1.50 contra o
                // creme, a borda mal existia, e o botao lia como texto solto ao
                // lado do primario.
                className: "rounded-full text-brown-dark hover:bg-beige",
              })}
            >
              {t["inicio.botao2.texto"]} <ArrowRight className="size-4" />
            </a>
          </div>
        </Reveal>

        {t["inicio.imagem"] && (
          <Reveal delay={0.4} className="mt-12 w-full">
            {/* Sem descrição preenchida no painel, a imagem é tratada como
                decorativa (alt vazio): um alt genérico como "imagem do topo"
                só faria o leitor de tela anunciar ruído. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload */}
            <img
              src={t["inicio.imagem"]}
              alt={t["inicio.imagemAlt"]}
              data-imagem-decorativa=""
              className="mx-auto aspect-[16/9] w-full max-w-3xl rounded-3xl object-cover shadow-md"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
