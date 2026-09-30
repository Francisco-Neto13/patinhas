"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { COOKIE_BARRA, type GrupoNav } from "@/lib/admin/navegacao";
import { cn } from "@/lib/utils";
import { BarraLateral, type Contadores } from "./barra-lateral";
import { BarraSuperior } from "./barra-superior";
import type { UsuarioDaCasca } from "./menu-conta";

/**
 * A casca do painel: barra lateral, barra superior e a área de conteúdo.
 * Medidas e decisões em documentation/administracao/LAYOUT-PAINEL.MD.
 */
export function CascaPainel({
  grupos,
  contadores,
  usuario,
  contexto,
  recolhidaInicial,
  children,
}: {
  grupos: GrupoNav[];
  contadores: Contadores;
  usuario: UsuarioDaCasca;
  contexto: string;
  recolhidaInicial: boolean;
  children: ReactNode;
}) {
  const [recolhida, setRecolhida] = useState(recolhidaInicial);
  const [gaveta, setGaveta] = useState(false);
  const caminho = usePathname();
  const [caminhoDaGaveta, setCaminhoDaGaveta] = useState(caminho);

  const alternar = useCallback(() => {
    setRecolhida((atual) => {
      const nova = !atual;
      document.cookie = `${COOKIE_BARRA}=${nova ? "recolhida" : "aberta"}; path=/admin; max-age=31536000; SameSite=Lax`;
      return nova;
    });
  }, []);

  // Navegou, a gaveta fecha: ela cobre a página que a pessoa acabou de pedir.
  // Comparado durante a renderização, e não num efeito, para a página nova
  // nunca aparecer nem por um quadro com a gaveta ainda aberta por cima.
  if (caminho !== caminhoDaGaveta) {
    setCaminhoDaGaveta(caminho);
    setGaveta(false);
  }

  // Ctrl/Cmd + B recolhe, o mesmo atalho de editores e CRMs. Fora de campo de
  // texto: ali Ctrl + B pode ser negrito, e o atalho não deve roubar a tecla.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "b" || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      alternar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [alternar]);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block",
          recolhida ? "w-[5.125rem]" : "w-64",
        )}
      >
        <BarraLateral grupos={grupos} contadores={contadores} recolhida={recolhida} />
      </aside>

      {/* No celular a barra vira gaveta. Dialog e não um div solto: prende o
          foco dentro, fecha com Esc e devolve o foco ao botão que abriu. */}
      <Dialog.Root open={gaveta} onOpenChange={setGaveta}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-brown-dark/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 lg:hidden" />
          <Dialog.Popup className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-200 ease-out outline-none data-ending-style:-translate-x-full data-starting-style:-translate-x-full lg:hidden">
            <Dialog.Title className="sr-only">Menu do painel</Dialog.Title>
            <Dialog.Close
              className="absolute top-4 right-3 z-10 inline-flex size-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label="Fechar menu"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
            <BarraLateral grupos={grupos} contadores={contadores} />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior
          usuario={usuario}
          contexto={contexto}
          recolhida={recolhida}
          naoLidas={contadores.mensagens ?? 0}
          aoAlternar={alternar}
          aoAbrirGaveta={() => setGaveta(true)}
        />
        {/* Largura toda, como num CRM: tabela e cartão aproveitam a tela. Quem
            precisa de linha curta (formulário, subtítulo) se limita sozinho.
            `pb-24`: com a barra recolhida, o botão flutuante de Acessibilidade
            passa por cima do conteúdo; a folga garante que o fim da página
            (o botão de salvar, quase sempre) nunca fique escondido embaixo dele. */}
        <main id="conteudo" tabIndex={-1} className="flex-1 px-4 pt-10 pb-24 outline-none sm:px-6">
          <div className="painel-entrada w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
