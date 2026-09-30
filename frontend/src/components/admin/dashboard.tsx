import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Peças do Dashboard. Server Components puros: nada aqui vai para o navegador
 * como JavaScript, e os "gráficos" são HTML com largura em porcentagem, lidos
 * por leitor de tela como lista de números.
 */

export const classeCartao = "rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm";

/** Título de seção do painel: sobretítulo + título + subtítulo opcional. */
export function TituloSecao({ id, sobretitulo, titulo, subtitulo, acao }: { id: string; sobretitulo: string; titulo: string; subtitulo?: string; acao?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="painel-sobretitulo">{sobretitulo}</p>
        <h2 id={id} className="mt-1 font-heading text-xl font-semibold text-brown-dark">{titulo}</h2>
        {subtitulo && <p className="mt-1 max-w-2xl text-sm text-taupe">{subtitulo}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Indicador: rótulo, número grande, uma linha de contexto e o ícone. */
export function Indicador({
  titulo,
  valor,
  dica,
  icone: Icone,
  href,
  alerta = false,
}: {
  titulo: string;
  valor: string | number;
  dica?: ReactNode;
  icone: LucideIcon;
  href: string;
  /** Pinta o ícone de vermelho: há algo pedindo ação. */
  alerta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        classeCartao,
        "group relative block transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="painel-sobretitulo">{titulo}</p>
          <p className="font-heading text-4xl font-semibold tracking-tight text-brown-dark tabular-nums">{valor}</p>
          {dica && <p className="text-xs text-taupe">{dica}</p>}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[0.75rem] ring-1",
            alerta ? "bg-terracotta/20 text-terracotta-text ring-terracotta/40" : "bg-muted/60 text-terracotta-text ring-border",
          )}
          aria-hidden="true"
        >
          <Icone className="size-4" />
        </span>
      </div>
    </Link>
  );
}

export type ItemAtencao = {
  chave: string;
  icone: LucideIcon;
  texto: string;
  detalhe?: string;
  total: number;
  href: string;
  acao: string;
  grave?: boolean;
};

/**
 * A fila de trabalho: só o que pede ação. Item com zero não aparece, porque
 * uma lista de zeros ensina a não olhar para ela.
 */
export function ListaDeAtencao({ itens }: { itens: ItemAtencao[] }) {
  const visiveis = itens.filter((i) => i.total > 0);
  if (visiveis.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-[0.875rem] bg-brown/10 p-5 text-sm text-brown-dark ring-1 ring-brown/25">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        Tudo em dia. Nada pedindo atenção agora.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {visiveis.map(({ chave, icone: Icone, texto, detalhe, total, href, acao, grave }) => (
        <li key={chave} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[0.75rem]",
              grave ? "bg-terracotta/20 text-terracotta-text" : "bg-beige text-brown",
            )}
            aria-hidden="true"
          >
            <Icone className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brown-dark">
              <span className="tabular-nums">{total}</span> {texto}
            </p>
            {detalhe && <p className="mt-0.5 text-xs text-taupe">{detalhe}</p>}
          </div>
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-terracotta-text transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {acao}
            <span className="sr-only">: {texto}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Barras horizontais proporcionais ao maior valor. Serve ao funil de adoção e
 * às necessidades por tipo.
 */
export function Barras({ itens, vazio }: { itens: { rotulo: string; valor: number; tom?: string }[]; vazio: string }) {
  const maior = Math.max(0, ...itens.map((i) => i.valor));
  if (maior === 0) return <p className="text-sm text-taupe">{vazio}</p>;
  return (
    <ul className="space-y-4">
      {itens.map((i) => (
        <li key={i.rotulo}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-brown-dark">{i.rotulo}</span>
            <span className="font-semibold text-brown-dark tabular-nums">{i.valor}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted/70" aria-hidden="true">
            <div className={cn("h-full rounded-full", i.tom ?? "bg-terracotta")} style={{ width: `${(i.valor / maior) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Colunas por mês. A altura é a quantidade de registros; o valor em dinheiro
 * vai embaixo, por extenso. Tabela escondida para leitor de tela: coluna
 * desenhada não é lida.
 */
export function ColunasMensais({ meses }: { meses: { rotulo: string; rotuloLongo: string; total: number; valor: string }[] }) {
  const maior = Math.max(0, ...meses.map((m) => m.total));
  return (
    <>
      <div className="flex h-52 items-end gap-3 sm:gap-5" aria-hidden="true">
        {meses.map((m) => (
          <div key={m.rotulo} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs font-semibold text-brown-dark tabular-nums">{m.total}</span>
            <div
              className="w-full max-w-16 rounded-t-[0.5rem] bg-terracotta/80"
              style={{ height: maior === 0 ? "2px" : `max(2px, ${(m.total / maior) * 100}%)` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 border-t border-border pt-3 sm:gap-5" aria-hidden="true">
        {meses.map((m) => (
          <div key={m.rotulo} className="min-w-0 flex-1 text-center">
            <p className="text-xs font-medium text-brown-dark capitalize">{m.rotulo}</p>
            <p className="truncate text-[11px] text-taupe tabular-nums">{m.valor}</p>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Doações registradas por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Registros</th>
            <th scope="col">Valor em dinheiro</th>
          </tr>
        </thead>
        <tbody>
          {meses.map((m) => (
            <tr key={m.rotulo}>
              <th scope="row">{m.rotuloLongo}</th>
              <td>{m.total}</td>
              <td>{m.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
