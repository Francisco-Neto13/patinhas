import type { Metadata } from "next";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import * as dadosOrganizacoes from "@/server/dados/organizacoes";
import { STATUS_ORGANIZACAO, TIPO_ORGANIZACAO } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";
import { AcoesDaLinha } from "@/components/admin/acoes-da-linha";
import { exclusao } from "@/lib/admin/exclusao";
import { excluirOrganizacao } from "./actions";

export const metadata: Metadata = { title: "ONGs / Abrigos" };

const OK: Record<string, string> = {
  criada: "Organização cadastrada.",
  salva: "Alterações salvas.",
  excluida: "Organização excluída.",
};

export default async function PaginaOrganizacoes({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirSessao();
  const { ok } = await searchParams;
  const patinhas = ehAdminPatinhas(sessao);

  const organizacoes = await dadosOrganizacoes.listar();

  return (
    <>
      <CabecalhoPagina
        titulo={patinhas ? "ONGs / Abrigos" : "Minha organização"}
        descricao={patinhas ? "Organizações e projetos divulgados pelo Patinhas." : "Os dados que o site mostra sobre a sua organização."}
        acao={patinhas ? { href: "/admin/organizacoes/nova", rotulo: "Cadastrar organização" } : undefined}
      />
      <AvisoOk texto={ok ? OK[ok] : null} />

      {organizacoes.length === 0 ? (
        <Vazio>Nenhuma organização cadastrada ainda.</Vazio>
      ) : (
        <Tabela legenda="Organizações cadastradas" cabecalhos={["Nome", "Tipo", "Cidade", "Animais", "Necessidades ativas", "Status", "Ações"]}>
          {organizacoes.map((o) => (
            <tr key={o.id}>
              <td className={classeCelula}>
                <LinkEditar href={`/admin/organizacoes/${o.id}`} nome={o.nome} />
              </td>
              <td className={classeCelula}>{TIPO_ORGANIZACAO[o.tipo].rotulo}</td>
              <td className={classeCelula}>
                {o.cidade}/{o.estado}
              </td>
              <td className={classeCelula}>{o._count.animais}</td>
              <td className={classeCelula}>{o._count.necessidades}</td>
              <td className={classeCelula}>
                <Selo tom={STATUS_ORGANIZACAO[o.status].tom}>{STATUS_ORGANIZACAO[o.status].rotulo}</Selo>
              </td>
              <td className={`${classeCelula} w-px`}><AcoesDaLinha nome={o.nome} hrefEditar={`/admin/organizacoes/${o.id}`} excluir={patinhas ? { ...exclusao.organizacao(o.nome), acao: excluirOrganizacao.bind(null, o.id) } : undefined} /></td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
