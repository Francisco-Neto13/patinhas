import type { Metadata } from "next";
import * as conteudo from "@/server/dados/conteudo";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Perguntas frequentes" };

export default async function PaginaFaq({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const perguntas = await conteudo.listarPerguntas();

  return (
    <>
      <CabecalhoPagina titulo="Perguntas frequentes" descricao="Aparecem na seção de contato do site, antes do formulário." acao={{ href: "/admin/conteudo/faq/nova", rotulo: "Nova pergunta" }} />
      <AvisoOk texto={ok ? "Perguntas atualizadas." : null} />
      {perguntas.length === 0 ? (
        <Vazio>Nenhuma pergunta ainda. Enquanto não houver nenhuma ativa, o site não mostra a seção.</Vazio>
      ) : (
        <Tabela legenda="Perguntas frequentes" cabecalhos={["Ordem", "Pergunta", "Situação"]}>
          {perguntas.map((p) => (
            <tr key={p.id}>
              <td className={`${classeCelula} w-20 text-taupe`}>{p.ordem}</td>
              <td className={classeCelula}><LinkEditar href={`/admin/conteudo/faq/${p.id}`} nome={p.pergunta} /></td>
              <td className={classeCelula}><Selo tom={p.ativa ? "verde" : "neutro"}>{p.ativa ? "No site" : "Oculta"}</Selo></td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
