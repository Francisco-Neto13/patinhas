/**
 * Confere o gerador de BR Code contra o exemplo OFICIAL do Manual de Padrões
 * para Iniciação do Pix (Banco Central) e a validação das chaves.
 *
 *   node --experimental-strip-types scripts/testar-pix.mjs
 *
 * Rodar depois de qualquer mudança em src/lib/pix.ts: um erro no código de
 * verificação faz o app do banco recusar o QR, e nada no site acusaria.
 */
import { gerarBrCode, reconhecerChavePix } from "../src/lib/pix.ts";

let falhas = 0;
const ok = (c, r) => { if (!c) falhas++; console.log((c ? "  OK   " : "  FALHA").padEnd(8) + r); };

const OFICIAL = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D";
const gerado = gerarBrCode({ chave: "123e4567-e12b-12d1-a456-426655440000", nome: "Fulano de Tal", cidade: "BRASILIA" });
ok(gerado === OFICIAL, "reproduz o exemplo oficial do manual do BCB, byte a byte (CRC 1D3D)");
if (gerado !== OFICIAL) console.log("    esperado:", OFICIAL, "\n    gerado:  ", gerado);

const casos = [
  ["123.456.789-09", "CPF", "12345678909"],
  ["11.222.333/0001-81", "CNPJ", "11222333000181"],
  ["ONG@Exemplo.org", "EMAIL", "ong@exemplo.org"],
  ["(11) 98765-4321", "CELULAR", "+5511987654321"],
  ["+55 11 98765-4321", "CELULAR", "+5511987654321"],
  ["11987654321", "CELULAR", "+5511987654321"],
  ["123E4567-E12B-12D1-A456-426655440000", "ALEATORIA", "123e4567-e12b-12d1-a456-426655440000"],
  ["123.456.789-00", null, null],
  ["11111111111", null, null],
  ["qualquer coisa", null, null],
];
for (const [entrada, tipo, chave] of casos) {
  const r = reconhecerChavePix(entrada);
  ok(tipo === null ? r === null : r?.tipo === tipo && r?.chave === chave, `${entrada.padEnd(38)} -> ${r ? `${r.tipo} ${r.chave}` : "recusada"}`);
}
const acento = gerarBrCode({ chave: "ong@exemplo.org", nome: "Associação São Francisco de Assis Protetora", cidade: "São José dos Campos" });
ok(acento.includes("5924Associacao Sao Francisco60") && acento.includes("6015Sao Jose dos Ca62"), "acentos removidos, cortes em 25/15 sem espaco sobrando");

process.exit(falhas ? 1 : 0);
