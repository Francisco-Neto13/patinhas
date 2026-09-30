"use client";

import { useId } from "react";
import { Contrast, RotateCcw, Type, Waves } from "lucide-react";
import { usePreferencias, type Fonte } from "@/components/acessibilidade/preferencias";

const TAMANHOS: { valor: Fonte; rotulo: string }[] = [
  { valor: "normal", rotulo: "Padrão" },
  { valor: "grande", rotulo: "Grande" },
  { valor: "maior", rotulo: "Maior" },
];

const classeAlternar =
  "group mt-2 flex w-full items-center justify-between rounded-2xl border border-border px-4 py-2.5 text-sm text-taupe transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-brown-dark";

/** O "interruptor" desenhado dentro do botão. O estado real é o `aria-pressed`. */
function Interruptor() {
  return (
    <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition-colors group-aria-pressed:bg-primary">
      <span className="absolute top-1 left-1 size-4 rounded-full bg-bone shadow transition-transform group-aria-pressed:translate-x-5" />
    </span>
  );
}

/**
 * Os três ajustes de acessibilidade (contraste, texto, movimento), num lugar só.
 *
 * Usado pelo menu "Acessibilidade" da barra do topo do site e pela seção de
 * mesmo nome em "Minha conta", no painel. As preferências são as MESMAS nos
 * dois (moram no navegador, ver preferencias.tsx): ligar alto contraste no
 * painel liga também no site.
 */
export function ControlesAcessibilidade() {
  const { preferencias, definir, restaurar, alterado } = usePreferencias();
  // Dois grupos de rádio na mesma página (site e painel nunca, mas dois menus
  // abertos por engano sim): o `name` precisa ser único.
  const nomeFonte = useId();

  return (
    <div className="space-y-5">
      <div>
        <span className="flex items-center gap-2 text-sm font-medium text-brown-dark">
          <Contrast className="size-4 text-terracotta-text" aria-hidden="true" />
          Alto contraste
        </span>
        {/*
          `aria-pressed` em vez de um switch improvisado: é o padrão ARIA para
          botão que liga/desliga, e o leitor de tela anuncia
          "pressionado"/"não pressionado" sozinho, sem texto extra.
        */}
        <button
          type="button"
          aria-pressed={preferencias.contraste === "alto"}
          onClick={() => definir("contraste", preferencias.contraste === "alto" ? "normal" : "alto")}
          className={classeAlternar}
        >
          {preferencias.contraste === "alto" ? "Ativado" : "Desativado"}
          <Interruptor />
        </button>
      </div>

      {/*
        <fieldset>/<legend> com rádios de verdade, e não três botões. O grupo é
        anunciado ("Tamanho do texto, 1 de 3") e as setas do teclado navegam
        entre as opções sem nenhuma linha de JS.
      */}
      <fieldset>
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
                name={nomeFonte}
                value={t.valor}
                checked={preferencias.fonte === t.valor}
                onChange={() => definir("fonte", t.valor)}
                className="sr-only"
              />
              <span aria-hidden="true" className="font-heading leading-none font-semibold" style={{ fontSize: `${0.9 + i * 0.3}rem` }}>
                A
              </span>
              <span className="text-[0.7rem]">{t.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <span className="flex items-center gap-2 text-sm font-medium text-brown-dark">
          <Waves className="size-4 text-terracotta-text" aria-hidden="true" />
          Reduzir animações
        </span>
        <button
          type="button"
          aria-pressed={preferencias.movimento === "reduzido"}
          onClick={() => definir("movimento", preferencias.movimento === "reduzido" ? "normal" : "reduzido")}
          className={classeAlternar}
        >
          {preferencias.movimento === "reduzido" ? "Ativado" : "Desativado"}
          <Interruptor />
        </button>
        <p className="mt-2 text-xs text-taupe">Já vem ligado se o seu sistema pede menos movimento.</p>
      </div>

      {alterado && (
        <button
          type="button"
          onClick={restaurar}
          className="inline-flex items-center gap-2 text-xs font-medium text-taupe underline underline-offset-4 transition-colors hover:text-terracotta-text focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Restaurar padrões
        </button>
      )}
    </div>
  );
}
