"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoArea, CampoImagem, CampoSelecao, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { Bloco } from "@/components/admin/ui";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export type BannerForm = {
  organizacaoId: string | null;
  titulo: string;
  descricao: string | null;
  imagemUrl: string | null;
  link: string | null;
  textoBotao: string | null;
  ordem: string;
  inicioEm: string | null;
  fimEm: string | null;
  status: string;
};

export function FormularioBanner({
  acao,
  inicial,
  organizacoes,
}: {
  acao: (a: EstadoFormulario, d: FormData) => Promise<EstadoFormulario>;
  inicial?: BannerForm;
  /** `null` para admin de ONG: a campanha é sempre da organização dele. */
  organizacoes: { id: string; nome: string }[] | null;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (c: keyof BannerForm) => estado.valores?.[c] ?? inicial?.[c] ?? "";

  const confirmar = (d: FormData): PedidoConfirmacao | null => {
    const titulo = String(d.get("titulo") ?? "").trim() || "A campanha";
    const status = String(d.get("status") ?? "");
    if (!inicial) {
      return {
        titulo: "Criar campanha?",
        descricao: status === "ATIVO"
          ? `"${titulo}" aparece logo abaixo do topo do site, dentro do período escolhido. O site mostra no máximo 3 por vez.`
          : `"${titulo}" fica só no painel enquanto estiver inativa.`,
        rotuloConfirmar: "Criar campanha",
      };
    }
    if (status === "INATIVO" && inicial.status !== "INATIVO") {
      return { titulo: "Tirar campanha do site?", descricao: `"${titulo}" deixa de aparecer no site. Ela continua no painel.`, rotuloConfirmar: "Tirar do site", destrutiva: true };
    }
    return null;
  };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />
      <Bloco titulo="Conteúdo">
        {organizacoes && (
          <CampoSelecao
            nome="organizacaoId"
            rotulo="De quem é"
            opcoes={organizacoes.map((o) => ({ valor: o.id, rotulo: `Campanha de ${o.nome}` }))}
            vazio="Banner da equipe Patinhas"
            padrao={v("organizacaoId")}
            erros={e.organizacaoId}
            ajuda="Campanha de ONG só aparece enquanto a organização estiver publicada."
            className="sm:col-span-2"
          />
        )}
        <CampoTexto nome="titulo" rotulo="Título" obrigatorio max={100} padrao={v("titulo")} erros={e.titulo} className="sm:col-span-2" />
        <CampoArea nome="descricao" rotulo="Descrição" max={300} linhas={3} padrao={v("descricao")} erros={e.descricao} className="sm:col-span-2" />
        <CampoTexto nome="textoBotao" rotulo="Texto do botão" max={40} placeholder="Quero ajudar" padrao={v("textoBotao")} erros={e.textoBotao} />
        <CampoTexto nome="link" rotulo="Link do botão" modoEntrada="url" max={500} placeholder="#ajudar ou https://" padrao={v("link")} erros={e.link} />
        <CampoImagem nome="imagemUrl" rotulo="Imagem" padrao={inicial?.imagemUrl} descricaoAlt="Imagem do banner" erros={e.imagemUrl} className="sm:col-span-2" />
      </Bloco>
      <Bloco titulo="Exibição">
        <CampoSelecao nome="status" rotulo="Status" obrigatorio opcoes={[{ valor: "ATIVO", rotulo: "Ativo" }, { valor: "INATIVO", rotulo: "Inativo" }]} padrao={v("status") || "ATIVO"} erros={e.status} />
        <CampoTexto nome="ordem" rotulo="Ordem" tipo="number" modoEntrada="numeric" obrigatorio padrao={v("ordem") || "0"} erros={e.ordem} ajuda="Menor aparece primeiro." />
        <CampoTexto nome="inicioEm" rotulo="Começa em" tipo="date" padrao={v("inicioEm")} erros={e.inicioEm} ajuda="Vazio: já aparece." />
        <CampoTexto nome="fimEm" rotulo="Termina em" tipo="date" padrao={v("fimEm")} erros={e.fimEm} ajuda="Vazio: sem data para sair. Depois dela o banner some sozinho." />
      </Bloco>
      <BotaoSalvar />
    </FormularioPainel>
  );
}
