"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu as IconeMenu, PanelLeft } from "lucide-react";
import { localizar } from "@/lib/admin/navegacao";
import { MenuConta, type UsuarioDaCasca } from "./menu-conta";

const classeBotao =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-taupe transition-colors hover:bg-muted hover:text-brown-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Barra superior: recolher o menu, onde a pessoa está, e a conta.
 *
 * O contexto tem duas linhas: em cima o painel de quem (Patinhas ou a ONG),
 * embaixo a página atual. É o que responde "onde estou?" sem rolar até o h1.
 */
export function BarraSuperior({
  usuario,
  contexto,
  recolhida,
  naoLidas,
  aoAlternar,
  aoAbrirGaveta,
}: {
  usuario: UsuarioDaCasca;
  contexto: string;
  recolhida: boolean;
  naoLidas: number;
  aoAlternar: () => void;
  aoAbrirGaveta: () => void;
}) {
  const { rotulo } = localizar(usePathname(), usuario.ehPatinhas);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-md sm:gap-4 sm:px-6">
      {/* Dois botões porque são duas ações: no celular abre a gaveta, no
          desktop recolhe a coluna. Um botão só teria um nome errado em uma
          das duas telas. */}
      <button type="button" onClick={aoAbrirGaveta} className={`${classeBotao} -ml-1 lg:hidden`} aria-label="Abrir menu" aria-haspopup="dialog">
        <IconeMenu className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={aoAlternar}
        className={`${classeBotao} -ml-1 hidden lg:inline-flex`}
        aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!recolhida}
        aria-keyshortcuts="Control+B"
        title={`${recolhida ? "Expandir" : "Recolher"} menu (Ctrl + B)`}
      >
        <PanelLeft className="size-4" aria-hidden="true" />
      </button>

      <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

      <div className="flex min-w-0 flex-col leading-none">
        <span className="hidden truncate text-[10px] font-medium tracking-[0.22em] text-taupe uppercase sm:block">
          Painel · {contexto}
        </span>
        <span className="truncate text-sm font-medium text-brown-dark sm:mt-1">{rotulo}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {usuario.ehPatinhas && (
          <>
            {/* O "sino" do painel: o que chegou e espera resposta. Mesma contagem
                do selo na barra lateral, para os dois nunca discordarem. */}
            <Link
              href="/admin/mensagens?status=NAO_LIDA"
              className={`${classeBotao} relative`}
              aria-label={naoLidas > 0 ? `Mensagens: ${naoLidas} não lidas` : "Mensagens: nenhuma não lida"}
            >
              <Mail className="size-4" aria-hidden="true" />
              {naoLidas > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-terracotta ring-2 ring-background" aria-hidden="true" />}
            </Link>
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          </>
        )}
        <MenuConta usuario={usuario} />
      </div>
    </header>
  );
}
