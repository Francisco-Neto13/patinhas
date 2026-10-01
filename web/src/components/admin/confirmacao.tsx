"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Confirmação antes de uma ação que custa desfazer.
 *
 * Onde vale usar, e onde não:
 *
 * - **Vale** quando desfazer é caro, impossível ou tem efeito fora do painel:
 *   excluir, desativar alguém, mudar permissão, cadastrar algo que já vai
 *   para o site, publicar texto, encerrar a sessão, sair com alteração não
 *   salva.
 * - **Não vale** em ação reversível de um clique: trocar de aba, filtrar,
 *   marcar como lida. Pedir confirmação para tudo treina a pessoa a clicar
 *   "confirmar" sem ler, e aí o diálogo deixa de proteger onde importa.
 *
 * O AlertDialog do Base UI prende o foco, fecha com Esc, devolve o foco a
 * quem abriu e é anunciado como `alertdialog` pelo leitor de tela.
 */
export type PedidoConfirmacao = {
  titulo: string;
  descricao: ReactNode;
  rotuloConfirmar: string;
  /** Pinta o botão de confirmar de vermelho. Use em exclusão e desativação. */
  destrutiva?: boolean;
  rotuloCancelar?: string;
  /** Só um aviso, sem escolha: some o botão de cancelar. */
  soAviso?: boolean;
};

export function DialogoConfirmacao({
  pedido,
  aberto,
  aoMudarAberto,
  aoConfirmar,
  gatilho,
}: {
  pedido: PedidoConfirmacao | null;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  aoConfirmar: () => void;
  /** Elemento que abre o diálogo. Sem ele, o diálogo é controlado de fora. */
  gatilho?: ReactElement;
}) {
  const Icone = pedido?.destrutiva ? AlertTriangle : HelpCircle;

  return (
    <AlertDialog.Root open={aberto} onOpenChange={aoMudarAberto}>
      {gatilho && <AlertDialog.Trigger render={gatilho} />}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-[60] bg-brown-dark/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-[61] w-[28rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-border bg-bone p-7 shadow-xl outline-none transition-[scale,opacity] duration-150 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {pedido && (
            <>
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    pedido.destrutiva ? "bg-destructive/10 text-destructive" : "bg-terracotta/15 text-terracotta-text",
                  )}
                  aria-hidden="true"
                >
                  <Icone className="size-5" />
                </span>
                <div className="min-w-0 space-y-1.5 pt-1">
                  <AlertDialog.Title className="font-heading text-xl font-semibold text-brown-dark">{pedido.titulo}</AlertDialog.Title>
                  <AlertDialog.Description className="text-sm leading-relaxed text-taupe">{pedido.descricao}</AlertDialog.Description>
                </div>
              </div>
              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {!pedido.soAviso && (
                  <AlertDialog.Close className={buttonVariants({ variant: "outline", size: "lg", className: "h-10 rounded-full px-5" })}>
                    {pedido.rotuloCancelar ?? "Cancelar"}
                  </AlertDialog.Close>
                )}
                <button
                  type="button"
                  onClick={() => {
                    aoMudarAberto(false);
                    aoConfirmar();
                  }}
                  className={buttonVariants({
                    variant: pedido.destrutiva ? "destructive" : "default",
                    size: "lg",
                    className: cn("h-10 rounded-full px-5", pedido.destrutiva && "bg-destructive text-white hover:bg-destructive/90"),
                  })}
                >
                  {pedido.rotuloConfirmar}
                </button>
              </div>
            </>
          )}
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/** Confirmação com gatilho próprio: o clique no gatilho abre o diálogo. */
export function Confirmacao({
  children,
  aoConfirmar,
  ...pedido
}: PedidoConfirmacao & { children: ReactElement; aoConfirmar: () => void }) {
  const [aberto, setAberto] = useState(false);
  return <DialogoConfirmacao pedido={pedido} aberto={aberto} aoMudarAberto={setAberto} aoConfirmar={aoConfirmar} gatilho={children} />;
}

type Regra = PedidoConfirmacao | ((dados: FormData) => PedidoConfirmacao | null) | null | undefined;

/**
 * O `<form>` do painel: pede confirmação antes de enviar, quando há regra, e
 * avisa ao sair da página com alteração não salva.
 *
 * `confirmar` pode ser uma função dos dados do formulário: assim a pergunta
 * só aparece quando importa (mudar o status para Inativa, desmarcar "Conta
 * ativa"), e não a cada salvamento.
 */
export function FormularioPainel({
  acao,
  confirmar,
  protegerSaida = true,
  className = "space-y-6",
  children,
}: {
  acao: (dados: FormData) => void | Promise<void>;
  confirmar?: Regra;
  /** Formulário de um botão só (ação de linha de tabela) não tem o que perder. */
  protegerSaida?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const liberado = useRef(false);
  const botao = useRef<HTMLElement | null>(null);
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null);
  const [sujo, setSujo] = useState(false);

  function aoEnviar(e: FormEvent<HTMLFormElement>) {
    if (liberado.current) {
      liberado.current = false;
      setSujo(false);
      return;
    }
    const regra = typeof confirmar === "function" ? confirmar(new FormData(e.currentTarget)) : confirmar;
    if (!regra) {
      setSujo(false);
      return;
    }
    e.preventDefault();
    botao.current = (e.nativeEvent as SubmitEvent).submitter;
    setPedido(regra);
  }

  function aoConfirmar() {
    liberado.current = true;
    // Reenvia pelo MESMO botão: se o formulário tiver mais de um, o valor
    // dele vai junto, como no envio original.
    formulario.current?.requestSubmit(botao.current instanceof HTMLButtonElement ? botao.current : undefined);
  }

  return (
    <>
      <form
        ref={formulario}
        action={acao}
        onSubmit={aoEnviar}
        onInput={protegerSaida ? () => setSujo(true) : undefined}
        onChange={protegerSaida ? () => setSujo(true) : undefined}
        className={className}
        noValidate
      >
        {children}
      </form>
      <DialogoConfirmacao pedido={pedido} aberto={pedido !== null} aoMudarAberto={(a) => !a && setPedido(null)} aoConfirmar={aoConfirmar} />
      {protegerSaida && <GuardaDeSaida ativo={sujo} />}
    </>
  );
}

/**
 * Avisa antes de sair da página com alteração não salva.
 *
 * Link interno: o clique é interceptado e vira o nosso diálogo. Fechar a aba
 * ou recarregar: só o aviso do próprio navegador é permitido ali (o texto é
 * dele, não nosso). O botão Voltar do navegador não passa por aqui: o Next
 * não oferece um jeito seguro de segurar essa navegação.
 */
function GuardaDeSaida({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  const [destino, setDestino] = useState<string | null>(null);
  // Já confirmou no nosso diálogo: o aviso do navegador não repete a pergunta.
  const confirmado = useRef(false);

  useEffect(() => {
    if (!ativo) return;
    confirmado.current = false;

    function antesDeSair(e: BeforeUnloadEvent) {
      if (!confirmado.current) e.preventDefault();
    }

    // Fase de captura no documento: roda antes do Link do Next, que escuta
    // na raiz do React. Parar aqui impede a navegação de começar.
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setDestino(url.origin === location.origin ? url.pathname + url.search + url.hash : url.href);
    }

    window.addEventListener("beforeunload", antesDeSair);
    document.addEventListener("click", aoClicar, true);
    return () => {
      window.removeEventListener("beforeunload", antesDeSair);
      document.removeEventListener("click", aoClicar, true);
    };
  }, [ativo]);

  return (
    <DialogoConfirmacao
      pedido={{
        titulo: "Sair sem salvar?",
        descricao: "As alterações feitas neste formulário ainda não foram salvas e serão perdidas.",
        rotuloConfirmar: "Sair sem salvar",
        rotuloCancelar: "Continuar editando",
        destrutiva: true,
      }}
      aberto={destino !== null}
      aoMudarAberto={(a) => !a && setDestino(null)}
      aoConfirmar={() => {
        const ir = destino;
        setDestino(null);
        if (!ir) return;
        confirmado.current = true;
        if (ir.startsWith("/")) router.push(ir);
        else location.href = ir;
      }}
    />
  );
}
