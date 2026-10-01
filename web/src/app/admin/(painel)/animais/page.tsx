import type { Metadata } from "next";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import * as dadosAnimais from "@/server/dados/animais";
import * as organizacoes from "@/server/dados/organizacoes";
import { nomeDoAnimal, PORTE, SEXO, STATUS_ANIMAL } from "@/lib/admin/rotulos";
import type { StatusAnimal } from "@/generated/prisma/enums";
import { AvisoOk, CabecalhoPagina, classeCelula, Filtros, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Animais" };

const OK: Record<string, string> = { criado: "Animal cadastrado.", salvo: "Alterações salvas.", excluido: "Animal removido." };
const STATUS = Object.keys(STATUS_ANIMAL) as StatusAnimal[];

export default async function PaginaAnimais({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; status?: string }>;
}) {
  const sessao = await exigirSessao();
  const { ok, status: s } = await searchParams;
  // Só aceita um status que exista: o valor vem da URL e vai para a consulta.
  const status = STATUS.includes(s as StatusAnimal) ? (s as StatusAnimal) : undefined;
  const [{ animais, contagens }, temOrganizacao] = await Promise.all([
    dadosAnimais.listar(status),
    organizacoes.existeAlguma(),
  ]);
  const total = (st: StatusAnimal) => contagens.find((c) => c.status === st)?._count ?? 0;

  return (
    <>
      <CabecalhoPagina
        titulo="Animais"
        descricao="Os animais que aparecem na seção de adoção do site."
        acao={temOrganizacao ? { href: "/admin/animais/novo", rotulo: "Cadastrar animal" } : undefined}
      />
      <AvisoOk texto={ok ? OK[ok] : null} />
      <Filtros
        base="/admin/animais"
        atual={status}
        opcoes={[
          { rotulo: "Todos", total: contagens.reduce((a, c) => a + c._count, 0) },
          ...STATUS.map((st) => ({ valor: st, rotulo: STATUS_ANIMAL[st].rotulo, total: total(st) })),
        ]}
      />

      {!temOrganizacao ? (
        <Vazio>Cadastre uma organização antes: todo animal precisa de uma ONG ou abrigo responsável.</Vazio>
      ) : animais.length === 0 ? (
        <Vazio>Nenhum animal {status ? "com esse status" : "cadastrado ainda"}.</Vazio>
      ) : (
        <Tabela
          legenda="Animais cadastrados"
          cabecalhos={["", "Nome", "Resumo", ...(ehAdminPatinhas(sessao) ? ["Organização"] : []), "Status"]}
        >
          {animais.map((a) => (
            <tr key={a.id}>
              {/* `w-px`: a coluna encolhe até o tamanho da foto. Com largura fixa
                  (era `w-16`), o padding da célula comia quase tudo e o
                  `max-width: 100%` das imagens espremia a foto numa tira. */}
              <td className={`${classeCelula} w-px`}>
                {a.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
                  <img src={a.fotoUrl} alt="" className="size-14 max-w-none rounded-xl object-cover" />
                ) : (
                  <span className="block size-14 rounded-xl bg-muted" aria-hidden="true" />
                )}
              </td>
              <td className={classeCelula}>
                <LinkEditar href={`/admin/animais/${a.id}`} nome={nomeDoAnimal(a.nome)} />
              </td>
              <td className={`${classeCelula} text-taupe`}>
                {[SEXO[a.sexo].rotulo, a.idade, a.porte && PORTE[a.porte].rotulo].filter(Boolean).join(" • ")}
              </td>
              {ehAdminPatinhas(sessao) && <td className={classeCelula}>{a.organizacao.nome}</td>}
              <td className={classeCelula}>
                <Selo tom={STATUS_ANIMAL[a.status].tom}>{STATUS_ANIMAL[a.status].rotulo}</Selo>
              </td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
