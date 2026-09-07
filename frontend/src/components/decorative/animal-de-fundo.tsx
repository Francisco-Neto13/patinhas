import { Bird, Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bichinho de fundo, um por seção.
 *
 * ⚠️ POR QUE ÍCONES DO LUCIDE E NÃO ILUSTRAÇÃO BAIXADA.
 *
 * A alternativa era clipart CC0 (publicdomainvectors.org e OpenClipart são
 * domínio público de verdade, sem pegadinha de licença). O problema não é
 * jurídico, é visual: cada silhueta de lá vem de um autor diferente, com peso
 * de traço, nível de detalhe e estilo próprios. Seis seções com seis estilos
 * distintos leem como figurinha colada, não como identidade — o oposto do
 * acabamento que se quer aqui.
 *
 * O Lucide já é a linguagem visual do site (são 39 ícones dele nas seções) e é
 * arredondado como a Fredoka e como os blobs do hero. Sendo traço vetorial de
 * uma família só, os seis bichos parecem desenhados pela mesma mão. Some-se a
 * isso: licença ISC, já instalado, escala sem perder nitidez e recolore com uma
 * classe.
 */
const ANIMAIS = {
  gato: Cat,
  cachorro: Dog,
  coelho: Rabbit,
  passaro: Bird,
  tartaruga: Turtle,
  peixe: Fish,
} as const;

export type Animal = keyof typeof ANIMAIS;

export function AnimalDeFundo({
  animal,
  className,
}: {
  animal: Animal;
  /** Posição e tamanho. Ex.: "-right-10 top-12 size-64". */
  className?: string;
}) {
  const Icone = ANIMAIS[animal];

  return (
    <Icone
      /*
       * Decoração pura: não entra na árvore de acessibilidade, não recebe
       * clique e não atrapalha a seleção de texto por cima dela.
       */
      aria-hidden="true"
      focusable="false"
      data-animal-decorativo=""
      /*
       * O traço padrão do Lucide é 2 em uma caixa de 24. Ampliado para 250px+,
       * ele vira uma borda grossa de desenho infantil. Em 1.25 o bicho fica com
       * cara de traço fino de ilustração, que é o que se quer num fundo.
       */
      strokeWidth={1.25}
      className={cn(
        "pointer-events-none absolute select-none text-brown",
        /*
         * ⚠️ Some no celular.
         *
         * Num viewport estreito não existe "de ladinho": o bicho cairia atrás
         * do texto, e um traço marrom cruzando o parágrafo atrapalha a leitura
         * de quem tem baixa visão ou dislexia sem acrescentar nada. É a mesma
         * decisão que as patinhas do hero já tomavam.
         */
        "hidden sm:block",
        className,
      )}
    />
  );
}
