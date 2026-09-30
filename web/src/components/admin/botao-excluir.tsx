"use client";

import { useActionState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErroGeral } from "@/components/admin/campos";
import { FormularioPainel } from "@/components/admin/confirmacao";
import type { EstadoFormulario } from "@/lib/admin/formulario";

/**
 * Botão de exclusão, sempre com confirmação: excluir não tem desfazer.
 *
 * O diálogo diz O QUE some e o que acontece com o resto (ver cada chamada),
 * porque "Tem certeza?" sozinho não ajuda ninguém a decidir.
 */
export function BotaoExcluir({
  acao,
  titulo,
  descricao,
  rotulo = "Excluir",
}: {
  acao: () => Promise<EstadoFormulario>;
  titulo: string;
  descricao: string;
  rotulo?: string;
}) {
  const [estado, executar, pendente] = useActionState<EstadoFormulario>(acao, {});

  return (
    <div className="space-y-3">
      <ErroGeral texto={estado.erroGeral} />
      <FormularioPainel
        acao={executar}
        protegerSaida={false}
        className=""
        confirmar={{ titulo, descricao, rotuloConfirmar: rotulo, destrutiva: true }}
      >
        <Button type="submit" variant="destructive" size="lg" disabled={pendente} className="h-10 rounded-full px-5">
          {pendente ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
          {rotulo}
        </Button>
      </FormularioPainel>
    </div>
  );
}
