import type { Metadata } from "next";
import { CheckCheck } from "lucide-react";
import { exigirSessao } from "@/lib/auth/sessao";
import { escopoDaOrganizacao, ehAdminPatinhas } from "@/lib/auth/permissoes";
import { db } from "@/lib/db";
import { formatarData, PRIORIDADE, STATUS_NECESSIDADE, TIPO_NECESSIDADE } from "@/lib/admin/rotulos";
import type { StatusNecessidade } from "@/generated/prisma/enums";
import { AvisoOk, CabecalhoPagina, classeCelula, Filtros, LinkEditar, Selo, Tabela, Vazio } from "@/components/admin/ui";
import { marcarAtendida } from "./actions";
import { jaTerminou } from "@/lib/datas";
import { FormularioPainel } from "@/components/admin/confirmacao";

export const metadata: Metadata = { title: "Necessidades" };

const OK: Record<string, string> = { criada: "Necessidade cadastrada.", salva: "Alterações salvas.", excluida: "Necessidade excluída." };
const STATUS = Object.keys(STATUS_NECESSIDADE) as StatusNecessidade[];

export default async function PaginaNecessidades({ searchParams }: { searchParams: Promise<{ ok?: string; status?: string }> }) {
  const sessao = await exigirSessao();
  const { ok, status: s } = await searchParams;
  // Sem filtro, abre nas ativas: é o que alguém procura 9 em cada 10 vezes. O
  // "histórico" da seção 4.3 são as abas Atendidas e Todas.
  const status = s === "todas" ? undefined : STATUS.includes(s as StatusNecessidade) ? (s as StatusNecessidade) : "ATIVA";
  const escopo = escopoDaOrganizacao(sessao);

  const [necessidades, contagens, temOrganizacao] = await Promise.all([
    db.necessidade.findMany({
      where: { ...escopo, ...(status && { status }) },
      // Urgente antes de normal, e dentro de cada uma, a mais nova primeiro.
      orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
      select: {
        id: true, item: true, tipo: true, quantidade: true, unidade: true, prioridade: true,
        status: true, criadoEm: true, validadeEm: true, organizacao: { select: { nome: true } },
      },
    }),
    db.necessidade.groupBy({ by: ["status"], where: escopo, _count: true }),
    db.organizacao.count(),
  ]);
  const total = (st: StatusNecessidade) => contagens.find((c) => c.status === st)?._count ?? 0;
  const hoje = new Date();

  return (
    <>
      <CabecalhoPagina
        titulo="Necessidades"
        descricao="O que as organizações precisam agora. As ativas aparecem no site."
        acao={temOrganizacao ? { href: "/admin/necessidades/nova", rotulo: "Cadastrar necessidade" } : undefined}
      />
      <AvisoOk texto={ok ? OK[ok] : null} />
      <Filtros
        base="/admin/necessidades"
        atual={status ?? "todas"}
        opcoes={[
          ...STATUS.map((st) => ({ valor: st, rotulo: `${STATUS_NECESSIDADE[st].rotulo}s`, total: total(st) })),
          { valor: "todas", rotulo: "Todas", total: contagens.reduce((a, c) => a + c._count, 0) },
        ]}
      />

      {!temOrganizacao ? (
        <Vazio>Cadastre uma organização antes: toda necessidade pertence a uma ONG.</Vazio>
      ) : necessidades.length === 0 ? (
        <Vazio>Nenhuma necessidade aqui.</Vazio>
      ) : (
        <Tabela
          legenda="Necessidades"
          cabecalhos={["Item", "Tipo", "Quantidade", ...(ehAdminPatinhas(sessao) ? ["ONG"] : []), "Cadastro", "Prioridade", "Status", ""]}
        >
          {necessidades.map((n) => {
            const vencida = n.status === "ATIVA" && n.validadeEm && jaTerminou(n.validadeEm, hoje);
            return (
              <tr key={n.id}>
                <td className={classeCelula}>
                  <LinkEditar href={`/admin/necessidades/${n.id}`} nome={n.item} />
                  {vencida && <p className="text-xs text-destructive">Venceu em {formatarData(n.validadeEm!)} e saiu do site</p>}
                </td>
                <td className={classeCelula}>{TIPO_NECESSIDADE[n.tipo].rotulo}</td>
                <td className={classeCelula}>{n.quantidade ? `${n.quantidade.toString().replace(".", ",")} ${n.unidade ?? ""}` : "Não informada"}</td>
                {ehAdminPatinhas(sessao) && <td className={classeCelula}>{n.organizacao.nome}</td>}
                <td className={`${classeCelula} text-taupe`}>{formatarData(n.criadoEm)}</td>
                <td className={classeCelula}>
                  <Selo tom={PRIORIDADE[n.prioridade].tom}>{PRIORIDADE[n.prioridade].rotulo}</Selo>
                </td>
                <td className={classeCelula}>
                  <Selo tom={STATUS_NECESSIDADE[n.status].tom}>{STATUS_NECESSIDADE[n.status].rotulo}</Selo>
                </td>
                <td className={`${classeCelula} text-right`}>
                  {n.status === "ATIVA" && (
                    <FormularioPainel
                      acao={marcarAtendida.bind(null, n.id)}
                      protegerSaida={false}
                      className=""
                      confirmar={{
                        titulo: "Marcar como atendida?",
                        descricao: `"${n.item}" sai do site e passa a contar como atendida nos números. Dá para reativar editando a necessidade.`,
                        rotuloConfirmar: "Marcar como atendida",
                      }}
                    >
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full border border-borda-forte px-3 py-1 text-xs font-medium text-brown-dark hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <CheckCheck className="size-3.5" aria-hidden="true" />
                        {/* O nome do item no rótulo: "Marcar como atendida" repetido em 10 linhas é indistinguível para leitor de tela. */}
                        Atendida<span className="sr-only">: {n.item}</span>
                      </button>
                    </FormularioPainel>
                  )}
                </td>
              </tr>
            );
          })}
        </Tabela>
      )}
    </>
  );
}
