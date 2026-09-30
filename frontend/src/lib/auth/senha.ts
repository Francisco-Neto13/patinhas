import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/*
 * Hash de senha com scrypt, do próprio `node:crypto`.
 *
 * Por que não bcrypt: o pacote `bcrypt` é nativo e precisa compilar no build
 * Alpine do Docker, e o `bcryptjs` é JavaScript puro e lento de propósito do
 * jeito errado (trava o event loop). O scrypt do Node roda no pool de threads
 * do libuv e é recomendado pela OWASP para hash de senha.
 *
 * Formato gravado: "scrypt$N$r$p$<salt hex>$<hash hex>".
 * Os parâmetros vão junto do hash para que um dia dê para endurecê-los sem
 * invalidar as senhas antigas: cada hash sabe com que custo foi calculado.
 *
 * ⚠️ scripts/criar-admin.mjs reimplementa este formato (ele roda fora do Next,
 * sem acesso a este módulo). Mudou aqui, muda lá.
 */

const N = 32768; // 2^15: ~32 MB de memória por cálculo
const R = 8;
const P = 1;
const TAMANHO = 64;

function derivar(senha: string, salt: Buffer, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) => {
    // maxmem precisa folgar acima de 128 * N * r bytes, senão o Node recusa.
    scrypt(senha, salt, TAMANHO, { N: n, r, p, maxmem: 256 * n * r }, (erro, chave) =>
      erro ? reject(erro) : resolve(chave),
    );
  });
}

export async function gerarHashDeSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const chave = await derivar(senha, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${chave.toString("hex")}`;
}

export async function conferirSenha(senha: string, gravado: string): Promise<boolean> {
  const partes = gravado.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, n, r, p, saltHex, hashHex] = partes;
  const esperado = Buffer.from(hashHex, "hex");
  const obtido = await derivar(senha, Buffer.from(saltHex, "hex"), +n, +r, +p);

  // `timingSafeEqual` compara em tempo constante. Um `===` para no primeiro
  // byte diferente, e medir quanto a resposta demora vira pista do hash.
  return obtido.length === esperado.length && timingSafeEqual(obtido, esperado);
}

/*
 * Hash descartável para comparar quando o e-mail NÃO existe.
 *
 * Sem ele, "e-mail inexistente" responderia na hora e "senha errada" levaria o
 * tempo do scrypt, e cronometrar o login revelaria quais e-mails têm conta.
 * Com ele, os dois caminhos custam o mesmo.
 */
let hashFantasma: Promise<string> | null = null;
export function obterHashFantasma() {
  hashFantasma ??= gerarHashDeSenha(randomBytes(16).toString("hex"));
  return hashFantasma;
}

/** Regras mínimas de senha. Comprimento importa mais que símbolo obrigatório. */
export function problemaNaSenha(senha: string): string | null {
  if (senha.length < 10) return "A senha precisa ter pelo menos 10 caracteres.";
  if (senha.length > 200) return "A senha pode ter no máximo 200 caracteres.";
  return null;
}
