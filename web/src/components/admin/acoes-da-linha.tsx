"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { DialogoConfirmacao } from "@/components/admin/confirmacao";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import type { TextoExclusao } from "@/lib/admin/exclusao";
import { cn } from "@/lib/utils";

const classeIcone =
  "inline-flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

/**
 * Lápis e lixeira no fim de cada linha das listas do painel.
 *
 * O nome do registro vai no rótulo de cada botão ("Editar Thor"), escondido
 * da tela: com dez linhas, dez botões "Editar" iguais seriam indistinguíveis
 * para quem usa leitor de tela.
 *
 * A lixeira abre o mesmo diálogo da página de edição (textos em
 * lib/admin/exclusao.ts). Se o servidor recusar (ONG com animais, por
 * exemplo), o motivo aparece num aviso, em vez de o clique não dar em nada.
 */
export function AcoesDaLinha({
  nome,
  hrefEditar,
  modo = "editar",
  excluir,
}: {
  nome: string;
  hrefEditar: string;
  /** "abrir" para o que se lê e não se edita (mensagens). */
  modo?: "editar" | "abrir";
  /** Sem `excluir`, só o lápis: quem não pode excluir nem vê a lixeira. */
  excluir?: TextoExclusao & { acao: () => Promise<EstadoFormulario> };
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [recusa, setRecusa] = useState<string | null>(null);
  const [excluindo, iniciar] = useTransition();
  const Icone = modo === "abrir" ? Eye : Pencil;
  const verbo = modo === "abrir" ? "Abrir" : "Editar";

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={hrefEditar}
        title={verbo}
        className={cn(classeIcone, "border-borda-forte text-brown-dark hover:bg-muted")}
      >
        <Icone className="size-4" aria-hidden="true" />
        <span className="sr-only">
          {verbo} {nome}
        </span>
      </Link>

      {excluir && (
        <>
          <button
            type="button"
            title={excluir.rotulo ?? "Excluir"}
            disabled={excluindo}
            onClick={() => setConfirmando(true)}
            className={cn(classeIcone, "border-destructive/40 text-destructive hover:bg-destructive/10")}
          >
            {excluindo ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
            <span className="sr-only">
              {excluir.rotulo ?? "Excluir"} {nome}
            </span>
          </button>

          <DialogoConfirmacao
            pedido={{ titulo: excluir.titulo, descricao: excluir.descricao, rotuloConfirmar: excluir.rotulo ?? "Excluir", destrutiva: true }}
            aberto={confirmando}
            aoMudarAberto={setConfirmando}
            aoConfirmar={() =>
              iniciar(async () => {
                // Deu certo: a action redireciona para a lista com o aviso de
                // sucesso. Só volta para cá quando o servidor recusa.
                const r = await excluir.acao();
                if (r?.erroGeral) setRecusa(r.erroGeral);
              })
            }
          />
          <DialogoConfirmacao
            pedido={recusa ? { titulo: "Não foi possível excluir", descricao: recusa, rotuloConfirmar: "Entendi", soAviso: true } : null}
            aberto={recusa !== null}
            aoMudarAberto={(a) => !a && setRecusa(null)}
            aoConfirmar={() => setRecusa(null)}
          />
        </>
      )}
    </div>
  );
}
