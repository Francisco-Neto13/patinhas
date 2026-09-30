"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@base-ui/react/tooltip";
import { Dog, FileText, HandCoins, HeartHandshake, Home, LayoutDashboard, Mail, Megaphone, Settings, Users } from "lucide-react";
import { itemAtivo, type GrupoNav, type IconeNav } from "@/lib/admin/navegacao";
import { cn } from "@/lib/utils";

const ICONES: Record<IconeNav, typeof Home> = {
  dashboard: LayoutDashboard,
  organizacoes: Home,
  animais: Dog,
  necessidades: HeartHandshake,
  doacoes: HandCoins,
  campanhas: Megaphone,
  mensagens: Mail,
  conteudo: FileText,
  usuarios: Users,
  configuracoes: Settings,
};

export type Contadores = Partial<Record<"mensagens", number>>;

/**
 * Barra lateral do painel. Ver documentation/administracao/LAYOUT-PAINEL.MD.
 *
 * A mesma barra serve à coluna fixa (desktop, que pode recolher) e à gaveta do
 * celular (sempre aberta). Quem decide onde ela mora é a `CascaPainel`.
 */
export function BarraLateral({
  grupos,
  contadores,
  recolhida = false,
}: {
  grupos: GrupoNav[];
  contadores: Contadores;
  recolhida?: boolean;
}) {
  const caminho = usePathname();
  // A barra existe duas vezes na página (coluna e gaveta): id fixo repetiria.
  const base = useId();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-lg font-heading text-lg font-semibold text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Image src="/logo-patinhas.png" alt="" width={36} height={36} className="size-9 rounded-full" />
          {/* Recolhida, o nome some da tela mas não do link: sem ele o leitor de
              tela anunciaria um link sem nome. */}
          <span className={recolhida ? "sr-only" : undefined}>Patinhas</span>
        </Link>
      </div>

      <nav aria-label="Menu do painel" className="flex-1 overflow-y-auto px-2 py-3">
        <Tooltip.Provider delay={200}>
          {grupos.map((grupo, g) => (
            <div key={grupo.rotulo} className={recolhida ? "px-2" : "px-2 py-1"}>
              {/* Recolhida, o título do grupo some da tela e os ícones seguem
                  numa coluna só, como nos CRMs da casa: separar grupos só faz
                  sentido quando dá para ler o nome deles. O texto continua para
                  o leitor de tela, que é quem nomeia a lista abaixo. */}
              <div
                id={`${base}-${g}`}
                className={
                  recolhida
                    ? "sr-only"
                    : "flex h-6 items-center px-2 font-sans text-[10px] font-medium tracking-[0.22em] text-sidebar-rotulo uppercase"
                }
              >
                {grupo.rotulo}
              </div>
              {/* A lista leva o nome do grupo. Título h2 aqui entraria no
                  esqueleto da página antes do h1, a cada tela. */}
              <ul aria-labelledby={`${base}-${g}`} className="flex flex-col gap-1 pb-1">
                {grupo.itens.map((item) => {
                  const ativo = itemAtivo(item.href, caminho);
                  const Icone = ICONES[item.icone];
                  const total = item.contador ? contadores[item.contador] ?? 0 : 0;
                  const propsDoLink = {
                    href: item.href,
                    // `aria-current` é o que diz ao leitor de tela em que página
                    // se está. O fundo sozinho só serve para quem enxerga.
                    "aria-current": ativo ? ("page" as const) : undefined,
                    className: cn(
                      "relative flex w-full items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      recolhida ? "mx-auto size-10 justify-center" : "px-2.5 py-2",
                      ativo
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    ),
                  };
                  const conteudo = (
                    <>
                      <Icone className="size-4 shrink-0" aria-hidden="true" />
                      <span className={recolhida ? "sr-only" : "truncate"}>{item.rotulo}</span>
                      {/* Só com número maior que zero: um "0" fixo ao lado de
                          Mensagens é ruído, e ruído fixo ensina a não olhar.
                          Recolhida, o número não cabe e vira um ponto. */}
                      {total > 0 &&
                        (recolhida ? (
                          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-sidebar-primary">
                            <span className="sr-only">, {total} não lidas</span>
                          </span>
                        ) : (
                          <span className="ml-auto min-w-5 rounded-full bg-sidebar-primary px-1.5 text-center text-[10px] leading-5 font-semibold text-sidebar-primary-foreground tabular-nums">
                            {total > 99 ? "99+" : total}
                            <span className="sr-only"> não lidas</span>
                          </span>
                        ))}
                    </>
                  );

                  return (
                    <li key={item.href}>
                      {recolhida ? (
                        // Recolhida, o nome aparece num balão ao passar o mouse
                        // ou focar pelo teclado.
                        <Tooltip.Root>
                          <Tooltip.Trigger render={<Link {...propsDoLink} />}>{conteudo}</Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Positioner side="right" sideOffset={10} className="z-50">
                              <Tooltip.Popup className="rounded-md bg-brown-dark px-2.5 py-1.5 text-xs font-medium text-bone shadow-md">
                                {item.rotulo}
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      ) : (
                        <Link {...propsDoLink}>{conteudo}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Tooltip.Provider>
      </nav>
    </div>
  );
}
