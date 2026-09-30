/**
 * Remove fotos enviadas pelo painel que nenhum cadastro usa.
 *
 *   Ver o que seria apagado (não apaga nada):
 *     node --env-file=.env scripts/limpar-uploads.mjs
 *   Apagar de verdade:
 *     node --env-file=.env scripts/limpar-uploads.mjs --apagar
 *
 *   Produção:
 *     docker compose exec patinhas-web node scripts/limpar-uploads.mjs --apagar
 *
 * Por que existem órfãs: a foto sobe no instante em que é escolhida, antes de
 * o formulário ser salvo. Quem troca a foto, remove da galeria ou desiste do
 * cadastro deixa o arquivo para trás.
 *
 * ⚠️ Arquivos das últimas 24 horas NUNCA são apagados, mesmo sem uso: podem ser
 * de alguém com um formulário aberto agora, que ainda vai clicar em salvar.
 *
 * ⚠️ Se um campo novo de imagem entrar no schema, ele precisa entrar na
 * consulta abaixo. Senão as fotos dele parecem órfãs e são apagadas.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const APAGAR = process.argv.includes("--apagar");
const CARENCIA_MS = 24 * 60 * 60 * 1000;
const raiz = path.resolve(process.env.UPLOADS_DIR || "./uploads");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (em desenvolvimento, use --env-file=.env)");
  process.exit(1);
}

const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();
let usadas;
try {
  // Toda coluna que guarda caminho de upload, inclusive as galerias (arrays)
  // e os textos editáveis do painel (logo, favicon, imagem do topo).
  const { rows } = await cliente.query(`
    SELECT u FROM (
      SELECT "capaUrl" AS u FROM "Organizacao"
      UNION ALL SELECT unnest("galeria") FROM "Organizacao"
      UNION ALL SELECT "fotoUrl" FROM "Animal"
      UNION ALL SELECT unnest("galeria") FROM "Animal"
      UNION ALL SELECT "imagemUrl" FROM "Banner"
      UNION ALL SELECT "valor" FROM "Conteudo" WHERE "valor" LIKE '/uploads/%'
    ) t WHERE u IS NOT NULL`);
  usadas = new Set(rows.map((r) => r.u));
} finally {
  await cliente.end();
}

async function listar(dir) {
  const saida = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) saida.push(...(await listar(p)));
    else if (e.name.endsWith(".webp")) saida.push(p);
  }
  return saida;
}

const agora = Date.now();
let orfas = 0, recentes = 0, bytes = 0;
for (const arquivo of await listar(raiz)) {
  const url = "/uploads/" + path.relative(raiz, arquivo).split(path.sep).join("/");
  if (usadas.has(url)) continue;
  const info = await stat(arquivo);
  if (agora - info.mtimeMs < CARENCIA_MS) {
    recentes++;
    continue;
  }
  orfas++;
  bytes += info.size;
  console.log(`${APAGAR ? "apagando" : "órfã"}: ${url}`);
  if (APAGAR) await unlink(arquivo);
}

const mb = (bytes / 1024 / 1024).toFixed(1);
console.log(
  `\n${orfas} foto(s) órfã(s), ${mb} MB${APAGAR ? " apagados" : " (nada apagado: use --apagar)"}.` +
    (recentes ? ` ${recentes} sem uso das últimas 24h mantida(s).` : ""),
);
