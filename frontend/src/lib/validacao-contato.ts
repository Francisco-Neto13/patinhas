/**
 * Regras do formulário de contato.
 *
 * Ficam fora do componente porque são lógica pura: dá para ler, testar e
 * ajustar os limites sem abrir JSX. As mensagens vivem junto das regras de
 * propósito — mensagem de erro é parte da regra, não decoração dela.
 */

/** Limites de tamanho. Também aplicados como `maxLength` nos campos. */
export const LIMITES = {
  nome: 80,
  email: 120,
  /** "(11) 91234-5678" tem 15 caracteres já formatados. */
  telefone: 15,
  mensagem: 1000,
} as const;

export const MIN_MENSAGEM = 10;

export type CamposContato = {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
};

export type ErrosContato = Partial<Record<keyof CamposContato, string>>;

const somenteDigitos = (v: string) => v.replace(/\D/g, "");

/**
 * Máscara progressiva de telefone brasileiro.
 *
 * Formata enquanto a pessoa digita e descarta o que não é dígito, então colar
 * "+55 (11) 91234-5678" de outro lugar não quebra o campo.
 *
 * ⚠️ O corte em 11 dígitos é o que impede o `maxLength` de brigar com a
 * máscara: sem ele, os parênteses e o hífen contariam para o limite do campo e
 * o número seria truncado antes de terminar.
 */
export function formatarTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  // Fixo: 8 dígitos após o DDD. Celular: 9, e o bloco da frente vira 5.
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validarNome(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Diga como podemos te chamar.";
  if (t.length < 2) return "O nome precisa ter pelo menos 2 letras.";
  // Um campo preenchido com "123" ou "...." passa em qualquer checagem de
  // tamanho, mas não é um nome.
  if (!/\p{L}/u.test(t)) return "O nome precisa ter pelo menos uma letra.";
  return undefined;
}

function validarEmail(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Precisamos do seu e-mail para conseguir responder.";
  /*
   * ⚠️ Mais rígido que o `type="email"` do navegador de propósito.
   *
   * A validação nativa aceita "ana@servidor" — sem ponto e sem domínio — porque
   * o padrão do HTML permite endereços de rede interna. Num formulário público
   * isso é quase sempre erro de digitação, e o e-mail volta como não entregue
   * depois, quando não dá mais para perguntar.
   */
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(t)) {
    return "E-mail inválido. Confira se está no formato nome@provedor.com.";
  }
  return undefined;
}

function validarTelefone(v: string): string | undefined {
  const d = somenteDigitos(v);
  if (d.length === 0) return "Precisamos do seu telefone para entrar em contato.";

  if (d.length < 10) return "Telefone incompleto. Use DDD + número, como (11) 91234-5678.";

  // DDD brasileiro vai de 11 a 99, e nenhum termina em 0.
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || d[1] === "0") return "DDD inválido. Ele vai de 11 a 99.";

  // Desde 2016 todo celular do país tem 9 dígitos e começa com 9.
  if (d.length === 11 && d[2] !== "9") {
    return "Número de celular com 9 dígitos começa com 9 depois do DDD.";
  }
  return undefined;
}

function validarMensagem(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Escreva sua mensagem.";
  if (t.length < MIN_MENSAGEM) {
    return `A mensagem está muito curta — escreva pelo menos ${MIN_MENSAGEM} caracteres.`;
  }
  return undefined;
}

export function validarContato(campos: CamposContato): ErrosContato {
  const erros: ErrosContato = {};
  const nome = validarNome(campos.nome);
  const email = validarEmail(campos.email);
  const telefone = validarTelefone(campos.telefone);
  const mensagem = validarMensagem(campos.mensagem);

  if (nome) erros.nome = nome;
  if (email) erros.email = email;
  if (telefone) erros.telefone = telefone;
  if (mensagem) erros.mensagem = mensagem;
  return erros;
}

/** Ordem visual dos campos — usada para focar o PRIMEIRO inválido. */
export const ORDEM_CAMPOS: (keyof CamposContato)[] = [
  "nome",
  "email",
  "telefone",
  "mensagem",
];
