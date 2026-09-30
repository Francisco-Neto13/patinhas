import "server-only";

import { z } from "zod";
import { dataOpcional, linkOpcional, marcado, ordem, paraNumeroBR, textoObrigatorio, textoOpcional } from "@/server/validacao/comum";

const numeroOpcional = (rotulo: string) =>
  z.preprocess(
    paraNumeroBR,
    z.coerce.number({ error: `${rotulo}: use só números.` }).positive(`${rotulo} precisa ser maior que zero.`).max(99_999_999).nullable(),
  );

/** Formas de doação (seção 5.1): aparecem no site, no card da organização. */
export const esquemaForma = z.object({
  tipo: z.enum(["PIX", "VAQUINHA", "OUTRA_PLATAFORMA", "RACAO", "MEDICAMENTO", "OUTRO"], { error: "Escolha o tipo." }),
  titulo: textoObrigatorio("o título", 80),
  descricao: textoOpcional(400),
  link: linkOpcional,
  ordem,
  ativa: marcado,
});

/** Registros de doações informadas (seção 5.2): só no painel. */
export const esquemaRegistro = z.object({
  data: dataOpcional.refine((d) => d !== null, "Informe a data."),
  tipo: z.enum(["DINHEIRO", "RACAO", "MEDICAMENTO", "OUTRO"], { error: "Escolha o tipo." }),
  valor: numeroOpcional("O valor"),
  item: textoOpcional(120),
  quantidade: numeroOpcional("A quantidade"),
  unidade: textoOpcional(20),
  doador: textoOpcional(120),
  anonimo: marcado,
  observacao: textoOpcional(1000),
});
