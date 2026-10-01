import "server-only";

import { z } from "zod";
import { galeria, imagemOpcional, linkOpcional, textoOpcional } from "@/server/validacao/comum";

const vazioParaNull = (v: unknown) => (v === "" ? null : v);

export const esquemaAnimal = z.object({
  // Opcional: resgate recente às vezes ainda não tem nome (o site mostra "Sem nome ainda").
  nome: textoOpcional(80),
  organizacaoId: z.string({ error: "Escolha a organização responsável." }).min(1, "Escolha a organização responsável."),
  status: z.enum(["DISPONIVEL", "EM_ADOCAO", "ADOTADO", "INATIVO"], { error: "Escolha o status." }),
  sexo: z.enum(["MACHO", "FEMEA", "NAO_INFORMADO"], { error: "Escolha o sexo." }),
  porte: z.preprocess(vazioParaNull, z.enum(["PEQUENO", "MEDIO", "GRANDE"]).nullable()),
  idade: textoOpcional(30),
  raca: textoOpcional(60),
  cidade: textoOpcional(80),
  descricao: textoOpcional(3000),
  fotoUrl: imagemOpcional,
  galeria,
  linkAdocao: linkOpcional,
});
