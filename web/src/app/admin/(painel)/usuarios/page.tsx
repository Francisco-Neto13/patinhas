import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/server/auth/sessao";
import * as dadosUsuarios from "@/server/dados/usuarios";
import { formatarDataHora, PAPEL } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Selo, Tabela } from "@/components/admin/ui";
import { AcoesDaLinha } from "@/components/admin/acoes-da-linha";

export const metadata: Metadata = { title: "Usuários" };

export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirAdminPatinhas();
  const { ok } = await searchParams;

  const usuarios = await dadosUsuarios.listar();

  return (
    <>
      <CabecalhoPagina titulo="Usuários" descricao="Quem tem acesso ao painel." acao={{ href: "/admin/usuarios/novo", rotulo: "Cadastrar usuário" }} />
      <AvisoOk texto={ok === "criado" ? "Usuário cadastrado." : ok === "salvo" ? "Alterações salvas." : null} />
      <Tabela legenda="Usuários do painel" cabecalhos={["Nome", "Perfil", "Organização", "Último acesso", "Situação", "Ações"]}>
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
            <td className={`${classeCelula} w-px`}><AcoesDaLinha nome={u.nome} hrefEditar={`/admin/usuarios/${u.id}`} /></td>
          </tr>
        ))}
      </Tabela>
    </>
  );
}
