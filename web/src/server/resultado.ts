import "server-only";

import type { EstadoFormulario } from "@/lib/admin/formulario";

/*
 * O que toda mutação da camada de dados devolve.
 *
 * `ok: false` carrega o mesmo formato que os formulários do painel já leem
 * (`erros`, `erroGeral`, `valores`), então a action só repassa: `if (!r.ok)
 * return r;`. Quem decide para onde a tela vai depois (redirect, revalidate) é
 * a action; a camada de dados não sabe que existe uma tela.
 */
export type Falha = EstadoFormulario & { ok: false };
export type Sucesso<T> = { ok: true; dados: T };
export type Resultado<T = undefined> = Sucesso<T> | Falha;

export function sucesso(): Sucesso<undefined>;
export function sucesso<T>(dados: T): Sucesso<T>;
export function sucesso<T>(dados?: T) {
  return { ok: true as const, dados };
}

export const falha = (estado: EstadoFormulario): Falha => ({ ok: false, ...estado });
