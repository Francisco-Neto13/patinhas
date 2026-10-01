import "server-only";

import { z } from "zod";
import { reconhecerChavePix } from "@/lib/pix";
import {
  galeriaAte,
  imagemOpcional,
  instagramOpcional,
  linkOpcional,
  textoObrigatorio,
  textoOpcional,
  UFS,
  whatsappOpcional,
} from "@/server/validacao/comum";

export const esquemaOrganizacao = z.object({
  nome: textoObrigatorio("o nome da organização", 120),
  tipo: z.enum(["ONG", "ABRIGO", "PROTETOR_INDEPENDENTE", "PROJETO"], { error: "Escolha o tipo." }),
  status: z.enum(["PUBLICADA", "RASCUNHO", "INATIVA"], { error: "Escolha o status." }),
  descricaoCurta: textoObrigatorio("uma descrição curta", 280),
  descricaoCompleta: textoOpcional(5000),
  cidade: textoObrigatorio("a cidade", 80),
  estado: z.enum(UFS, { error: "Escolha o estado." }),
  endereco: textoOpcional(200),
  capaUrl: imagemOpcional,
  // O site mostra 3 fotos abaixo da capa. Mais que isso ficava guardado sem
  // aparecer em lugar nenhum.
  galeria: galeriaAte(3),
  /*
   * A chave é reconhecida (CPF, CNPJ, e-mail, celular ou aleatória) e gravada
   * normalizada. Chave inválida precisa ser barrada AQUI: o QR Code é gerado
   * a partir dela, e um QR de chave errada leva a doação para lugar nenhum,
   * ou para outra pessoa.
   */
  chavePix: textoOpcional(140).transform((v, ctx) => {
    if (v === null) return null;
    const r = reconhecerChavePix(v);
    if (!r) {
      ctx.addIssue({ code: "custom", message: "Chave PIX inválida. Use CPF, CNPJ, e-mail, celular com DDD ou a chave aleatória." });
      return z.NEVER;
    }
    return r.chave;
  }),
  linkDoacao: linkOpcional,
  whatsapp: whatsappOpcional,
  instagram: instagramOpcional,
  facebook: linkOpcional,
  site: linkOpcional,
});
