import "server-only";

/*
 * Limitador de tentativas em memória, por chave.
 *
 * Usado no login: sem ele, um script tenta milhares de senhas por minuto
 * contra o e-mail de um administrador.
 *
 * ⚠️ Vive na memória do processo. Funciona porque o Patinhas roda UM container
 * de aplicação. Se um dia houver réplicas, cada uma teria sua contagem e o
 * limite efetivo se multiplicaria: aí o contador precisa ir para o banco.
 * Reiniciar o container também zera as contagens, o que é aceitável: o pior
 * caso é o atacante ganhar mais 5 tentativas.
 */
type Registro = { tentativas: number; liberaEm: number };
const registros = new Map<string, Registro>();

const LIMITE = 5;
const JANELA_MS = 15 * 60 * 1000;

export function bloqueado(chave: string): boolean {
  const r = registros.get(chave);
  if (!r) return false;
  if (Date.now() > r.liberaEm) {
    registros.delete(chave);
    return false;
  }
  return r.tentativas >= LIMITE;
}

export function registrarFalha(chave: string) {
  const agora = Date.now();
  const r = registros.get(chave);
  if (!r || agora > r.liberaEm) {
    registros.set(chave, { tentativas: 1, liberaEm: agora + JANELA_MS });
  } else {
    r.tentativas += 1;
  }
  // Sem limpeza, o Map cresceria para sempre com chaves de quem errou uma vez.
  if (registros.size > 5000) {
    for (const [k, v] of registros) if (agora > v.liberaEm) registros.delete(k);
  }
}

export function limpar(chave: string) {
  registros.delete(chave);
}
