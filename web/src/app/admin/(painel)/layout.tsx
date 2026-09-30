import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { exigirSessao } from "@/server/auth/sessao";
import * as mensagens from "@/server/dados/mensagens";
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
 * uma página ou Server Action rode. Por isso a checagem mora na camada de
 * dados (`src/server/dados`): toda leitura e toda mutação chama
 * `exigirSessao()` por conta própria. Se alguém apagar a chamada daqui, o
 * painel continua seguro; nenhuma página chega ao banco sem passar por lá.
 */
export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const sessao = await exigirSessao();
  const ehPatinhas = sessao.papel === "ADMIN_PATINHAS";

  const [naoLidas, cookiesDaRequisicao] = await Promise.all([mensagens.contarNaoLidas(), cookies()]);

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
