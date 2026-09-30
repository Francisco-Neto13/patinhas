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
import { opcoes, STATUS_ORGANIZACAO, TIPO_ORGANIZACAO } from "@/lib/admin/rotulos";
import type { EstadoFormulario } from "@/lib/admin/validacao";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export type OrganizacaoForm = {
  nome: string;
  tipo: string;
  status: string;
  descricaoCurta: string;
  descricaoCompleta: string | null;
  cidade: string;
  estado: string;
  endereco: string | null;
  capaUrl: string | null;
  galeria: string[];
  chavePix: string | null;
  linkDoacao: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  site: string | null;
};

const UFS_OPCOES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
].map((uf) => ({ valor: uf, rotulo: uf }));

export function FormularioOrganizacao({
  acao,
  inicial,
  podePublicar,
}: {
  acao: (anterior: EstadoFormulario, dados: FormData) => Promise<EstadoFormulario>;
  inicial?: OrganizacaoForm;
  /** Só a equipe Patinhas mexe no status de publicação. */
  podePublicar: boolean;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  // Depois de um erro, vale o que foi digitado; antes, o que está no banco.
  const v = (campo: keyof OrganizacaoForm) =>
    estado.valores?.[campo] ?? (inicial?.[campo] as string | null | undefined) ?? "";

  // Confirma o que muda o SITE: cadastrar, publicar, tirar do ar. Salvar
  // um texto da organização não pergunta nada.
  const confirmar = (d: FormData): PedidoConfirmacao | null => {
    const nome = String(d.get("nome") ?? "").trim() || "A organização";
    const status = d.get("status");
    if (!inicial) {
      return {
        titulo: "Cadastrar organização?",
        descricao: status === "PUBLICADA" ? `${nome} vai aparecer no site assim que for salva.` : `${nome} começa como rascunho: só aparece no site depois de publicada.`,
        rotuloConfirmar: "Cadastrar",
      };
    }
    if (!status || status === inicial.status) return null;
    if (status === "PUBLICADA") {
      return { titulo: "Publicar no site?", descricao: `${nome} e os animais, necessidades e campanhas dela passam a aparecer no site.`, rotuloConfirmar: "Publicar" };
    }
    return {
      titulo: "Tirar do site?",
      descricao: `${nome} e tudo que é dela (animais, necessidades, campanhas) deixam de aparecer no site. Nada é apagado.`,
      rotuloConfirmar: "Tirar do site",
      destrutiva: true,
    };
  };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />

      <Bloco titulo="Identificação">
        <CampoTexto nome="nome" rotulo="Nome da organização" obrigatorio max={120} padrao={v("nome")} erros={e.nome} className="sm:col-span-2" />
        <CampoSelecao nome="tipo" rotulo="Tipo" obrigatorio opcoes={opcoes(TIPO_ORGANIZACAO)} vazio="Escolha..." padrao={v("tipo")} erros={e.tipo} />
        {podePublicar ? (
          <CampoSelecao
            nome="status"
            rotulo="Status de publicação"
            obrigatorio
            opcoes={opcoes(STATUS_ORGANIZACAO)}
            padrao={v("status") || "RASCUNHO"}
            erros={e.status}
            ajuda="Só organizações publicadas aparecem no site."
          />
        ) : (
          <p className="self-end text-sm text-taupe">
            A publicação no site é feita pela equipe Patinhas.
          </p>
        )}
        <CampoTexto
          nome="descricaoCurta"
          rotulo="Descrição curta"
          obrigatorio
          max={280}
          padrao={v("descricaoCurta")}
          erros={e.descricaoCurta}
          ajuda="Aparece no card do site. Até 280 caracteres."
          className="sm:col-span-2"
        />
        <CampoArea nome="descricaoCompleta" rotulo="Descrição completa" max={5000} linhas={6} padrao={v("descricaoCompleta")} erros={e.descricaoCompleta} className="sm:col-span-2" />
      </Bloco>

      <Bloco titulo="Localização">
        <CampoTexto nome="cidade" rotulo="Cidade" obrigatorio max={80} padrao={v("cidade")} erros={e.cidade} />
        <CampoSelecao nome="estado" rotulo="Estado" obrigatorio opcoes={UFS_OPCOES} vazio="UF" padrao={v("estado")} erros={e.estado} />
        <CampoTexto
          nome="endereco"
          rotulo="Endereço"
          max={200}
          padrao={v("endereco")}
          erros={e.endereco}
          ajuda="Só se for necessário para doações presenciais. Aparece publicamente."
          className="sm:col-span-2"
        />
      </Bloco>

      <Bloco titulo="Imagens">
        <CampoImagem nome="capaUrl" rotulo="Imagem de capa" padrao={inicial?.capaUrl} descricaoAlt="Capa da organização" erros={e.capaUrl} className="sm:col-span-2" />
        <CampoGaleria nome="galeria" rotulo="Galeria de imagens" padrao={inicial?.galeria} descricaoAlt="Galeria da organização" erros={e.galeria} className="sm:col-span-2" />
      </Bloco>

      <Bloco titulo="Doações">
        <CampoTexto
          nome="chavePix"
          rotulo="Chave PIX"
          max={140}
          padrao={v("chavePix")}
          erros={e.chavePix}
          ajuda="CPF, CNPJ, e-mail, celular com DDD ou chave aleatória. O QR Code e o Pix copia e cola são gerados sozinhos a partir dela."
        />
        <CampoTexto nome="linkDoacao" rotulo="Link de doação" tipo="url" modoEntrada="url" max={500} placeholder="https://" padrao={v("linkDoacao")} erros={e.linkDoacao} ajuda="Vaquinha, campanha ou página de doação." />
      </Bloco>

      <Bloco titulo="Contato e redes">
        <CampoTexto nome="whatsapp" rotulo="WhatsApp" modoEntrada="tel" max={200} placeholder="(11) 91234-5678" padrao={v("whatsapp")} erros={e.whatsapp} ajuda="Número com DDD ou link wa.me." />
        <CampoTexto nome="instagram" rotulo="Instagram" max={200} placeholder="@perfil" padrao={v("instagram")} erros={e.instagram} />
        <CampoTexto nome="facebook" rotulo="Facebook" tipo="url" modoEntrada="url" max={500} placeholder="https://" padrao={v("facebook")} erros={e.facebook} />
        <CampoTexto nome="site" rotulo="Site" tipo="url" modoEntrada="url" max={500} placeholder="https://" padrao={v("site")} erros={e.site} />
      </Bloco>

      <BotaoSalvar />
    </FormularioPainel>
  );
}
