import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as animais from "@/server/dados/animais";
import * as organizacoes from "@/server/dados/organizacoes";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { CabecalhoPagina } from "@/components/admin/ui";
import { nomeDoAnimal } from "@/lib/admin/rotulos";
import { FormularioAnimal } from "../formulario";
import { excluirAnimal, salvarAnimal } from "../actions";

export const metadata: Metadata = { title: "Editar animal" };

export default async function PaginaEditarAnimal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [animal, opcoes] = await Promise.all([animais.buscar(id), organizacoes.opcoes()]);
  if (!animal) notFound();

  return (
    <>
      <CabecalhoPagina titulo={nomeDoAnimal(animal.nome)} descricao="Editar os dados do animal." />
      <FormularioAnimal acao={salvarAnimal.bind(null, animal.id)} inicial={animal} organizacoes={opcoes} />

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="zona-exclusao">
        <h2 id="zona-exclusao" className="font-heading text-xl font-semibold text-brown-dark">
          Remover animal
        </h2>
        <p className="mt-1 mb-4 text-sm text-taupe">
          Remove definitivamente. Para só tirar do site e manter o registro, mude o status para Inativo ou Adotado.
        </p>
        <BotaoExcluir acao={excluirAnimal.bind(null, animal.id)} titulo={`Remover ${animal.nome}?`} descricao="O animal e as fotos dele saem do painel e do site. Não dá para desfazer. Para só tirar do site, mude o status para Inativo." rotulo="Remover" />
      </section>
    </>
  );
}
