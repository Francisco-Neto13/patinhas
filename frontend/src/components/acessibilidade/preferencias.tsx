"use client";

import { MotionConfig } from "framer-motion";
import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";

export const CHAVE_ARMAZENAMENTO = "patinhas:acessibilidade";

export type Contraste = "normal" | "alto";
export type Fonte = "normal" | "grande" | "maior";
export type Movimento = "normal" | "reduzido";

export type Preferencias = {
  contraste: Contraste;
  fonte: Fonte;
  movimento: Movimento;
};

const PADRAO: Preferencias = {
  contraste: "normal",
  fonte: "normal",
  movimento: "normal",
};

/**
 * ⚠️ Este script roda ANTES da primeira pintura, e é por isso que ele é uma
 * string em vez de um efeito do React.
 *
 * Se a preferência só fosse aplicada depois que o React hidrata, quem escolheu
 * alto contraste veria a página acender em creme e só então virar preta, a cada
 * navegação. É o mesmo flash que assombra seletor de tema — e para quem ligou
 * alto contraste por sensibilidade à luz, o flash não é um detalhe estético.
 *
 * Ele é deliberadamente pequeno e à prova de falha: qualquer erro (localStorage
 * bloqueado em aba anônima, JSON corrompido) cai no `catch` e a página segue com
 * a aparência padrão.
 */
export const SCRIPT_SEM_FLASH = `
(function(){
  try {
    var p = JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE_ARMAZENAMENTO)}) || "{}");
    var d = document.documentElement;
    if (p.contraste === "alto") d.setAttribute("data-contraste", "alto");
    if (p.fonte === "grande" || p.fonte === "maior") d.setAttribute("data-fonte", p.fonte);
    var m = p.movimento;
    if (!m && window.matchMedia("(prefers-reduced-motion: reduce)").matches) m = "reduzido";
    if (m === "reduzido") d.setAttribute("data-movimento", "reduzido");
  } catch (e) {}
})();
`.trim();

/* ============================================================================
   A fonte da verdade são os atributos no <html>, não um estado do React.

   Quem escreve primeiro é o SCRIPT_SEM_FLASH, antes de qualquer JavaScript de
   aplicação existir. Se o React guardasse a preferência em `useState`, haveria
   duas verdades — a que está pintada na tela e a que o componente acha que
   está — e elas divergiriam já no primeiro render.

   Por isso o padrão aqui é uma store externa lida com `useSyncExternalStore`:
   ele foi feito exatamente para estado que mora fora do React e precisa
   sobreviver à hidratação sem descompasso.
   ========================================================================= */

const ouvintes = new Set<() => void>();

function lerDoDocumento(): Preferencias {
  const d = document.documentElement;
  return {
    contraste: d.getAttribute("data-contraste") === "alto" ? "alto" : "normal",
    fonte: (d.getAttribute("data-fonte") as Fonte | null) ?? "normal",
    movimento: d.getAttribute("data-movimento") === "reduzido" ? "reduzido" : "normal",
  };
}

/*
 * ⚠️ O retorno de `getSnapshot` precisa ser a MESMA referência enquanto nada
 * muda. Devolver um objeto novo a cada chamada põe o React num laço infinito de
 * re-render, porque ele compara por identidade. Daí este cache.
 */
let instantaneo: Preferencias = PADRAO;

// No cliente o cache já nasce com o que o script inline pintou na tela. Durante
// a hidratação o React ainda usa `getServerSnapshot` (o padrão), e logo em
// seguida troca para este valor — que é justamente o descompasso que o
// `useSyncExternalStore` sabe resolver sozinho, sem aviso no console.
if (typeof document !== "undefined") {
  instantaneo = lerDoDocumento();
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

const obterInstantaneo = () => instantaneo;
const obterInstantaneoDoServidor = () => PADRAO;

function escrever(proximo: Preferencias) {
  const d = document.documentElement;
  const mexer = (atributo: string, valor: string, padrao: string) => {
    if (valor === padrao) d.removeAttribute(atributo);
    else d.setAttribute(atributo, valor);
  };
  mexer("data-contraste", proximo.contraste, "normal");
  mexer("data-fonte", proximo.fonte, "normal");
  mexer("data-movimento", proximo.movimento, "normal");

  try {
    if (
      proximo.contraste === "normal" &&
      proximo.fonte === "normal" &&
      proximo.movimento === "normal"
    ) {
      localStorage.removeItem(CHAVE_ARMAZENAMENTO);
    } else {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(proximo));
    }
  } catch {
    // Aba anônima ou armazenamento bloqueado: a escolha vale para esta sessão e
    // não persiste. Melhor do que deixar o clique estourar.
  }

  instantaneo = proximo;
  for (const ouvinte of ouvintes) ouvinte();
}

export function usePreferencias() {
  const preferencias = useSyncExternalStore(
    assinar,
    obterInstantaneo,
    obterInstantaneoDoServidor,
  );

  const definir = useCallback(
    <C extends keyof Preferencias>(chave: C, valor: Preferencias[C]) => {
      escrever({ ...instantaneo, [chave]: valor });
    },
    [],
  );

  const restaurar = useCallback(() => escrever(PADRAO), []);

  return useMemo(
    () => ({
      preferencias,
      definir,
      restaurar,
      alterado:
        preferencias.contraste !== "normal" ||
        preferencias.fonte !== "normal" ||
        preferencias.movimento !== "normal",
    }),
    [preferencias, definir, restaurar],
  );
}

/**
 * A pergunta "devo animar?" respondida num lugar só.
 *
 * ⚠️ NÃO use o `useReducedMotion` do Framer Motion para isto.
 *
 * Ele lê exclusivamente o `prefers-reduced-motion` do sistema operacional e
 * ignora o `<MotionConfig>`. Verificado no navegador: com o botão da barra
 * ligado, `data-movimento` virava "reduzido" e os componentes animados
 * continuavam animando. Ou seja, o botão não fazia nada para a animação de
 * JavaScript.
 *
 * Este hook lê a nossa store, que já combina as duas origens: o script sem
 * flash grava `data-movimento` a partir do que foi salvo OU, na falta de
 * escolha, do `prefers-reduced-motion` do sistema.
 */
export function useMovimentoReduzido() {
  return usePreferencias().preferencias.movimento === "reduzido";
}

export function ProvedorAcessibilidade({ children }: { children: ReactNode }) {
  const { preferencias } = usePreferencias();

  return (
    /*
      Cobre as animações que os componentes `motion` fazem por conta própria,
      como o `whileHover` dos cards de plataforma, por exemplo.

      ⚠️ Mas NÃO cobre tudo, e essa foi a lição: o `useReducedMotion` da
      biblioteca ignora este ajuste e lê só o `prefers-reduced-motion` do
      sistema. Quem decide se um componente nosso anima é o
      `useMovimentoReduzido` acima, não esta linha. Ela fica porque ainda
      desliga o que é interno do Framer Motion.
    */
    <MotionConfig reducedMotion={preferencias.movimento === "reduzido" ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}
