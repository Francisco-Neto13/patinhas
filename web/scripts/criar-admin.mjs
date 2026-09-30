/**
 * Cria (ou redefine a senha de) um Administrador Patinhas.
 *
 *   Desenvolvimento:
 *     node --env-file=.env scripts/criar-admin.mjs email@exemplo.com "Nome" "senha-forte"
 *
 *   Produção (dentro do container):
 *     docker compose exec patinhas-web node scripts/criar-admin.mjs email@exemplo.com "Nome" "senha"
 *
 * Existe porque o painel só cria usuários para quem JÁ está logado como admin.
 * Num banco vazio, alguém precisa ser o primeiro, e é este script.
 *
 * Rodar de novo com o mesmo e-mail TROCA a senha e reativa a conta, em vez de
 * falhar. É também a saída de emergência para quem perdeu a senha do admin.
 *
 * ⚠️ Não usa o Prisma de propósito: roda com `pg` puro para funcionar dentro da
 * imagem de produção, que não tem a CLI nem o client gerado fora do bundle do
 * Next. O formato do hash replica src/server/auth/senha.ts. Mudou lá, muda aqui.
 */
import { randomBytes, randomUUID, scrypt } from "node:crypto";
import pg from "pg";

const [email, nome, senha] = process.argv.slice(2);

if (!email || !nome || !senha) {
  console.error('uso: node scripts/criar-admin.mjs <email> "<nome>" "<senha>"');
  process.exit(1);
}
if (senha.length < 10) {
  console.error("a senha precisa ter pelo menos 10 caracteres");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (em desenvolvimento, use --env-file=.env)");
  process.exit(1);
}

const N = 32768, R = 8, P = 1;
const salt = randomBytes(16);
const chave = await new Promise((ok, erro) =>
  scrypt(senha, salt, 64, { N, r: R, p: P, maxmem: 256 * N * R }, (e, k) => (e ? erro(e) : ok(k))),
);
const senhaHash = `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${chave.toString("hex")}`;

const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();
try {
  const { rows } = await cliente.query(
    `INSERT INTO "Usuario" ("id", "nome", "email", "senhaHash", "papel", "ativo", "atualizadoEm")
     VALUES ($1, $2, $3, $4, 'ADMIN_PATINHAS', true, now())
     ON CONFLICT ("email") DO UPDATE
       SET "senhaHash" = EXCLUDED."senhaHash",
           "nome" = EXCLUDED."nome",
           "papel" = 'ADMIN_PATINHAS',
           "organizacaoId" = NULL,
           "ativo" = true,
           "atualizadoEm" = now()
     RETURNING (xmax = 0) AS criado`,
    [randomUUID(), nome.trim(), email.trim().toLowerCase(), senhaHash],
  );
  // Senha trocada: derruba as sessões abertas com a senha antiga.
  if (!rows[0].criado) {
    await cliente.query(
      `DELETE FROM "Sessao" WHERE "usuarioId" = (SELECT "id" FROM "Usuario" WHERE "email" = $1)`,
      [email.trim().toLowerCase()],
    );
  }
  console.log(rows[0].criado ? `admin criado: ${email}` : `senha redefinida: ${email}`);
} finally {
  await cliente.end();
}
