"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { useMovimentoReduzido } from "@/components/acessibilidade/preferencias";
import { fotosPets } from "@/lib/pets";

/** Pixels por segundo. Devagar de propósito: é ambientação, não slideshow. */
const VELOCIDADE = 28;

export function VitrinePets() {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const movimentoReduzido = useMovimentoReduzido();

  /*
   * A fita para enquanto alguém olha uma foto (mouse em cima) ou navega por
   * teclado (foco dentro dela), e volta sozinha depois.
   */
  const [pausadoPorInteracao, setPausadoPorInteracao] = useState(false);

  /*
   * ⚠️ QUEM CUMPRE A WCAG 2.2.2 AQUI.
   *
   * O critério exige que conteúdo em movimento automático por mais de 5
   * segundos tenha um jeito de ser parado. Não há botão de pausa nesta seção,
   * por decisão de projeto, então quem carrega essa obrigação é o
   * `movimentoReduzido`: o botão "Reduzir animações" da barra de
   * acessibilidade, disponível em qualquer ponto da página, alcançável por
   * teclado e persistente entre visitas.
   *
   * Isso também cobre quem configurou `prefers-reduced-motion` no sistema e
   * nunca vai abrir a barra: para essas pessoas a fita já nasce parada.
   *
   * ⚠️ Se um dia a barra sair do ar, esta seção volta a descumprir o critério.
   * As duas coisas estão amarradas.
   */
  const andando = !pausadoPorInteracao && !movimentoReduzido;

  useEffect(() => {
    if (!andando) return;
    const trilho = trilhoRef.current;
    if (!trilho) return;

    let quadro = 0;
    let anterior = performance.now();
    /*
     * ⚠️ A posição é acumulada AQUI, num float, e não lida de volta do DOM.
     *
     * O navegador arredonda `scrollLeft` para inteiro. Medido: atribuir 0,47
     * devolve 0. A 28px/s cada quadro anda ~0,47px, então um
     * `scrollLeft += 0.47` lê 0, soma, grava 0,47, e na leitura seguinte é 0 de
     * novo: a fita ficava parada para sempre. Com o acumulador, a fração
     * sobrevive entre quadros e a rolagem avança 1px a cada dois.
     */
    let posicao = trilho.scrollLeft;

    const passo = (agora: number) => {
      const dt = agora - anterior;
      anterior = agora;

      /*
       * ⚠️ Anda mexendo no `scrollLeft`, e não numa animação de `transform`.
       *
       * A diferença é de acessibilidade, não de estilo. Com `transform` a fita
       * seria uma peça inerte que só o JavaScript move: sem rolagem por
       * teclado, sem arrastar no celular, sem roda do mouse. Movendo a posição
       * de rolagem de um contêiner que rola de verdade, o movimento automático
       * e o controle manual compartilham o MESMO estado, e a pessoa pega a fita
       * no meio do caminho e continua de onde ela estava.
       */
      // Se a pessoa rolou na mão, o DOM se afasta do acumulador. Aí quem manda
      // é ela: o desfile continua de onde ela parou, em vez de dar um salto de
      // volta para onde o automático estava.
      if (Math.abs(trilho.scrollLeft - posicao) > 2) posicao = trilho.scrollLeft;

      posicao += (VELOCIDADE * dt) / 1000;

      // A lista é renderizada duas vezes; ao passar da primeira, volta ao
      // início. Como as duas metades são idênticas, o salto é invisível.
      const metade = trilho.scrollWidth / 2;
      if (metade > 0 && posicao >= metade) posicao -= metade;

      trilho.scrollLeft = posicao;

      quadro = requestAnimationFrame(passo);
    };

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [andando]);

  return (
    /*
     * Sem cor de fundo própria, de propósito.
     *
     * As seções do site revezam creme e bege. Entrando aqui com bege, esta
     * encostava na "O problema", que também é bege, e as duas viravam uma
     * mancha só. Em creme ela lê como continuação do hero, e o bege da seção
     * seguinte volta a marcar a divisão.
     */
    <section id="vitrine" className="overflow-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            É por eles que a gente faz isso
          </h2>
          {/*
            ⚠️ A ressalva não é rodapé jurídico, é a regra do projeto.

            O CONTEXTO.MD recusa exibir animal fictício justamente para não
            sugerir que existe um pet disponível que não existe. Fotos de banco
            de imagem num site de proteção animal correriam o mesmo risco de
            serem lidas como "os animais do abrigo". Uma linha resolve.
          */}
          <p className="mt-4 text-taupe">
            Fotos livres de bichinhos como os que enchem os abrigos por aí. Não
            são animais nossos nem estão disponíveis para adoção aqui. Para
            adotar de verdade, veja as redes reais logo abaixo.
          </p>
        </Reveal>
      </div>

      <div className="relative mt-10">
        <div
          ref={trilhoRef}
          /*
           * `tabIndex` + rótulo porque isto é uma área que ROLA.
           *
           * Um contêiner com barra de rolagem que não recebe foco é
           * inalcançável por teclado: a pessoa vê as fotos e não consegue
           * passar por elas. Com foco, as setas do teclado rolam a fita de
           * graça, sem nenhum manipulador de evento.
           */
          tabIndex={0}
          role="group"
          aria-label="Fotos de pets, role para o lado para ver mais"
          onPointerEnter={() => setPausadoPorInteracao(true)}
          onPointerLeave={() => setPausadoPorInteracao(false)}
          // `Capture` porque o foco chega nos filhos, não neste elemento.
          onFocusCapture={() => setPausadoPorInteracao(true)}
          onBlurCapture={() => setPausadoPorInteracao(false)}
          /*
           * A esmaecida das pontas e feita com `mask-image`, e nao com um
           * degrade colorido por cima.
           *
           * Um degrade colorido teria de repetir a cor de fundo da secao, e
           * passaria a mentir no instante em que ela mudasse, como acabou de
           * acontecer aqui, quando o bege virou creme. A mascara apaga o
           * proprio conteudo, entao funciona sobre qualquer fundo, inclusive o
           * preto do alto contraste.
           */
          className="flex gap-4 overflow-x-auto px-4 pb-4 [mask-image:linear-gradient(to_right,transparent,black_2.5rem,black_calc(100%-2.5rem),transparent)] [scrollbar-color:var(--borda-forte)_transparent] [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-5 sm:px-6 sm:[mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%-5rem),transparent)]"
        >
          {/*
            A lista sai duas vezes: a primeira é o conteúdo, a segunda existe só
            para o rodízio não ter emenda visível. A cópia é `aria-hidden` e com
            `alt` vazio. Senão um leitor de tela anunciaria os 14 bichos duas
            vezes seguidas.
          */}
          {[0, 1].map((copia) =>
            fotosPets.map((foto) => (
              <figure
                key={`${copia}-${foto.src}`}
                aria-hidden={copia === 1 ? true : undefined}
                className="group relative w-40 shrink-0 overflow-hidden rounded-3xl border border-border bg-bone shadow-sm sm:w-48 lg:w-56"
              >
                <Image
                  src={foto.src}
                  alt={copia === 0 ? foto.alt : ""}
                  width={600}
                  height={800}
                  sizes="(min-width: 1024px) 14rem, (min-width: 640px) 12rem, 10rem"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </figure>
            )),
          )}
        </div>
      </div>

    </section>
  );
}
