import type { Metadata } from "next";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import * as campanhas from "@/server/dados/campanhas";
import { formatarData } from "@/lib/admin/rotulos";
import { aindaNaoComecou, jaTerminou } from "@/lib/datas";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";
import { AcoesDaLinha } from "@/components/admin/acoes-da-linha";
import { exclusao } from "@/lib/admin/exclusao";
import { excluirBanner } from "./actions";

export const metadata: Metadata = { title: "Campanhas e destaques" };

export default async function PaginaCampanhas({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirSessao();
  const { ok } = await searchParams;
  const patinhas = ehAdminPatinhas(sessao);

  const banners = await campanhas.listar();
  const agora = new Date();

  // A situação REAL no site, e não só o status: uma campanha "Ativa" fora da
  // janela de datas, ou de uma ONG não publicada, não está no ar.
  const situacao = (b: (typeof banners)[number]) => {
    if (b.status === "INATIVO") return { tom: "neutro" as const, texto: "Inativo" };
    if (b.organizacao && b.organizacao.status !== "PUBLICADA") return { tom: "ambar" as const, texto: "ONG não publicada" };
    if (b.inicioEm && aindaNaoComecou(b.inicioEm, agora)) return { tom: "ambar" as const, texto: `Agendado para ${formatarData(b.inicioEm)}` };
    if (b.fimEm && jaTerminou(b.fimEm, agora)) return { tom: "neutro" as const, texto: "Encerrado" };
    return { tom: "verde" as const, texto: "No site" };
  };

  return (
    <>
      <CabecalhoPagina
        titulo={patinhas ? "Campanhas e destaques" : "Campanhas"}
        descricao={patinhas
          ? "Banners da equipe Patinhas e campanhas das ONGs, exibidos logo abaixo do topo do site. Aparecem no máximo 3 por vez."
          : "Campanhas da sua organização, exibidas no topo do site enquanto ela estiver publicada."}
        acao={{ href: "/admin/campanhas/novo", rotulo: "Nova campanha" }}
      />
      <AvisoOk texto={ok ? "Campanhas atualizadas." : null} />
      {banners.length === 0 ? (
        <Vazio>Nenhuma campanha. Sem campanhas ativas, o site não mostra a faixa de destaques.</Vazio>
      ) : (
        <Tabela legenda="Campanhas" cabecalhos={["Ordem", "Título", ...(patinhas ? ["De quem"] : []), "Período", "Situação", "Ações"]}>
          {banners.map((b) => {
            const s = situacao(b);
            return (
              <tr key={b.id}>
                <td className={`${classeCelula} w-20 text-taupe`}>{b.ordem}</td>
                <td className={classeCelula}><LinkEditar href={`/admin/campanhas/${b.id}`} nome={b.titulo} /></td>
                {patinhas && <td className={classeCelula}>{b.organizacao?.nome ?? "Equipe Patinhas"}</td>}
                <td className={`${classeCelula} text-taupe`}>
                  {b.inicioEm || b.fimEm ? `${b.inicioEm ? formatarData(b.inicioEm) : "Já"} até ${b.fimEm ? formatarData(b.fimEm) : "sem fim"}` : "Sem limite"}
                </td>
                <td className={classeCelula}><Selo tom={s.tom}>{s.texto}</Selo></td>
                <td className={`${classeCelula} w-px`}><AcoesDaLinha nome={b.titulo} hrefEditar={`/admin/campanhas/${b.id}`} excluir={{ ...exclusao.campanha(b.titulo), acao: excluirBanner.bind(null, b.id) }} /></td>
              </tr>
            );
          })}
        </Tabela>
      )}
    </>
  );
}
