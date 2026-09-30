import "server-only";

import { z } from "zod";
import { marcado, textoObrigatorio } from "@/server/validacao/comum";

export const esquemaUsuario = z.object({
  nome: textoObrigatorio("o nome", 100),
  email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.email({ error: "E-mail inválido." }).max(200),
  ),
  papel: z.enum(["ADMIN_PATINHAS", "ADMIN_ONG"], { error: "Escolha o perfil." }),
  organizacaoId: z.preprocess((v) => (v === "" ? null : v), z.string().nullable()),
  ativo: marcado,
  senha: z.string().max(200).default(""),
});
