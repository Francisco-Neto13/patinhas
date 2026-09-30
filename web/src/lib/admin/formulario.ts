/*
 * O que os formulários do painel trocam com o servidor.
 *
 * Fica em `lib/` (e não em `server/`) porque os formulários são Client
 * Components e precisam deste tipo. As regras de validação em si moram em
 * `server/validacao/`.
 */

export type EstadoFormulario = {
  erros?: Record<string, string[] | undefined>;
  erroGeral?: string;
  /**
   * O que foi digitado, devolvido quando a validação falha. O React 19 reseta
   * o formulário depois de cada envio; sem isto, um erro apagaria tudo.
   */
  valores?: Record<string, string>;
};

/** "AAAA-MM-DD" no fuso de Brasília, o formato do `<input type="date">`. */
export const paraCampoData = (d: Date | null) =>
  d ? d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }) : null;
