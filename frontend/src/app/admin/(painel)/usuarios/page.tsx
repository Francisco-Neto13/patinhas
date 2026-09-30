import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { formatarDataHora, PAPEL } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Usuários" };

export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirAdminPatinhas();
  const { ok } = await searchParams;

  const usuarios = await db.usuario.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    // ⚠️ `select` explícito, sempre: o `senhaHash` nunca sai do servidor, nem
    // para uma tela que só o admin vê.
    select: { id: true, nome: true, email: true, papel: true, ativo: true, ultimoAcessoEm: true, organizacao: { select: { nome: true } } },
  });

  return (
    <>
      <CabecalhoPagina titulo="Usuários" descricao="Quem tem acesso ao painel." acao={{ href: "/admin/usuarios/novo", rotulo: "Cadastrar usuário" }} />
      <AvisoOk texto={ok === "criado" ? "Usuário cadastrado." : ok === "salvo" ? "Alterações salvas." : null} />
      <Tabela legenda="Usuários do painel" cabecalhos={["Nome", "Perfil", "Organização", "Último acesso", "Situação"]}>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td className={classeCelula}>
              <LinkEditar href={`/admin/usuarios/${u.id}`} nome={u.nome} />
              {u.id === sessao.usuarioId && <span className="ml-1.5 text-xs text-taupe">(você)</span>}
              <p className="text-xs text-taupe">{u.email}</p>
            </td>
            <td className={classeCelula}>{PAPEL[u.papel].rotulo}</td>
            <td className={classeCelula}>{u.organizacao?.nome ?? "Todas"}</td>
            <td className={`${classeCelula} text-taupe`}>{u.ultimoAcessoEm ? formatarDataHora(u.ultimoAcessoEm) : "Nunca entrou"}</td>
            <td className={classeCelula}>
              <Selo tom={u.ativo ? "verde" : "neutro"}>{u.ativo ? "Ativo" : "Desativado"}</Selo>
            </td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}
