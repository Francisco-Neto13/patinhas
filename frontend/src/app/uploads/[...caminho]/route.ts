import { readFile } from "node:fs/promises";
import path from "node:path";
import { pastaUploads, SEGMENTO_VALIDO } from "@/lib/uploads";

/*
 * Serve as imagens enviadas pelo admin.
 *
 * Elas não vão para `public/` porque aquela pasta é empacotada no build da
 * imagem Docker: um arquivo gravado lá em produção sumiria no próximo deploy.
 * O volume montado em UPLOADS_DIR sobrevive a deploys, e esta rota o expõe.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ caminho: string[] }> }) {
  const { caminho } = await ctx.params;

  // ⚠️ Cada pedaço do caminho é validado contra o formato que NÓS geramos.
  // Nada de `..`, nada de extensão diferente: é o que impede esta rota de
  // servir qualquer arquivo do servidor.
  if (caminho.length !== 3 || !caminho.every((p) => SEGMENTO_VALIDO.test(p))) {
    return new Response("Não encontrado", { status: 404 });
  }

  const raiz = pastaUploads();
  const arquivo = path.join(/* turbopackIgnore: true */ raiz, ...caminho);
  // Segunda trava, independente da primeira: o caminho resolvido tem de
  // continuar dentro da pasta de uploads.
  if (!arquivo.startsWith(raiz + path.sep)) return new Response("Não encontrado", { status: 404 });

  try {
    const dados = await readFile(arquivo);
    return new Response(new Uint8Array(dados), {
      headers: {
        "Content-Type": "image/webp",
        // O nome é aleatório e nunca é reaproveitado: trocar a foto gera outra
        // URL. Então o navegador pode guardar esta para sempre.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Não encontrado", { status: 404 });
  }
}
