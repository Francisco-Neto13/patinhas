"use client";

import { Popover } from "@base-ui/react/popover";
import { Accessibility, ChevronDown, Contrast, X } from "lucide-react";
import { ControlesAcessibilidade } from "@/components/acessibilidade/controles";
import { usePreferencias } from "@/components/acessibilidade/preferencias";

// Atalhos do eMAG (Modelo de Acessibilidade em Governo Eletrônico): o número
// é o mesmo em todo site brasileiro que segue o padrão, e aparece ao lado do
// link para quem usa `Alt + número`.
const ATALHOS = [
  { href: "#conteudo", rotulo: "Ir para o conteúdo", tecla: "1" },
  { href: "#menu", rotulo: "Ir para o menu", tecla: "2" },
  { href: "#rodape", rotulo: "Ir para o rodapé", tecla: "4" },
];

const classeAcao =
  "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-medium transition-colors hover:bg-cream/10 focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:outline-none";

/**
 * Barra de acessibilidade do site público, no alto da página, no modelo do
 * Padrão Digital de Governo (gov.br): atalhos à esquerda, contraste e demais
 * ajustes à direita.
 *
 * ⚠️ Por que aqui em cima, e não um botão flutuante no canto (como era).
 *
 * Botão flutuante de acessibilidade é a cara dos "overlays" (accessiBe e
 * afins), que a comunidade de acessibilidade critica por prometerem consertar
 * o site por cima. O nosso não é isso (as preferências mudam os tokens do
 * design system, e o site já é acessível por baixo), mas no canto ele parecia
 * ser, cobria conteúdo e disputava espaço com o VLibras. No topo ele é o
 * primeiro lugar onde leitor de tela e teclado chegam, e é onde o público
 * brasileiro já procura, porque é onde os sites do governo põem.
 *
 * Só no site público. O painel guarda os mesmos ajustes em "Minha conta".
 */
export function BarraTopoAcessibilidade() {
  const { preferencias, definir } = usePreferencias();
  const altoContraste = preferencias.contraste === "alto";

  return (
    <div role="region" aria-label="Acessibilidade" className="bg-brown-dark text-xs text-cream print:hidden">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* No celular os atalhos só aparecem ao receber foco pelo teclado:
            não há espaço para eles, e quem toca a tela não os usa. */}
        <nav aria-label="Atalhos" className="flex items-center gap-1">
          {ATALHOS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              accessKey={a.tecla}
              className={`${classeAcao} sr-only focus:not-sr-only md:not-sr-only`}
            >
              {a.rotulo}
              <kbd aria-hidden="true" className="rounded bg-cream/15 px-1.5 font-sans text-[10px] leading-4">
                {a.tecla}
              </kbd>
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* O ajuste mais procurado, a um clique, como no gov.br. */}
          <button type="button" aria-pressed={altoContraste} onClick={() => definir("contraste", altoContraste ? "normal" : "alto")} className={classeAcao}>
            <Contrast className="size-3.5" aria-hidden="true" />
            Alto contraste
          </button>

          <Popover.Root>
            <Popover.Trigger
              // `accessKey="5"`: atalho que o eMAG reserva para a página de
              // acessibilidade (1 conteúdo, 2 menu, 3 busca, 4 rodapé, 5 aqui).
              accessKey="5"
              className={`${classeAcao} group`}
            >
              <Accessibility className="size-3.5" aria-hidden="true" />
              Acessibilidade
              <ChevronDown className="size-3.5 transition-transform group-data-popup-open:rotate-180" aria-hidden="true" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner align="end" sideOffset={8} className="z-[60] outline-none">
                <Popover.Popup className="w-[min(20rem,calc(100vw-2rem))] origin-(--transform-origin) rounded-3xl border border-border bg-bone p-5 shadow-xl outline-none transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <Popover.Title className="font-heading text-base font-semibold text-brown-dark">Acessibilidade</Popover.Title>
                    <Popover.Close
                      aria-label="Fechar opções de acessibilidade"
                      className="rounded-full p-1.5 text-taupe transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Popover.Close>
                  </div>
                  <ControlesAcessibilidade />
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </div>
  );
}
