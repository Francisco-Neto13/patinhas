"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoArea, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { CampoMarcar } from "@/components/admin/campo-marcar";
import { Bloco } from "@/components/admin/ui";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export function FormularioPergunta({
  acao,
  inicial,
}: {
  acao: (a: EstadoFormulario, d: FormData) => Promise<EstadoFormulario>;
  inicial?: { pergunta: string; resposta: string; ordem: number; ativa: boolean };
}) {
  const [estado, enviar] = useActionState(acao, {});

  const confirmar = (d: FormData): PedidoConfirmacao | null =>
    inicial
      ? null
      : {
          titulo: "Adicionar pergunta?",
          descricao:
            d.get("ativa") === "on"
              ? "Ela aparece na seção de perguntas frequentes do site assim que for salva."
              : "Ela fica escondida até você marcar Mostrar no site.",
          rotuloConfirmar: "Adicionar",
        };
  const e = estado.erros ?? {};
  const v = estado.valores;

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />
      <Bloco titulo="Pergunta">
        <CampoTexto nome="pergunta" rotulo="Pergunta" obrigatorio max={200} padrao={v?.pergunta ?? inicial?.pergunta} erros={e.pergunta} className="sm:col-span-2" />
        <CampoArea nome="resposta" rotulo="Resposta" obrigatorio max={2000} linhas={6} padrao={v?.resposta ?? inicial?.resposta} erros={e.resposta} className="sm:col-span-2" />
        <CampoTexto nome="ordem" rotulo="Ordem" tipo="number" modoEntrada="numeric" obrigatorio padrao={v?.ordem ?? String(inicial?.ordem ?? 0)} erros={e.ordem} ajuda="Menor aparece primeiro." />
        <div className="self-center">
          <CampoMarcar nome="ativa" rotulo="Mostrar no site" marcado={v ? v.ativa === "on" : (inicial?.ativa ?? true)} />
        </div>
      </Bloco>
      <BotaoSalvar />
    </FormularioPainel>
  );
}
