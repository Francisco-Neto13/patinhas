import type { Metadata } from "next";
import { exigirAdminPatinhas } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { formatarDataHora, STATUS_MENSAGEM } from "@/lib/admin/rotulos";
import type { StatusMensagem } from "@/generated/prisma/enums";
import { AvisoOk, CabecalhoPagina, classeCelula, Filtros, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Mensagens" };

const STATUS = Object.keys(STATUS_MENSAGEM) as StatusMensagem[];

export default async function PaginaMensagens({ searchParams }: { searchParams: Promise<{ ok?: string; status?: string }> }) {
  await exigirAdminPatinhas();
  const { ok, status: s } = await searchParams;
  // Sem filtro: tudo menos as arquivadas. Arquivar serve justamente para tirar
  // da frente sem apagar.
  const status = STATUS.includes(s as StatusMensagem) ? (s as StatusMensagem) : undefined;

  const [mensagens, contagens] = await Promise.all([
    db.mensagem.findMany({
      where: status ? { status } : { status: { not: "ARQUIVADA" } },
      orderBy: { criadoEm: "desc" },
      take: 200,
      select: { id: true, nome: true, email: true, mensagem: true, status: true, criadoEm: true },
    }),
    db.mensagem.groupBy({ by: ["status"], _count: true }),
  ]);
  const total = (st: StatusMensagem) => contagens.find((c) => c.status === st)?._count ?? 0;

  return (
    <>
      <CabecalhoPagina titulo="Mensagens" descricao="Recebidas pelo formulário de contato do site." />
      <AvisoOk texto={ok === "excluida" ? "Mensagem excluída." : null} />
      <Filtros
        base="/admin/mensagens"
        atual={status}
        opcoes={[
          { rotulo: "Caixa de entrada", total: STATUS.filter((x) => x !== "ARQUIVADA").reduce((a, x) => a + total(x), 0) },
          ...STATUS.map((st) => ({ valor: st, rotulo: STATUS_MENSAGEM[st].rotulo, total: total(st) })),
        ]}
      />

      {mensagens.length === 0 ? (
        <Vazio>Nenhuma mensagem aqui.</Vazio>
      ) : (
        <Tabela legenda="Mensagens recebidas" cabecalhos={["De", "Mensagem", "Recebida em", "Status"]}>
          {mensagens.map((m) => (
            // Não lida em negrito: é o padrão de caixa de e-mail que todo mundo já conhece.
            <tr key={m.id} className={m.status === "NAO_LIDA" ? "font-semibold" : undefined}>
              <td className={classeCelula}>
                <LinkEditar href={`/admin/mensagens/${m.id}`} nome={m.nome} />
                <p className="text-xs font-normal text-taupe">{m.email}</p>
              </td>
              <td className={`${classeCelula} max-w-md`}>
                <p className="truncate font-normal text-taupe">{m.mensagem}</p>
              </td>
              <td className={`${classeCelula} font-normal whitespace-nowrap text-taupe`}>{formatarDataHora(m.criadoEm)}</td>
              <td className={classeCelula}>
                <Selo tom={STATUS_MENSAGEM[m.status].tom}>{STATUS_MENSAGEM[m.status].rotulo}</Selo>
              </td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
