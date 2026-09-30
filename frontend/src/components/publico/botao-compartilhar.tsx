"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compartilhar uma campanha. É a outra metade de "divulgar": quem não pode
 * doar agora quase sempre pode mandar para alguém que pode.
 *
 * No celular abre o compartilhamento do sistema (WhatsApp, Instagram...). No
 * computador, onde ele quase nunca existe, copia o link, que leva direto à
 * campanha pela âncora `#campanha-<id>`.
 */
export function BotaoCompartilhar({
  titulo,
  texto,
  ancora,
  compacto = false,
  className,
}: {
  titulo: string;
  texto?: string | null;
  ancora: string;
  /** Só o ícone, com o nome escondido para leitor de tela. */
  compacto?: boolean;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  // Sem permissão de área de transferência: o link aparece num campo já
  // selecionado para copiar à mão. Um prompt() do navegador travaria a página.
  const [linkManual, setLinkManual] = useState<string | null>(null);

  async function compartilhar() {
    const url = `${location.origin}${location.pathname}#${ancora}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto ?? titulo, url });
        return;
      } catch (e) {
        // Fechou a janela de compartilhar: não é erro, não faz nada.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setLinkManual(url);
    }
  }

  const Icone = copiado ? Check : Share2;
  const rotulo = copiado ? "Link copiado" : "Compartilhar";

  return (
    <>
      <button
        type="button"
        onClick={compartilhar}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-borda-forte text-sm font-semibold text-brown-dark transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          compacto ? "size-10" : "px-5 py-2.5",
          className,
        )}
      >
        <Icone className="size-4" aria-hidden="true" />
        <span className={compacto ? "sr-only" : undefined}>
          {rotulo}
          {compacto && `: ${titulo}`}
        </span>
      </button>
      {linkManual && (
        <input
          readOnly
          value={linkManual}
          aria-label="Link da campanha para copiar"
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onBlur={() => setLinkManual(null)}
          className="w-full min-w-0 rounded-[0.75rem] border border-borda-forte bg-bone px-3 py-2 text-sm text-brown-dark sm:w-72"
        />
      )}
      {/* Anuncia a cópia para quem usa leitor de tela: o ícone trocar não basta. */}
      <span className="sr-only" aria-live="polite">
        {copiado ? "Link da campanha copiado" : ""}
      </span>
    </>
  );
}
