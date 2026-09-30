import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdminPatinhas } from "@/server/auth/sessao";
import * as organizacoes from "@/server/dados/organizacoes";
import * as usuarios from "@/server/dados/usuarios";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioUsuario } from "../formulario";
import { salvarUsuario } from "../actions";

export const metadata: Metadata = { title: "Editar usuário" };

export default async function PaginaEditarUsuario({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAdminPatinhas();
  const { id } = await params;

  const [usuario, opcoes] = await Promise.all([usuarios.buscar(id), organizacoes.opcoes()]);
  if (!usuario) notFound();

  return (
    <>
      <CabecalhoPagina titulo={usuario.nome} descricao="Editar acesso ao painel." />
      <FormularioUsuario
        acao={salvarUsuario.bind(null, usuario.id)}
        inicial={usuario}
        organizacoes={opcoes ?? []}
        ehVoceMesmo={usuario.id === sessao.usuarioId}
      />
    </>
  );
}
