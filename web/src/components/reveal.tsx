"use client";

import { motion, type Variants } from "framer-motion";
import { useMovimentoReduzido } from "@/components/acessibilidade/preferencias";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const movimentoReduzido = useMovimentoReduzido();

  /*
   * ⚠️ Quem pediu menos movimento não recebe uma animação mais curta: recebe
   * uma <div> comum.
   *
   * Só apagar a transição não bastaria, porque o elemento nasce em `opacity: 0` e
   * quem faz ele aparecer é a própria animação. Sem ela, o conteúdo sumiria.
   * Por isso aqui o wrapper de movimento sai inteiro do caminho.
   *
   * `useMovimentoReduzido` atende as duas origens de uma vez: a preferência do
   * sistema e o botão da barra de acessibilidade. Ver o comentário do hook
   * para por que o `useReducedMotion` do Framer Motion NÃO serve aqui.
   */
  if (movimentoReduzido) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      // ⚠️ Marca para o <noscript> do layout.
      //
      // O HTML servido traz 39 elementos com `opacity:0`. É assim que o
      // Framer Motion prepara o estado inicial. Quem faz eles aparecerem é o
      // JavaScript. Se ele não rodar (falha de rede, bloqueio, navegador
      // antigo), a página fica praticamente em branco: o conteúdo está no
      // HTML, mas invisível. O seletor `[data-reveal]` no <noscript>
      // devolve tudo ao normal nesse caso.
      data-reveal=""
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
