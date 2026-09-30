"use client";

import { useActionState } from "react";
import {
  BotaoSalvar,
  CampoArea,
  CampoGaleria,
  CampoImagem,
  CampoSelecao,
  CampoTexto,
  ErroGeral,
} from "@/components/admin/campos";
import { Bloco } from "@/components/admin/ui";
import { opcoes, PORTE, SEXO, STATUS_ANIMAL } from "@/lib/admin/rotulos";
import type { EstadoFormulario } from "@/lib/admin/validacao";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export type AnimalForm = {
  nome: string;
  organizacaoId: string;
  status: string;
  sexo: string;
  porte: string | null;
  idade: string | null;
  raca: string | null;
  cidade: string | null;
  descricao: string | null;
  fotoUrl: string | null;
  galeria: string[];
  linkAdocao: string | null;
};

export function FormularioAnimal({
  acao,
  inicial,
  organizacoes,
}: {
  acao: (anterior: EstadoFormulario, dados: FormData) => Promise<EstadoFormulario>;
  inicial?: AnimalForm;
  /** `null` para admin de ONG: o animal é sempre da organização dele. */
  organizacoes: { id: string; nome: string }[] | null;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (campo: keyof AnimalForm) =>
    estado.valores?.[campo] ?? (inicial?.[campo] as string | null | undefined) ?? "";

  const confirmar = (d: FormData): PedidoConfirmacao | null => {
    const nome = String(d.get("nome") ?? "").trim() || "O animal";
    const status = String(d.get("status") ?? "");
    const noSite = status === "DISPONIVEL" || status === "EM_ADOCAO";
    if (!inicial) {
      return {
        titulo: "Cadastrar animal?",
        descricao: noSite
          ? `${nome} vai aparecer na seção de adoção do site assim que for salvo (se a organização estiver publicada).`
          : `${nome} fica só no painel: com esse status, não aparece no site.`,
        rotuloConfirmar: "Cadastrar",
      };
    }
    if (status === inicial.status) return null;
    if (status === "ADOTADO") {
      return { titulo: "Marcar como adotado?", descricao: `${nome} sai da seção de adoção do site e passa a contar como adotado nos números.`, rotuloConfirmar: "Marcar como adotado" };
    }
    if (status === "INATIVO") {
      return { titulo: "Tirar do site?", descricao: `${nome} deixa de aparecer no site. O cadastro continua no painel.`, rotuloConfirmar: "Tirar do site", destrutiva: true };
    }
    return null;
  };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />

      <Bloco titulo="Dados do animal">
        <CampoTexto nome="nome" rotulo="Nome" obrigatorio max={80} padrao={v("nome")} erros={e.nome} />
        <CampoSelecao nome="status" rotulo="Status" obrigatorio opcoes={opcoes(STATUS_ANIMAL)} padrao={v("status") || "DISPONIVEL"} erros={e.status} ajuda="Disponível e Em processo de adoção aparecem no site." />
        <CampoSelecao nome="sexo" rotulo="Sexo" obrigatorio opcoes={opcoes(SEXO)} padrao={v("sexo") || "NAO_INFORMADO"} erros={e.sexo} />
        <CampoSelecao nome="porte" rotulo="Porte" opcoes={opcoes(PORTE)} vazio="Não informado" padrao={v("porte")} erros={e.porte} />
        <CampoTexto nome="idade" rotulo="Idade" max={30} placeholder="2 anos, 8 meses, filhote..." padrao={v("idade")} erros={e.idade} />
        <CampoTexto nome="raca" rotulo="Raça" max={60} placeholder="Sem raça definida" padrao={v("raca")} erros={e.raca} />
        <CampoArea nome="descricao" rotulo="Descrição" max={3000} linhas={5} padrao={v("descricao")} erros={e.descricao} ajuda="Temperamento, cuidados, história. É o que convence alguém a adotar." className="sm:col-span-2" />
      </Bloco>

      <Bloco titulo="Organização e adoção">
        {organizacoes ? (
          <CampoSelecao
            nome="organizacaoId"
            rotulo="ONG / abrigo responsável"
            obrigatorio
            opcoes={organizacoes.map((o) => ({ valor: o.id, rotulo: o.nome }))}
            vazio="Escolha..."
            padrao={v("organizacaoId")}
            erros={e.organizacaoId}
          />
        ) : null}
        <CampoTexto nome="cidade" rotulo="Cidade" max={80} padrao={v("cidade")} erros={e.cidade} ajuda="Se vazio, o site usa a cidade da organização." />
        <CampoTexto
          nome="linkAdocao"
          rotulo="Link para adoção"
          tipo="url"
          modoEntrada="url"
          max={500}
          placeholder="https://"
          padrao={v("linkAdocao")}
          erros={e.linkAdocao}
          ajuda="Formulário de adoção da ONG. Se vazio, o botão do site leva ao WhatsApp da organização."
          className="sm:col-span-2"
        />
      </Bloco>

      <Bloco titulo="Fotos">
        <CampoImagem nome="fotoUrl" rotulo="Foto principal" padrao={inicial?.fotoUrl} descricaoAlt={`Foto de ${inicial?.nome ?? "o animal"}`} erros={e.fotoUrl} className="sm:col-span-2" />
        <CampoGaleria nome="galeria" rotulo="Galeria de fotos" padrao={inicial?.galeria} descricaoAlt={inicial?.nome ?? "Animal"} erros={e.galeria} className="sm:col-span-2" />
      </Bloco>

      <BotaoSalvar />
    </FormularioPainel>
  );
}
