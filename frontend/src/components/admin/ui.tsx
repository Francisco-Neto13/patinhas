import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Tom } from "@/lib/admin/rotulos";
import { cn } from "@/lib/utils";
import { Sobretitulo } from "./sobretitulo";

/**
 * Cabeçalho de toda página do painel, em três níveis: sobretítulo (o grupo do
 * menu), título e subtítulo. Ver LAYOUT-PAINEL.MD, seção 5.
 */
export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
  destaque = false,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: { href: string; rotulo: string };
  /** Título maior, só no Dashboard. */
  destaque?: boolean;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <Sobretitulo />
        <h1 className={cn("painel-titulo", destaque && "text-4xl")}>{titulo}</h1>
        {descricao && <p className="painel-subtitulo max-w-3xl">{descricao}</p>}
      </div>
      {acao && (
        <Link href={acao.href} className={buttonVariants({ size: "lg", className: "h-10 shrink-0 self-start rounded-full px-5 sm:self-auto" })}>
          <Plus className="size-4" aria-hidden="true" /> {acao.rotulo}
        </Link>
      )}
    </header>
  );
}

/*
 * Cores do selo de status. O texto do selo SEMPRE diz o status por extenso:
 * a cor ajuda quem bate o olho, mas a informação não depende dela (WCAG 1.4.1).
 */
const TONS: Record<Tom, string> = {
  // Só a paleta do Patinhas. O texto é sempre o marrom escuro (contraste alto
  // em todos os fundos); o que muda é o tom de fundo e a borda.
  verde: "bg-brown/10 text-brown-dark ring-brown/30",
  ambar: "bg-beige text-brown-dark ring-borda-forte/40",
  vermelho: "bg-terracotta/20 text-brown-dark ring-terracotta/50",
  azul: "bg-cream text-brown-dark ring-border",
  neutro: "bg-muted text-brown-dark ring-border",
};

export function Selo({ tom = "neutro", children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset", TONS[tom])}>
      {children}
    </span>
  );
}

/** Confirmação depois de salvar, lida da query string (`?ok=...`). */
export function AvisoOk({ texto }: { texto?: string | null }) {
  if (!texto) return null;
  return (
    // `role="status"` anuncia sem interromper o que o leitor de tela estiver lendo.
    <p role="status" className="mb-6 flex items-center gap-2 rounded-[0.875rem] border border-brown/25 bg-brown/10 px-4 py-3 text-sm text-brown-dark">
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" /> {texto}
    </p>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-borda-forte/60 bg-bone/60 px-6 py-12 text-center text-sm text-taupe">
      {children}
    </div>
  );
}

/** Tabela com rolagem própria: no celular ela rola, a página não. */
export function Tabela({ cabecalhos, children, legenda }: { cabecalhos: string[]; children: ReactNode; legenda: string }) {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-border bg-bone shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        {/* A legenda dá nome à tabela para quem navega por leitor de tela. */}
        <caption className="sr-only">{legenda}</caption>
        <thead className="border-b border-border bg-muted/50 text-[10px] font-medium tracking-[0.18em] text-taupe uppercase">
          <tr>
            {cabecalhos.map((c, i) => (
              <th key={i} scope="col" className="px-5 py-3.5 first:pl-7 last:pr-7">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border [&>tr]:transition-colors [&>tr:hover]:bg-muted/30">{children}</tbody>
      </table>
    </div>
  );
}

// Primeira e última coluna com folga extra: são as que encostam na curva do
// cartão, e texto colado no canto arredondado parece cortado.
export const classeCelula = "px-5 py-4 align-middle first:pl-7 last:pr-7";

export function LinkEditar({ href, nome }: { href: string; nome: string }) {
  return (
    <Link href={href} className="font-medium text-brown-dark underline-offset-4 hover:text-terracotta-text hover:underline">
      {nome}
    </Link>
  );
}

/** Seção de um formulário longo, com título. */
export function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm sm:p-7">
      <legend className="px-2 font-heading text-xl font-semibold text-brown-dark">{titulo}</legend>
      <div className="mt-2 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/**
 * Abas de filtro por status. São links comuns (`?status=...`), então o filtro
 * funciona sem JavaScript, fica no histórico do navegador e dá para
 * compartilhar a URL de "necessidades atendidas".
 */
export function Filtros({
  base,
  atual,
  opcoes,
}: {
  base: string;
  atual?: string;
  opcoes: { valor?: string; rotulo: string; total?: number }[];
}) {
  return (
    <nav aria-label="Filtrar por status" className="mb-5">
      <ul className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativo = (o.valor ?? "") === (atual ?? "");
          return (
            <li key={o.valor ?? "todos"}>
              <Link
                href={o.valor ? `${base}?status=${o.valor}` : base}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-bone text-brown-dark hover:bg-muted",
                )}
              >
                {o.rotulo}
                {o.total !== undefined && <span className={ativo ? "opacity-80" : "text-taupe"}>({o.total})</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
