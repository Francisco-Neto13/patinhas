/*
 * PIX estático: validação da chave e geração do BR Code ("Pix copia e cola").
 *
 * O QR Code do PIX é só este texto desenhado como QR. Gerar a partir da chave
 * (em vez de a ONG subir um print do app do banco) garante que o QR e a chave
 * exibidos no site sejam SEMPRE a mesma coisa: trocou a chave, trocou o QR.
 *
 * Nada aqui movimenta dinheiro. O texto só descreve para qual chave pagar; o
 * pagamento vai direto do banco de quem doa para o banco da ONG.
 *
 * Padrão: Manual de Padrões para Iniciação do Pix (Banco Central), BR Code
 * no formato EMV-MPM. Conferido contra o exemplo oficial do manual, que este
 * gerador reproduz byte a byte (ver o teste em scripts/testar-pix.mjs).
 */

export type TipoChavePix = "CPF" | "CNPJ" | "EMAIL" | "CELULAR" | "ALEATORIA";

export type ChavePix = { tipo: TipoChavePix; chave: string };

const soDigitos = (v: string) => v.replace(/\D/g, "");

function cpfValido(d: string) {
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

function cnpjValido(d: string) {
  if (!/^\d{14}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false;
  const dv = (n: number) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = pesos.reduce((acc, p, i) => acc + Number(d[i]) * p, 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === Number(d[12]) && dv(13) === Number(d[13]);
}

/**
 * Reconhece e normaliza uma chave PIX digitada do jeito que a pessoa digitar.
 *
 * ⚠️ CPF e celular têm 11 dígitos os dois. "11987654321" é celular ou CPF?
 * Aqui decide o dígito verificador: se fecha como CPF, é CPF; senão, se tem
 * cara de celular (DDD válido e 9 na frente), é celular. Para não depender
 * disso, celular pode ser digitado com +55 ou com parênteses e hífen, e aí
 * não há ambiguidade.
 */
export function reconhecerChavePix(entrada: string): ChavePix | null {
  const v = entrada.trim();
  if (!v) return null;

  // Aleatória (EVP): UUID.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
    return { tipo: "ALEATORIA", chave: v.toLowerCase() };
  }
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
    return v.length <= 77 ? { tipo: "EMAIL", chave: v.toLowerCase() } : null;
  }

  const d = soDigitos(v);
  const pareceTelefone = /^\+|\(|\)/.test(v) || (/-/.test(v) && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) && !/\//.test(v));
  const celular = (n: string) => {
    const nacional = n.length === 13 && n.startsWith("55") ? n.slice(2) : n;
    return /^[1-9][1-9]9\d{8}$/.test(nacional) ? `+55${nacional}` : null;
  };

  if (pareceTelefone) {
    const c = celular(d);
    return c ? { tipo: "CELULAR", chave: c } : null;
  }
  if (d.length === 14 && cnpjValido(d)) return { tipo: "CNPJ", chave: d };
  if (d.length === 11 && cpfValido(d)) return { tipo: "CPF", chave: d };
  const c = celular(d);
  return c ? { tipo: "CELULAR", chave: c } : null;
}

/** Campo EMV: identificador de 2 dígitos + tamanho de 2 dígitos + valor. */
const campo = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, "0")}${valor}`;

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido pelo campo 63. */
function crc16(texto: string) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Nome e cidade do recebedor: o padrão aceita só um conjunto limitado de
 * caracteres. Acento vira letra sem acento ("São Paulo" → "Sao Paulo"), o
 * resto some, e o tamanho é cortado no limite do campo (25 e 15).
 *
 * O banco de quem paga mostra o nome REGISTRADO na chave, não este: aqui ele
 * é só informativo, então simplificar não engana ninguém.
 */
const paraAscii = (v: string, max: number) =>
  // Apara de novo DEPOIS de cortar: senão sobra um espaço no fim
  // quando o limite de tamanho cai entre duas palavras.
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 .\-]/g, "").trim().slice(0, max).trim() || "NA";

/** Monta o "Pix copia e cola" de um PIX estático, sem valor definido. */
export function gerarBrCode({ chave, nome, cidade }: { chave: string; nome: string; cidade: string }) {
  const semCrc =
    campo("00", "01") +
    campo("26", campo("00", "br.gov.bcb.pix") + campo("01", chave)) +
    campo("52", "0000") +
    campo("53", "986") + // 986 = Real, na tabela ISO 4217
    campo("58", "BR") +
    campo("59", paraAscii(nome, 25)) +
    campo("60", paraAscii(cidade, 15)) +
    // "***": PIX estático sem identificador de cobrança, o valor que o
    // manual indica quando não há txid.
    campo("62", campo("05", "***")) +
    "6304";
  return semCrc + crc16(semCrc);
}
