import type { Metadata } from "next";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import * as doacoes from "@/server/dados/doacoes";
import * as organizacoes from "@/server/dados/organizacoes";
import { TIPO_FORMA_DOACAO } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";
import { AbasDoacoes } from "./abas";

export const metadata: Metadata = { title: "Formas de doação" };

export default async function PaginaFormas({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirSessao();
  const { ok } = await searchParams;
  const patinhas = ehAdminPatinhas(sessao);

  const [formas, temOrganizacao] = await Promise.all([doacoes.listarFormas(), organizacoes.existeAlguma()]);

  return (
    <>
      <CabecalhoPagina
        titulo="Doações"
        descricao="Nenhum valor passa pelo Patinhas: as formas de doação só levam o visitante até a organização."
        acao={temOrganizacao ? { href: "/admin/doacoes/formas/nova", rotulo: "Nova forma de doação" } : undefined}
      />
      <AbasDoacoes atual="formas" />
      <AvisoOk texto={ok ? "Formas de doação atualizadas." : null} />
      <p className="mb-5 text-sm text-taupe">
        Aparecem no site, no card da organização, junto da chave PIX e do link de doação do cadastro dela.
      </p>
      {formas.length === 0 ? (
        <Vazio>Nenhuma forma de doação cadastrada.</Vazio>
      ) : (
        <Tabela legenda="Formas de doação" cabecalhos={["Título", "Tipo", ...(patinhas ? ["Organização"] : []), "Situação"]}>
          {formas.map((f) => (
            <tr key={f.id}>
              <td className={classeCelula}><LinkEditar href={`/admin/doacoes/formas/${f.id}`} nome={f.titulo} /></td>
              <td className={classeCelula}>{TIPO_FORMA_DOACAO[f.tipo].rotulo}</td>
              {patinhas && <td className={classeCelula}>{f.organizacao.nome}</td>}
              <td className={classeCelula}><Selo tom={f.ativa ? "verde" : "neutro"}>{f.ativa ? "No site" : "Oculta"}</Selo></td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
