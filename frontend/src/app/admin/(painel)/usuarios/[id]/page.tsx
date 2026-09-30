import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { CabecalhoPagina } from "@/components/admin/ui";
import { FormularioUsuario } from "../formulario";
import { salvarUsuario } from "../actions";

export const metadata: Metadata = { title: "Editar usuário" };

export default async function PaginaEditarUsuario({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAdminPatinhas();
  const { id } = await params;

  const [usuario, organizacoes] = await Promise.all([
    db.usuario.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, papel: true, organizacaoId: true, ativo: true },
    }),
    db.organizacao.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);
  if (!usuario) notFound();

  return (
    <>
      <CabecalhoPagina titulo={usuario.nome} descricao="Editar acesso ao painel." />
      <FormularioUsuario
        acao={salvarUsuario.bind(null, usuario.id)}
        inicial={usuario}
        organizacoes={organizacoes}
        ehVoceMesmo={usuario.id === sessao.usuarioId}
      />
    </>
  );
}
