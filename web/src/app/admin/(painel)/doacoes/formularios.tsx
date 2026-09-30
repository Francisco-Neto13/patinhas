"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoArea, CampoSelecao, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { CampoMarcar } from "@/components/admin/campo-marcar";
import { Bloco } from "@/components/admin/ui";
import { opcoes, TIPO_FORMA_DOACAO, TIPO_REGISTRO_DOACAO } from "@/lib/admin/rotulos";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

type Acao = (a: EstadoFormulario, d: FormData) => Promise<EstadoFormulario>;
type Orgs = { id: string; nome: string }[] | null;

function SeletorOrganizacao({ organizacoes, padrao, erros }: { organizacoes: Orgs; padrao: string; erros?: string[] }) {
  if (!organizacoes) return null;
  return (
    <CampoSelecao
      nome="organizacaoId"
      rotulo="Organização"
      obrigatorio
      opcoes={organizacoes.map((o) => ({ valor: o.id, rotulo: o.nome }))}
      vazio="Escolha..."
      padrao={padrao}
      erros={erros}
      className="sm:col-span-2"
    />
  );
}

export type FormaForm = { organizacaoId: string; tipo: string; titulo: string; descricao: string | null; link: string | null; ordem: string; ativa: boolean };

export function FormularioForma({ acao, inicial, organizacoes }: { acao: Acao; inicial?: FormaForm; organizacoes: Orgs }) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (c: Exclude<keyof FormaForm, "ativa">) => estado.valores?.[c] ?? inicial?.[c] ?? "";

  const confirmar = (d: FormData): PedidoConfirmacao | null =>
    inicial
      ? null
      : {
          titulo: "Adicionar forma de doação?",
          descricao:
            d.get("ativa") === "on"
              ? "Ela aparece no card da organização no site assim que for salva."
              : "Ela fica escondida até você marcar Mostrar no site.",
          rotuloConfirmar: "Adicionar",
        };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />
      <Bloco titulo="Forma de doação">
        <SeletorOrganizacao organizacoes={organizacoes} padrao={v("organizacaoId")} erros={e.organizacaoId} />
        <CampoSelecao nome="tipo" rotulo="Tipo" obrigatorio opcoes={opcoes(TIPO_FORMA_DOACAO)} vazio="Escolha..." padrao={v("tipo")} erros={e.tipo} />
        <CampoTexto nome="titulo" rotulo="Título" obrigatorio max={80} placeholder="Vaquinha da castração" padrao={v("titulo")} erros={e.titulo} />
        <CampoArea nome="descricao" rotulo="Como ajudar" max={400} linhas={3} padrao={v("descricao")} erros={e.descricao} ajuda="Ex.: onde entregar a ração, que marcas o abrigo usa, horário de recebimento." className="sm:col-span-2" />
        <CampoTexto nome="link" rotulo="Link" tipo="url" modoEntrada="url" max={500} placeholder="https://" padrao={v("link")} erros={e.link} ajuda="Obrigatório para vaquinha e outras plataformas." />
        <CampoTexto nome="ordem" rotulo="Ordem" tipo="number" modoEntrada="numeric" obrigatorio padrao={v("ordem") || "0"} erros={e.ordem} ajuda="Menor aparece primeiro." />
        <CampoMarcar nome="ativa" rotulo="Mostrar no site" marcado={estado.valores ? estado.valores.ativa === "on" : (inicial?.ativa ?? true)} />
      </Bloco>
      <BotaoSalvar />
    </FormularioPainel>
  );
}

export type RegistroForm = {
  organizacaoId: string; data: string | null; tipo: string; valor: string | null; item: string | null;
  quantidade: string | null; unidade: string | null; doador: string | null; anonimo: boolean; observacao: string | null;
};

export function FormularioRegistro({ acao, inicial, organizacoes }: { acao: Acao; inicial?: RegistroForm; organizacoes: Orgs }) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (c: Exclude<keyof RegistroForm, "anonimo">) => estado.valores?.[c] ?? inicial?.[c] ?? "";

  const confirmar: PedidoConfirmacao | null = inicial
    ? null
    : {
        titulo: "Registrar doação?",
        descricao: "O registro fica no controle interno da organização e entra nos totais do painel. Ele não aparece no site.",
        rotuloConfirmar: "Registrar",
      };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />
      <Bloco titulo="Doação recebida">
        <SeletorOrganizacao organizacoes={organizacoes} padrao={v("organizacaoId")} erros={e.organizacaoId} />
        <CampoTexto nome="data" rotulo="Data" tipo="date" obrigatorio padrao={v("data")} erros={e.data} />
        <CampoSelecao nome="tipo" rotulo="Tipo" obrigatorio opcoes={opcoes(TIPO_REGISTRO_DOACAO)} vazio="Escolha..." padrao={v("tipo")} erros={e.tipo} />
        <CampoTexto nome="valor" rotulo="Valor (R$)" modoEntrada="decimal" max={16} placeholder="150,00" padrao={v("valor")} erros={e.valor} ajuda="Para doação em dinheiro." />
        <CampoTexto nome="item" rotulo="Item" max={120} placeholder="Ração para gatos" padrao={v("item")} erros={e.item} ajuda="Para doação de itens." />
        <CampoTexto nome="quantidade" rotulo="Quantidade" modoEntrada="decimal" max={16} padrao={v("quantidade")} erros={e.quantidade} />
        <CampoTexto nome="unidade" rotulo="Unidade" max={20} placeholder="kg, caixas..." padrao={v("unidade")} erros={e.unidade} />
      </Bloco>
      <Bloco titulo="Doador">
        <CampoTexto nome="doador" rotulo="Nome do doador" max={120} padrao={v("doador")} erros={e.doador} />
        <div className="self-center">
          <CampoMarcar
            nome="anonimo"
            rotulo="Doação anônima"
            ajuda="O nome não é guardado, mesmo se preenchido."
            marcado={estado.valores ? estado.valores.anonimo === "on" : (inicial?.anonimo ?? false)}
          />
        </div>
        <CampoArea nome="observacao" rotulo="Observação" max={1000} linhas={3} padrao={v("observacao")} erros={e.observacao} className="sm:col-span-2" />
      </Bloco>
      <BotaoSalvar />
    </FormularioPainel>
  );
}
