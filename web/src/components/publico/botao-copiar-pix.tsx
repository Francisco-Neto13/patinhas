"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Texto com botão de copiar (chave PIX ou "Pix copia e cola").
 *
 * O texto também fica visível e selecionável: a área de transferência pode
 * estar bloqueada (navegador antigo, página sem HTTPS), e aí a pessoa ainda
 * consegue copiar na mão.
 */
export function BotaoCopiarPix({
  valor,
  rotulo = "Chave PIX",
  rotuloBotao = "Copiar chave",
  mostrarValor = true,
}: {
  valor: string;
  rotulo?: string;
  rotuloBotao?: string;
  /** O copia e cola tem ~100 caracteres: melhor não despejar na tela. */
  mostrarValor?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs text-taupe">{rotulo}</p>
      {mostrarValor && <p className="truncate font-mono text-sm text-brown-dark select-all">{valor}</p>}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2500);
          } catch {
            // Sem permissão de área de transferência: se o texto está visível,
            // continua selecionável; não há o que fazer além de não mentir.
          }
        }}
        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-terracotta-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copiado ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        {copiado ? "Copiado!" : rotuloBotao}
      </button>
      {/* Anuncia a cópia a quem não vê o ícone trocar. */}
      <span className="sr-only" aria-live="polite">{copiado ? `${rotulo} copiado` : ""}</span>
    </div>
  );
}
