"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Lista que começa com alguns itens e cresce num botão "Ver mais".
 *
 * Por que botão e não rolagem infinita nem páginas numeradas:
 *
 * - Nos testes da Baymard, quem tinha "Ver mais" viu mais itens que com
 *   paginação, e leu cada um com mais atenção que com rolagem infinita.
 * - A NN/g reserva a rolagem infinita para feeds sem fim. Aqui a pessoa está
 *   COMPARANDO animais para adotar, e a rolagem infinita ainda empurra o
 *   rodapé (com o contato) para longe sempre que ela chega perto.
 *
 * Acessibilidade: o total aparece abaixo do botão ("Mostrando 6 de 14"), a chegada
 * dos novos é anunciada, e o foco vai para o primeiro item novo. Sem isso,
 * quem navega pelo teclado clicaria e continuaria no botão, sem saber onde os
 * novos apareceram.
 */
export function ListaVerMais({
  itens,
  porVez = 6,
  nomeDoItem,
  className,
}: {
  itens: ReactNode[];
  porVez?: number;
  /** Plural, para o botão e o anúncio: "animais". */
  nomeDoItem: string;
  className?: string;
}) {
  const [visiveis, setVisiveis] = useState(porVez);
  const [primeiroNovo, setPrimeiroNovo] = useState<number | null>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  const total = itens.length;
  const faltam = Math.max(0, total - visiveis);
  const proximos = Math.min(porVez, faltam);

  useEffect(() => {
    if (primeiroNovo !== null) refs.current[primeiroNovo]?.focus();
  }, [primeiroNovo]);

  return (
    <>
      <ul className={className}>
        {itens.slice(0, visiveis).map((item, i) => (
          <li
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            // Focável só por programa: recebe o foco ao chegar, sem virar mais
            // uma parada do Tab na lista inteira.
            tabIndex={-1}
            className="h-full rounded-[1.6rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {item}
          </li>
        ))}
      </ul>

      {faltam > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPrimeiroNovo(visiveis);
              setVisiveis((v) => v + porVez);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-borda-forte bg-bone px-6 py-2.5 text-sm font-semibold text-brown-dark shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Ver mais {nomeDoItem} <ChevronDown className="size-4" aria-hidden="true" />
          </button>
          <p className="text-xs text-taupe">
            Mostrando {visiveis} de {total}. {proximos === faltam ? `Faltam ${faltam}.` : `Mais ${proximos} a cada clique.`}
          </p>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {primeiroNovo !== null ? `Mais ${Math.min(porVez, total - primeiroNovo)} ${nomeDoItem} na lista. Mostrando ${Math.min(visiveis, total)} de ${total}.` : ""}
      </p>
    </>
  );
}
