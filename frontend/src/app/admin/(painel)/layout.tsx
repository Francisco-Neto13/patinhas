import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { exigirSessao } from "@/lib/auth/sessao";
import { db } from "@/lib/db";
import { COOKIE_BARRA, gruposVisiveis } from "@/lib/admin/navegacao";
import { CascaPainel } from "@/components/admin/casca/casca-painel";

export const metadata: Metadata = {
  title: { template: "%s · Admin Patinhas", default: "Admin Patinhas" },
  robots: { index: false, follow: false },
};

/*
 * ⚠️ Este layout NÃO protege as páginas. Ele pede a sessão só para montar o
 * menu e a conta no topo.
 *
 * Layouts não re-renderizam ao navegar entre páginas filhas, e não impedem que
 * uma página ou Server Action rode. Por isso cada `page.tsx` e cada action
 * chama `exigirSessao()` por conta própria. Se alguém apagar a chamada daqui,
 * o painel continua seguro; se apagar de uma página, aquela página fica aberta.
 */
export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const sessao = await exigirSessao();
  const ehPatinhas = sessao.papel === "ADMIN_PATINHAS";

  const [naoLidas, cookiesDaRequisicao] = await Promise.all([
    // Mensagens são só da equipe Patinhas (seção 11.1): para a ONG nem consulta.
    ehPatinhas ? db.mensagem.count({ where: { status: "NAO_LIDA" } }) : Promise.resolve(0),
    cookies(),
  ]);

  return (
    <CascaPainel
      grupos={gruposVisiveis(ehPatinhas)}
      contadores={{ mensagens: naoLidas }}
      usuario={{ nome: sessao.nome, email: sessao.email, ehPatinhas }}
      contexto={ehPatinhas ? "Patinhas" : (sessao.organizacaoNome ?? "Organização")}
      recolhidaInicial={cookiesDaRequisicao.get(COOKIE_BARRA)?.value === "recolhida"}
    >
      {children}
    </CascaPainel>
  );
}
