/*
 * Datas escolhidas num `<input type="date">` valem para o DIA INTEIRO.
 *
 * Elas são gravadas ao meio-dia de Brasília (ver `dataOpcional`). Comparar
 * direto com "agora" faria um banner que "termina em 10/10" sumir ao meio-dia
 * do dia 10, e uma campanha que "começa em 10/10" só aparecer ao meio-dia.
 * Meio dia de folga para cada lado cobre o dia todo.
 */
const MEIO_DIA_MS = 12 * 60 * 60 * 1000;

/** Para `where`: a data de término ainda não passou (vale até 23:59 dela). */
export const limiteDeTermino = (agora = new Date()) => new Date(agora.getTime() - MEIO_DIA_MS);

/** Para `where`: a data de início já chegou (vale desde 00:00 dela). */
export const limiteDeInicio = (agora = new Date()) => new Date(agora.getTime() + MEIO_DIA_MS);

export const jaTerminou = (fim: Date, agora = new Date()) => fim < limiteDeTermino(agora);
export const aindaNaoComecou = (inicio: Date, agora = new Date()) => inicio > limiteDeInicio(agora);

/** "2026-09-29" no fuso de Brasília. */
function diaEmBrasilia(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/**
 * Quantos dias de calendário faltam até `fim`, contados em Brasília: 0 é
 * "termina hoje", 1 é "termina amanhã". Nunca negativo (o que já terminou nem
 * chega ao site).
 */
export function diasAte(fim: Date, agora = new Date()) {
  const ms = Date.parse(diaEmBrasilia(fim)) - Date.parse(diaEmBrasilia(agora));
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
}
