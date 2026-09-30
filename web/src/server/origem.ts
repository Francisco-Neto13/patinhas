import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

/**
 * Identifica a origem da requisição sem guardar o IP.
 *
 * Em produção o app fica atrás do nginx, então o IP real chega no
 * `X-Forwarded-For`. Sai como SHA-256: para limitar tentativas basta saber que
 * duas requisições vieram do MESMO lugar, e não guardar IP evita tratar um
 * dado pessoal que o projeto não precisa ter.
 *
 * ⚠️ Usa o ÚLTIMO item da lista, não o primeiro. Com o padrão
 * `$proxy_add_x_forwarded_for`, o nginx ACRESCENTA o IP real ao que o cliente
 * mandou: o primeiro item é o que o cliente quiser, e trocá-lo a cada
 * requisição zeraria o limitador. O último é sempre o que o nginx viu. Se um
 * dia houver outro proxy na frente (Cloudflare, por exemplo), o IP do cliente
 * passa a ser o penúltimo, e isto precisa mudar.
 *
 * Sem o nginx na frente, o cabeçalho pode ser forjado pelo cliente. É o
 * cenário de desenvolvimento, e o limitador ali é só conveniência.
 */
export async function origemDaRequisicao(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",").at(-1)?.trim() || h.get("x-real-ip") || "desconhecida";
  return createHash("sha256").update(ip).digest("hex");
}
