"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, ExternalLink, LogOut, UserRound } from "lucide-react";
import { sair } from "@/app/admin/login/actions";
import { DialogoConfirmacao } from "@/components/admin/confirmacao";

export type UsuarioDaCasca = {
  nome: string;
  email: string;
  ehPatinhas: boolean;
};

/**
 * Nome vazio vira "?" e não uma letra inventada: avatar com a inicial errada
 * parece informação.
 */
function inicialDe(nome: string, email: string) {
  return (nome.trim() || email.trim()).charAt(0).toUpperCase() || "?";
}

const classeItem =
  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-brown-dark outline-none select-none data-highlighted:bg-muted";

/**
 * Quem está logado, no canto superior direito. Sair mora aqui, junto da
 * identidade da conta, e não na barra lateral: dois botões iguais na mesma
 * tela obrigam a pessoa a decidir se fazem a mesma coisa.
 *
 * O Menu do Base UI já traz Esc, clique fora, setas e devolução do foco.
 */
export function MenuConta({ usuario }: { usuario: UsuarioDaCasca }) {
  const [saindo, iniciar] = useTransition();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const papel = usuario.ehPatinhas ? "Equipe Patinhas" : "Admin da ONG";

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          className="group flex items-center gap-2 rounded-lg py-1 pr-1.5 pl-1 transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Conta de ${usuario.nome}`}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-terracotta to-brown text-sm font-semibold text-bone"
            aria-hidden="true"
          >
            {inicialDe(usuario.nome, usuario.email)}
          </span>
          <span className="hidden max-w-40 truncate text-sm font-medium text-brown-dark lg:block">{usuario.nome}</span>
          <ChevronDown
            className="size-4 shrink-0 text-taupe transition-transform group-data-popup-open:rotate-180"
            aria-hidden="true"
          />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner align="end" sideOffset={8} className="z-50 outline-none">
            <Menu.Popup className="w-72 origin-(--transform-origin) rounded-xl border border-border bg-popover p-1 shadow-lg outline-none transition-[scale,opacity] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              {/* O papel fica na MESMA linha do nome, à direita: embaixo ele se
                  leria como um terceiro dado da pessoa. */}
              <div className="flex items-start justify-between gap-2 border-b border-border px-2.5 pt-1.5 pb-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brown-dark">{usuario.nome}</p>
                  <p className="mt-0.5 truncate text-xs text-taupe">{usuario.email}</p>
                </div>
                <span className="mt-0.5 shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wider text-brown-dark uppercase ring-1 ring-border">
                  {papel}
                </span>
              </div>

              <div className="py-1">
                <Menu.LinkItem render={<Link href="/admin/conta" />} className={classeItem} closeOnClick>
                  <UserRound className="size-4" aria-hidden="true" /> Minha conta
                </Menu.LinkItem>
                <Menu.LinkItem href="/" target="_blank" rel="noreferrer" className={classeItem} closeOnClick>
                  <ExternalLink className="size-4" aria-hidden="true" /> Ver o site
                  <span className="sr-only"> (abre em nova aba)</span>
                </Menu.LinkItem>
              </div>

              <Menu.Separator className="mx-1 h-px bg-border" />

              <div className="pt-1">
                <Menu.Item
                  className={`${classeItem} text-destructive data-highlighted:bg-destructive/10`}
                  disabled={saindo}
                  // Pergunta antes: no computador compartilhado de um abrigo,
                  // sair por engano no meio de um cadastro custa o que foi digitado.
                  onClick={() => setConfirmandoSaida(true)}
                >
                  <LogOut className="size-4" aria-hidden="true" /> {saindo ? "Saindo..." : "Sair"}
                </Menu.Item>
              </div>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <DialogoConfirmacao
        pedido={{
          titulo: "Sair do painel?",
          descricao: "Sua sessão neste aparelho é encerrada. Para voltar, entre de novo com e-mail e senha.",
          rotuloConfirmar: "Sair",
        }}
        aberto={confirmandoSaida}
        aoMudarAberto={setConfirmandoSaida}
        aoConfirmar={() => iniciar(() => sair())}
      />
    </>
  );
}
