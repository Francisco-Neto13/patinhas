"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Accessibility, Contrast, RotateCcw, Type, Waves, X } from "lucide-react";
import { usePreferencias, type Fonte } from "@/components/acessibilidade/preferencias";

const TAMANHOS: { valor: Fonte; rotulo: string; amostra: string }[] = [
  { valor: "normal", rotulo: "Padrão", amostra: "A" },
  { valor: "grande", rotulo: "Grande", amostra: "A" },
  { valor: "maior", rotulo: "Maior", amostra: "A" },
];

export function BarraAcessibilidade() {
  const { preferencias, definir, restaurar, alterado } = usePreferencias();
  const [aberto, setAberto] = useState(false);
  const painelId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  /*
   * Esc fecha e DEVOLVE O FOCO ao botão.
   *
   * A segunda metade é a que costuma faltar: sem ela o foco fica órfão no
   * painel que acabou de sumir, e o próximo Tab recomeça do topo da página —
   * quem navega por teclado perde o lugar onde estava.
   */
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const aoClicarFora = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (!painelRef.current?.contains(alvo) && !botaoRef.current?.contains(alvo)) {
        setAberto(false);
      }
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
    };
  }, [aberto]);

  return (
    /*
     * ⚠️ Canto inferior ESQUERDO, e isso não é gosto.
     *
     * O VLibras se fixa à direita, no meio da altura da tela, com z-index
     * 2147483639 (quase o máximo possível). Disputar aquele espaço deixaria um
     * widget de acessibilidade cobrindo o outro — os dois públicos que mais
     * precisam da página, atrapalhados justamente pelo que veio ajudá-los.
     */
    <div className="fixed bottom-4 left-4 z-[90] print:hidden">
      {aberto && (
        <div
          ref={painelRef}
          id={painelId}
          className="mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-border bg-bone p-5 shadow-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-brown-dark">
              Acessibilidade
            </h2>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                botaoRef.current?.focus();
              }}
              className="rounded-full p-1.5 text-taupe transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Fechar opções de acessibilidade"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* ---- Contraste ---- */}
          <div className="mt-5">
            <span className="flex items-center gap-2 text-sm font-medium text-brown-dark">
              <Contrast className="size-4 text-terracotta-text" aria-hidden="true" />
              Alto contraste
            </span>
            {/*
              `aria-pressed` em vez de um switch improvisado: é o padrão ARIA
              para botão que liga/desliga, e o leitor de tela anuncia
              "pressionado"/"não pressionado" sozinho, sem texto extra.
            */}
            <button
              type="button"
              aria-pressed={preferencias.contraste === "alto"}
              onClick={() =>
                definir("contraste", preferencias.contraste === "alto" ? "normal" : "alto")
              }
              className="group mt-2 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-2.5 text-sm text-taupe transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-brown-dark"
            >
              {preferencias.contraste === "alto" ? "Ativado" : "Desativado"}
              <span
                aria-hidden="true"
                className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors group-aria-pressed:bg-primary"
              >
                <span className="absolute top-1 left-1 size-4 rounded-full bg-bone shadow transition-transform group-aria-pressed:translate-x-5" />
              </span>
            </button>
          </div>

          {/* ---- Tamanho do texto ---- */}
          <fieldset className="mt-5">
            {/*
              <fieldset>/<legend> com radios de verdade, e não três botões.
              O agrupamento é anunciado ("Tamanho do texto, 1 de 3") e as setas
              do teclado navegam entre as opções sem nenhuma linha de JS — é
              comportamento nativo do navegador.
            */}
            <legend className="flex items-center gap-2 text-sm font-medium text-brown-dark">
              <Type className="size-4 text-terracotta-text" aria-hidden="true" />
              Tamanho do texto
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TAMANHOS.map((t, i) => (
                <label
                  key={t.valor}
                  className="flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border border-border px-2 py-2.5 text-taupe transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-primary/10 has-checked:text-brown-dark has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
                >
                  <input
                    type="radio"
                    name="tamanho-do-texto"
                    value={t.valor}
                    checked={preferencias.fonte === t.valor}
                    onChange={() => definir("fonte", t.valor)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="font-heading font-semibold leading-none"
                    style={{ fontSize: `${0.9 + i * 0.3}rem` }}
                  >
                    {t.amostra}
                  </span>
                  <span className="text-[0.7rem]">{t.rotulo}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* ---- Movimento ---- */}
          <div className="mt-5">
            <span className="flex items-center gap-2 text-sm font-medium text-brown-dark">
              <Waves className="size-4 text-terracotta-text" aria-hidden="true" />
              Reduzir animações
            </span>
            <button
              type="button"
              aria-pressed={preferencias.movimento === "reduzido"}
              onClick={() =>
                definir("movimento", preferencias.movimento === "reduzido" ? "normal" : "reduzido")
              }
              className="group mt-2 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-2.5 text-sm text-taupe transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-brown-dark"
            >
              {preferencias.movimento === "reduzido" ? "Ativado" : "Desativado"}
              <span
                aria-hidden="true"
                className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors group-aria-pressed:bg-primary"
              >
                <span className="absolute top-1 left-1 size-4 rounded-full bg-bone shadow transition-transform group-aria-pressed:translate-x-5" />
              </span>
            </button>
            <p className="mt-2 text-xs text-taupe">
              Já vem ligado se o seu sistema pede menos movimento.
            </p>
          </div>

          {alterado && (
            <button
              type="button"
              onClick={restaurar}
              className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-taupe underline underline-offset-4 transition-colors hover:text-terracotta-text focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Restaurar padrões
            </button>
          )}
        </div>
      )}

      <button
        ref={botaoRef}
        type="button"
        // `accessKey="5"` é o atalho que o eMAG reserva para acessibilidade nos
        // sites brasileiros (1 conteúdo, 2 menu, 3 busca, 4 rodapé, 5 aqui).
        accessKey="5"
        aria-expanded={aberto}
        aria-controls={painelId}
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Accessibility className="size-5" aria-hidden="true" />
        {/*
          O rótulo some no celular por espaço, mas o `sr-only` mantém o nome
          acessível do botão intacto — ícone sozinho não tem nome nenhum para
          um leitor de tela.
        */}
        <span className="sr-only sm:not-sr-only">Acessibilidade</span>
      </button>
    </div>
  );
}
