import type { Metadata } from "next";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { PORTE, SEXO, STATUS_ANIMAL } from "@/lib/admin/rotulos";
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
  const escopo = escopoDaOrganizacao(sessao);

  const [animais, contagens, temOrganizacao] = await Promise.all([
    db.animal.findMany({
      where: { ...escopo, ...(status && { status }) },
      orderBy: { atualizadoEm: "desc" },
      select: {
        id: true, nome: true, status: true, sexo: true, porte: true, idade: true, fotoUrl: true,
        organizacao: { select: { nome: true } },
      },
    }),
    db.animal.groupBy({ by: ["status"], where: escopo, _count: true }),
    db.organizacao.count(),
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
              <td className={`${classeCelula} w-16`}>
                {a.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
                  <img src={a.fotoUrl} alt="" className="size-11 rounded-xl object-cover" />
                ) : (
                  <span className="block size-11 rounded-xl bg-muted" aria-hidden="true" />
                )}
              </td>
              <td className={classeCelula}>
                <LinkEditar href={`/admin/animais/${a.id}`} nome={a.nome} />
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
