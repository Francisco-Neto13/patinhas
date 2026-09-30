import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDeOrganizacoes, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { PixOrganizacao } from "@/components/publico/pix-organizacao";
import { FormularioOrganizacao } from "../formulario";
import { excluirOrganizacao, salvarOrganizacao } from "../actions";

export const metadata: Metadata = { title: "Editar organização" };

export default async function PaginaEditarOrganizacao({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirSessao();
  const { id } = await params;

  // Fora do escopo = "não encontrada", igual a um ID que não existe. Ver
  // src/lib/auth/permissoes.ts.
  const org = await db.organizacao.findFirst({ where: { id, ...escopoDeOrganizacoes(sessao) } });
  if (!org) notFound();

  const patinhas = ehAdminPatinhas(sessao);

  return (
    <>
      <CabecalhoPagina titulo={org.nome} descricao="Editar os dados da organização." />
      {org.chavePix && (
        // Prévia com o QR exatamente como o site mostra. Vale escanear com o app
        // do banco antes de publicar: o app mostra o nome do dono da chave, e é
        // a forma de confirmar que ela está certa.
        <section className="mb-6 rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm" aria-labelledby="previa-pix">
          <h2 id="previa-pix" className="font-heading text-xl font-semibold text-brown-dark">PIX desta organização</h2>
          <p className="mt-1 mb-4 text-sm text-taupe">
            Gerado a partir da chave salva. Teste com o app do seu banco: ele deve mostrar o nome do titular da chave.
          </p>
          <div className="max-w-md">
            <PixOrganizacao chave={org.chavePix} nome={org.nome} cidade={org.cidade} />
          </div>
        </section>
      )}
      <FormularioOrganizacao acao={salvarOrganizacao.bind(null, org.id)} inicial={org} podePublicar={patinhas} />

      {patinhas && (
        <section className="mt-10 border-t border-border pt-6" aria-labelledby="zona-exclusao">
          <h2 id="zona-exclusao" className="font-heading text-xl font-semibold text-brown-dark">
            Excluir organização
          </h2>
          <p className="mt-1 mb-4 text-sm text-taupe">
            Só é possível excluir organizações sem animais e sem necessidades. Para tirar do site sem perder nada, mude o status para Inativa.
          </p>
          <BotaoExcluir acao={excluirOrganizacao.bind(null, org.id)} titulo={`Excluir ${org.nome}?`} descricao="A organização, as formas de doação, as campanhas e os registros dela são apagados, e os usuários dela ficam sem organização. Não dá para desfazer. Para só tirar do site, mude o status para Inativa." />
        </section>
      )}
    </>
  );
}
