import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CircleHelp, Megaphone, Type } from "lucide-react";
import * as conteudo from "@/server/dados/conteudo";
import { CabecalhoPagina } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Conteúdo" };

export default async function PaginaConteudo() {
  const { textos, perguntas, banners } = await conteudo.resumo();

  const areas = [
    { href: "/admin/conteudo/textos", titulo: "Página inicial e textos", resumo: textos ? `${textos} texto(s) personalizado(s)` : "Todos com o texto original", Icone: Type },
    { href: "/admin/campanhas", titulo: "Campanhas e destaques", resumo: `${banners} ativa(s)`, Icone: Megaphone },
    { href: "/admin/conteudo/faq", titulo: "Perguntas frequentes", resumo: `${perguntas} pergunta(s) no site`, Icone: CircleHelp },
  ];

  return (
    <>
      <CabecalhoPagina titulo="Conteúdo" descricao="O que o site mostra, sem precisar mexer no código." />
      <ul className="grid gap-4 md:grid-cols-3">
        {areas.map(({ href, titulo, resumo, Icone }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full items-center gap-4 rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.875rem] bg-terracotta/15 text-terracotta-text">
                <Icone className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading font-semibold text-brown-dark">{titulo}</span>
                <span className="block text-sm text-taupe">{resumo}</span>
              </span>
              <ChevronRight className="size-4 text-taupe transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
