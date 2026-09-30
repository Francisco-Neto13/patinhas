import "server-only";

import { z } from "zod";
import { dataOpcional, imagemOpcional, linkOuAncoraOpcional, ordem, textoObrigatorio, textoOpcional } from "@/server/validacao/comum";

export const esquemaCampanha = z.object({
  titulo: textoObrigatorio("o título", 100),
  descricao: textoOpcional(300),
  imagemUrl: imagemOpcional,
  link: linkOuAncoraOpcional,
  textoBotao: textoOpcional(40),
  ordem,
  inicioEm: dataOpcional,
  fimEm: dataOpcional,
  status: z.enum(["ATIVO", "INATIVO"], { error: "Escolha o status." }),
});
