import type { Metadata } from "next";
import { Info } from "lucide-react";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { formatarData, TIPO_REGISTRO_DOACAO } from "@/lib/admin/rotulos";
import { AvisoOk, CabecalhoPagina, classeCelula, LinkEditar, Tabela, Vazio } from "@/components/admin/ui";
import { AbasDoacoes } from "../abas";

export const metadata: Metadata = { title: "Registros de doações" };

const reais = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const numero = (d: { toString(): string } | null) => (d ? Number(d.toString()).toLocaleString("pt-BR") : "");

export default async function PaginaRegistros({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sessao = await exigirSessao();
  const { ok } = await searchParams;
  const escopo = escopoDaOrganizacao(sessao);
  const patinhas = ehAdminPatinhas(sessao);

  const [registros, somaDinheiro, temOrganizacao] = await Promise.all([
    db.registroDoacao.findMany({
      where: escopo,
      orderBy: { data: "desc" },
      take: 200,
      select: {
        id: true, data: true, tipo: true, valor: true, item: true, quantidade: true, unidade: true,
        doador: true, anonimo: true, organizacao: { select: { nome: true } },
      },
    }),
    db.registroDoacao.aggregate({ where: { ...escopo, tipo: "DINHEIRO" }, _sum: { valor: true }, _count: true }),
    db.organizacao.count(),
  ]);
  const itens = await db.registroDoacao.count({ where: { ...escopo, tipo: { not: "DINHEIRO" } } });

  return (
    <>
      <CabecalhoPagina
        titulo="Doações"
        descricao="Controle interno das doações que as organizações informam ter recebido."
        acao={temOrganizacao ? { href: "/admin/doacoes/registros/novo", rotulo: "Registrar doação" } : undefined}
      />
      <AbasDoacoes atual="registros" />
      <AvisoOk texto={ok ? "Registros atualizados." : null} />

      {/* Seção 5.2: o documento é explícito que isto NÃO é medição oficial. */}
      <p className="mb-6 flex items-start gap-2 rounded-[0.875rem] border border-border bg-muted/40 px-4 py-3 text-sm text-taupe">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Registros informativos, preenchidos à mão. Não aparecem no site e não representam o total arrecadado pelas organizações.
      </p>

      <dl className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[0.875rem] border border-border bg-bone px-4 py-3">
          <dt className="text-xs text-taupe">Em dinheiro ({somaDinheiro._count} registros)</dt>
          <dd className="font-heading text-2xl font-semibold text-brown-dark">{reais(Number(somaDinheiro._sum.valor ?? 0))}</dd>
        </div>
        <div className="rounded-[0.875rem] border border-border bg-bone px-4 py-3">
          <dt className="text-xs text-taupe">Doações de itens</dt>
          <dd className="font-heading text-2xl font-semibold text-brown-dark">{itens}</dd>
        </div>
      </dl>

      {registros.length === 0 ? (
        <Vazio>Nenhuma doação registrada.</Vazio>
      ) : (
        <Tabela legenda="Doações registradas" cabecalhos={["Data", "Doação", "Tipo", ...(patinhas ? ["Organização"] : []), "Doador"]}>
          {registros.map((r) => (
            <tr key={r.id}>
              <td className={`${classeCelula} whitespace-nowrap text-taupe`}>{formatarData(r.data)}</td>
              <td className={classeCelula}>
                <LinkEditar
                  href={`/admin/doacoes/registros/${r.id}`}
                  nome={r.tipo === "DINHEIRO" ? reais(Number(r.valor ?? 0)) : `${r.item ?? "Item"}${r.quantidade ? ` (${numero(r.quantidade)} ${r.unidade ?? ""})` : ""}`}
                />
              </td>
              <td className={classeCelula}>{TIPO_REGISTRO_DOACAO[r.tipo].rotulo}</td>
              {patinhas && <td className={classeCelula}>{r.organizacao.nome}</td>}
              <td className={`${classeCelula} text-taupe`}>{r.anonimo ? "Anônimo" : (r.doador ?? "Não informado")}</td>
            </tr>
          ))}
        </Tabela>
      )}
    </>
  );
}
