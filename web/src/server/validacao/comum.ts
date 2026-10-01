import "server-only";

import { z } from "zod";
import { ehUrlDeUpload } from "@/lib/uploads-formato";
import { falha, type Falha } from "@/server/resultado";

/*
 * Peças de validação reaproveitadas pelos formulários do admin.
 *
 * Tudo que vem de um formulário chega como texto (ou nada). Campo opcional em
 * branco vira `null`, para o banco guardar "não informado" em vez de "".
 */

/** Os campos de texto enviados, para reconstruir o formulário após um erro. */
export function valoresDe(dados: FormData): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, valor] of dados) {
    // Galerias repetem o nome e vivem em estado do próprio componente; campos
    // internos do Next (`$ACTION_...`) não interessam.
    if (typeof valor === "string" && !chave.startsWith("$") && !(chave in saida)) saida[chave] = valor;
  }
  return saida;
}

/** Converte o resultado do zod no formato que os campos da tela leem. */
export function errosDoZod(erro: z.ZodError, dados: FormData): Falha {
  return falha({
    erros: z.flattenError(erro).fieldErrors as Record<string, string[] | undefined>,
    erroGeral: "Confira os campos destacados.",
    valores: valoresDe(dados),
  });
}

/** Erro num campo só, mantendo o que foi digitado. */
export const erroNoCampo = (campo: string, mensagem: string, dados: FormData): Falha =>
  falha({ erros: { [campo]: [mensagem] }, erroGeral: "Confira os campos destacados.", valores: valoresDe(dados) });

const semEspacos = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const vazioParaNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : semEspacos(v);

export const textoObrigatorio = (rotulo: string, max: number) =>
  z.preprocess(
    semEspacos,
    z
      .string({ error: `Informe ${rotulo}.` })
      .min(1, `Informe ${rotulo}.`)
      .max(max, `Use no máximo ${max} caracteres.`),
  );

export const textoOpcional = (max: number) =>
  z.preprocess(vazioParaNull, z.string().max(max, `Use no máximo ${max} caracteres.`).nullable());

/*
 * ⚠️ `z.url()` SOZINHO ACEITA `javascript:alert(1)`. Verificado no zod 4.6.
 *
 * Estes links viram `href` no site público. Sem restringir o protocolo, quem
 * tiver acesso a uma conta de ONG consegue plantar um link que executa script
 * no navegador de todo visitante que clicar. Só http e https passam.
 */
export const linkOpcional = z.preprocess(
  vazioParaNull,
  z
    .url({ protocol: /^https?$/, error: "Use um link completo, começando com https://" })
    .max(500, "Link longo demais.")
    .nullable(),
);

/** Imagem única: precisa ser um upload nosso, nunca uma URL externa qualquer. */
export const imagemOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .refine(ehUrlDeUpload, "Imagem inválida. Envie de novo.")
    .nullable(),
);

/** Galeria: chega como várias entradas de mesmo nome no FormData. */
export const galeriaAte = (maximo: number) =>
  z
    .array(z.string().refine(ehUrlDeUpload, "Imagem inválida na galeria."))
    .max(maximo, `No máximo ${maximo} fotos na galeria. Remova as que sobrarem.`);

export const galeria = galeriaAte(12);

/**
 * WhatsApp aceita número OU link, porque é assim que as pessoas colam: às vezes
 * "(11) 91234-5678", às vezes "https://wa.me/5511912345678". Sempre grava link.
 */
export const whatsappOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .nullable()
    .transform((v, ctx) => {
      if (v === null) return null;
      const digitos = v.replace(/\D/g, "");
      if (!/^https?:\/\//i.test(v)) {
        // Número nacional com DDD (10 ou 11 dígitos) ou já com o 55 na frente.
        const comPais = digitos.length <= 11 ? `55${digitos}` : digitos;
        if (comPais.length < 12 || comPais.length > 13) {
          ctx.addIssue({ code: "custom", message: "Informe o número com DDD ou um link wa.me." });
          return z.NEVER;
        }
        return `https://wa.me/${comPais}`;
      }
      const ok = z.url({ protocol: /^https?$/ }).safeParse(v).success;
      if (!ok) {
        ctx.addIssue({ code: "custom", message: "Link de WhatsApp inválido." });
        return z.NEVER;
      }
      return v;
    }),
);

/** Instagram aceita @perfil ou link; grava sempre o link. */
export const instagramOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .nullable()
    .transform((v, ctx) => {
      if (v === null) return null;
      if (/^https?:\/\//i.test(v)) {
        if (!z.url({ protocol: /^https?$/ }).safeParse(v).success) {
          ctx.addIssue({ code: "custom", message: "Link do Instagram inválido." });
          return z.NEVER;
        }
        return v;
      }
      const perfil = v.replace(/^@/, "");
      if (!/^[A-Za-z0-9._]{1,30}$/.test(perfil)) {
        ctx.addIssue({ code: "custom", message: "Use @perfil ou o link do Instagram." });
        return z.NEVER;
      }
      return `https://instagram.com/${perfil}`;
    }),
);

/** Lista de UFs para validar e para o <select>. */
export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

/** Lê todas as entradas de um nome repetido no FormData (galerias). */
export const todos = (dados: FormData, nome: string) =>
  dados.getAll(nome).filter((v): v is string => typeof v === "string" && v !== "");

/**
 * Link de botão do site: âncora da própria página (#ajudar) OU http(s).
 * Mesma trava do `linkOpcional` contra `javascript:`.
 */
export const linkOuAncoraOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .max(500, "Link longo demais.")
    .refine(
      (v) => /^#[a-z0-9-]+$/i.test(v) || z.url({ protocol: /^https?$/ }).safeParse(v).success,
      "Use uma seção da página (#ajudar) ou um link começando com https://",
    )
    .nullable(),
);

/**
 * Data de um `<input type="date">` ("AAAA-MM-DD").
 *
 * Gravada ao meio-dia de Brasília: meia-noite UTC faz a data aparecer um dia
 * ANTES para quem está no Brasil (UTC-3).
 */
export const dataOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")
    .transform((d) => new Date(`${d}T12:00:00-03:00`))
    .nullable(),
);

/**
 * Número digitado do jeito brasileiro OU do jeito do teclado.
 *
 * "1.250,50" e "1250,5" usam vírgula decimal: aí os pontos são milhar.
 * "12.5" não tem vírgula: aí o ponto é o decimal. Tratar todo ponto como
 * milhar transformaria o "12.5" de quem digita em 125.
 */
export function paraNumeroBR(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (t === "") return null;
  return t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
}

/** Ordem de exibição (0 a 999), comum a FAQ, campanhas e formas de doação. */
export const ordem = z.coerce.number({ error: "Use um número." }).int("Use um número inteiro.").min(0).max(999).default(0);

/** Checkbox: desmarcado simplesmente não vai no FormData. */
export const marcado = z.preprocess((v) => v === "on", z.boolean());
