import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Identifica a origem da requisição sem guardar o IP.
 *
 * Em produção o app fica atrás do nginx, então o IP real chega no
 * `X-Forwarded-For` (o primeiro da lista é o cliente). Sai como SHA-256: para
 * limitar tentativas basta saber que duas requisições vieram do MESMO lugar, e
 * não guardar IP evita tratar um dado pessoal que o projeto não precisa ter.
 *
 * ⚠️ Sem o nginx na frente, o cabeçalho pode ser forjado pelo cliente. É o
 * cenário de desenvolvimento, e o limitador ali é só conveniência.
 */
export async function origemDaRequisicao(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecida";
  return createHash("sha256").update(ip).digest("hex");
}
