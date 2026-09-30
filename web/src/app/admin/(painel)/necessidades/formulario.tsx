"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoArea, CampoSelecao, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { Bloco } from "@/components/admin/ui";
import { opcoes, PRIORIDADE, STATUS_NECESSIDADE, TIPO_NECESSIDADE } from "@/lib/admin/rotulos";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

/** Tudo em texto: `Decimal` e `Date` do banco já chegam convertidos pela página. */
export type NecessidadeForm = {
  organizacaoId: string;
  tipo: string;
  item: string;
  descricao: string | null;
  quantidade: string | null;
  unidade: string | null;
  prioridade: string;
  status: string;
  validadeEm: string | null;
  linkAjuda: string | null;
};

export function FormularioNecessidade({
  acao,
  inicial,
  organizacoes,
}: {
  acao: (anterior: EstadoFormulario, dados: FormData) => Promise<EstadoFormulario>;
  inicial?: NecessidadeForm;
  organizacoes: { id: string; nome: string }[] | null;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (campo: keyof NecessidadeForm) => estado.valores?.[campo] ?? inicial?.[campo] ?? "";

  const confirmar = (d: FormData): PedidoConfirmacao | null => {
    const item = String(d.get("item") ?? "").trim() || "A necessidade";
    const status = String(d.get("status") ?? "");
    if (!inicial) {
      return {
        titulo: "Cadastrar necessidade?",
        descricao: status === "ATIVA" ? `"${item}" vai aparecer no site assim que for salva (se a organização estiver publicada).` : `"${item}" fica só no painel: com esse status, não aparece no site.`,
        rotuloConfirmar: "Cadastrar",
      };
    }
    if (status === inicial.status) return null;
    if (status === "ATENDIDA") {
      return { titulo: "Marcar como atendida?", descricao: `"${item}" sai do site e passa a contar como atendida nos números.`, rotuloConfirmar: "Marcar como atendida" };
    }
    if (status === "INATIVA") {
      return { titulo: "Tirar do site?", descricao: `"${item}" deixa de aparecer no site. O cadastro continua no painel.`, rotuloConfirmar: "Tirar do site", destrutiva: true };
    }
    return null;
  };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />

      <Bloco titulo="O que é preciso">
        {organizacoes && (
          <CampoSelecao
            nome="organizacaoId"
            rotulo="ONG responsável"
            obrigatorio
            opcoes={organizacoes.map((o) => ({ valor: o.id, rotulo: o.nome }))}
            vazio="Escolha..."
            padrao={v("organizacaoId")}
            erros={e.organizacaoId}
            className="sm:col-span-2"
          />
        )}
        <CampoSelecao nome="tipo" rotulo="Tipo" obrigatorio opcoes={opcoes(TIPO_NECESSIDADE)} vazio="Escolha..." padrao={v("tipo")} erros={e.tipo} />
        <CampoTexto nome="item" rotulo="Nome do item" obrigatorio max={120} placeholder="Ração para cães adultos" padrao={v("item")} erros={e.item} />
        <CampoTexto nome="quantidade" rotulo="Quantidade necessária" modoEntrada="decimal" max={12} placeholder="50" padrao={v("quantidade")} erros={e.quantidade} />
        <CampoTexto nome="unidade" rotulo="Unidade de medida" max={20} placeholder="kg, caixas, R$..." padrao={v("unidade")} erros={e.unidade} />
        <CampoArea nome="descricao" rotulo="Descrição" max={1000} padrao={v("descricao")} erros={e.descricao} className="sm:col-span-2" />
      </Bloco>

      <Bloco titulo="Prioridade e prazo">
        <CampoSelecao nome="prioridade" rotulo="Prioridade" obrigatorio opcoes={opcoes(PRIORIDADE)} padrao={v("prioridade") || "NORMAL"} erros={e.prioridade} ajuda="Urgentes aparecem primeiro no site." />
        <CampoSelecao nome="status" rotulo="Status" obrigatorio opcoes={opcoes(STATUS_NECESSIDADE)} padrao={v("status") || "ATIVA"} erros={e.status} ajuda="Só as ativas aparecem no site." />
        <CampoTexto nome="validadeEm" rotulo="Válida até" tipo="date" padrao={v("validadeEm")} erros={e.validadeEm} ajuda="Depois desta data ela some do site sozinha." />
        <CampoTexto nome="linkAjuda" rotulo="Link para ajudar / doar" tipo="url" modoEntrada="url" max={500} placeholder="https://" padrao={v("linkAjuda")} erros={e.linkAjuda} ajuda="Se vazio, o site usa o link de doação da ONG." />
      </Bloco>

      <BotaoSalvar />
    </FormularioPainel>
  );
}
