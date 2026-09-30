import { z } from "zod";
import type { Campo } from "@/lib/conteudo/campos";
import { ehUrlDeUpload } from "@/lib/uploads-formato";

type Resultado = { ok: true; valor: string } | { ok: false; erro: string };

const https = z.url({ protocol: /^https?$/ });

/**
 * Valida um campo de conteúdo conforme o tipo declarado no registro.
 *
 * Campo em branco volta ao padrão (quem chama apaga a chave do banco). Isso
 * impede que um título apagado sem querer deixe um buraco no site.
 */
export function validarCampo(campo: Campo, bruto: string): Resultado {
  const v = bruto.trim();
  if (v === "") return { ok: true, valor: "" };
  if (v.length > campo.max) return { ok: false, erro: `Use no máximo ${campo.max} caracteres.` };

  switch (campo.tipo) {
    case "texto":
    case "area":
      return { ok: true, valor: v };

    case "link":
      /*
       * ⚠️ Âncora da própria página OU https. Nada mais.
       * O valor vira `href` de botão no site público; um `javascript:` aqui
       * executaria script no navegador de todo visitante que clicasse.
       */
      if (/^#[a-z0-9-]+$/i.test(v)) return { ok: true, valor: v };
      return https.safeParse(v).success
        ? { ok: true, valor: v }
        : { ok: false, erro: "Use uma seção da página (#ajudar) ou um link começando com https://" };

    case "email":
      return z.email().safeParse(v).success ? { ok: true, valor: v.toLowerCase() } : { ok: false, erro: "E-mail inválido." };

    case "whatsapp": {
      if (/^https?:\/\//i.test(v)) {
        return https.safeParse(v).success ? { ok: true, valor: v } : { ok: false, erro: "Link de WhatsApp inválido." };
      }
      const d = v.replace(/\D/g, "");
      const comPais = d.length <= 11 ? `55${d}` : d;
      return comPais.length >= 12 && comPais.length <= 13
        ? { ok: true, valor: `https://wa.me/${comPais}` }
        : { ok: false, erro: "Informe o número com DDD ou um link wa.me." };
    }

    case "sim_nao":
      return v === "sim" || v === "nao" ? { ok: true, valor: v } : { ok: false, erro: "Escolha Sim ou Não." };

    case "imagem":
      return ehUrlDeUpload(v) ? { ok: true, valor: v } : { ok: false, erro: "Imagem inválida. Envie de novo." };
  }
}
