import "server-only";

import { z } from "zod";
import { dataOpcional, linkOpcional, paraNumeroBR, textoObrigatorio, textoOpcional } from "@/server/validacao/comum";

export const esquemaNecessidade = z.object({
  organizacaoId: z.string({ error: "Escolha a organização." }).min(1, "Escolha a organização."),
  tipo: z.enum(["RACAO", "MEDICAMENTO", "DINHEIRO", "LIMPEZA", "HIGIENE", "OUTROS"], { error: "Escolha o tipo." }),
  item: textoObrigatorio("o item", 120),
  descricao: textoOpcional(1000),
  // "2,5" é como se escreve número no Brasil; o `Number()` só entende "2.5".
  quantidade: z.preprocess(
    paraNumeroBR,
    z.coerce.number({ error: "Use só números." }).positive("A quantidade precisa ser maior que zero.").max(9_999_999, "Quantidade alta demais.").nullable(),
  ),
  unidade: textoOpcional(20),
  prioridade: z.enum(["NORMAL", "URGENTE"], { error: "Escolha a prioridade." }),
  status: z.enum(["ATIVA", "ATENDIDA", "INATIVA"], { error: "Escolha o status." }),
  validadeEm: dataOpcional,
  linkAjuda: linkOpcional,
});
