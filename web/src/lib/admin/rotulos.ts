/*
 * Texto em português para cada valor de enum do banco, num lugar só.
 *
 * O banco guarda EM_ADOCAO; a tela mostra "Em processo de adoção". Se cada
 * página traduzisse por conta própria, a mesma coisa apareceria com três nomes
 * diferentes no painel.
 *
 * Importa só de `enums` (e não de `client`): este arquivo também é usado por
 * Client Components, e o client do Prisma não pode ir para o navegador.
 */
import type {
  Papel,
  Porte,
  Prioridade,
  Sexo,
  StatusAnimal,
  StatusMensagem,
  StatusNecessidade,
  StatusOrganizacao,
  TipoFormaDoacao,
  TipoNecessidade,
  TipoOrganizacao,
  TipoRegistroDoacao,
} from "@/generated/prisma/enums";

export type Tom = "verde" | "ambar" | "vermelho" | "neutro" | "azul";

type Rotulo<T extends string> = Record<T, { rotulo: string; tom?: Tom }>;

export const TIPO_ORGANIZACAO: Rotulo<TipoOrganizacao> = {
  ONG: { rotulo: "ONG" },
  ABRIGO: { rotulo: "Abrigo" },
  PROTETOR_INDEPENDENTE: { rotulo: "Protetor independente" },
  PROJETO: { rotulo: "Projeto" },
};

export const STATUS_ORGANIZACAO: Rotulo<StatusOrganizacao> = {
  PUBLICADA: { rotulo: "Publicada", tom: "verde" },
  RASCUNHO: { rotulo: "Rascunho", tom: "ambar" },
  INATIVA: { rotulo: "Inativa", tom: "neutro" },
};

export const SEXO: Rotulo<Sexo> = {
  MACHO: { rotulo: "Macho" },
  FEMEA: { rotulo: "Fêmea" },
  NAO_INFORMADO: { rotulo: "Não informado" },
};

export const PORTE: Rotulo<Porte> = {
  PEQUENO: { rotulo: "Porte pequeno" },
  MEDIO: { rotulo: "Porte médio" },
  GRANDE: { rotulo: "Porte grande" },
};

export const STATUS_ANIMAL: Rotulo<StatusAnimal> = {
  DISPONIVEL: { rotulo: "Disponível", tom: "verde" },
  EM_ADOCAO: { rotulo: "Em processo de adoção", tom: "azul" },
  ADOTADO: { rotulo: "Adotado", tom: "ambar" },
  INATIVO: { rotulo: "Inativo", tom: "neutro" },
};

export const TIPO_NECESSIDADE: Rotulo<TipoNecessidade> = {
  RACAO: { rotulo: "Ração" },
  MEDICAMENTO: { rotulo: "Medicamento" },
  DINHEIRO: { rotulo: "Dinheiro" },
  LIMPEZA: { rotulo: "Material de limpeza" },
  HIGIENE: { rotulo: "Higiene" },
  OUTROS: { rotulo: "Outros" },
};

export const PRIORIDADE: Rotulo<Prioridade> = {
  NORMAL: { rotulo: "Normal", tom: "neutro" },
  URGENTE: { rotulo: "Urgente", tom: "vermelho" },
};

export const STATUS_NECESSIDADE: Rotulo<StatusNecessidade> = {
  ATIVA: { rotulo: "Ativa", tom: "verde" },
  ATENDIDA: { rotulo: "Atendida", tom: "azul" },
  INATIVA: { rotulo: "Inativa", tom: "neutro" },
};

export const STATUS_MENSAGEM: Rotulo<StatusMensagem> = {
  NAO_LIDA: { rotulo: "Não lida", tom: "vermelho" },
  LIDA: { rotulo: "Lida", tom: "neutro" },
  RESPONDIDA: { rotulo: "Respondida", tom: "verde" },
  ARQUIVADA: { rotulo: "Arquivada", tom: "neutro" },
};

export const PAPEL: Rotulo<Papel> = {
  ADMIN_PATINHAS: { rotulo: "Administrador Patinhas" },
  ADMIN_ONG: { rotulo: "Administrador de ONG" },
};

export const TIPO_FORMA_DOACAO: Rotulo<TipoFormaDoacao> = {
  PIX: { rotulo: "PIX" },
  VAQUINHA: { rotulo: "Vaquinha online" },
  OUTRA_PLATAFORMA: { rotulo: "Outra plataforma" },
  RACAO: { rotulo: "Doação de ração" },
  MEDICAMENTO: { rotulo: "Doação de medicamentos" },
  OUTRO: { rotulo: "Outro tipo de ajuda" },
};

export const TIPO_REGISTRO_DOACAO: Rotulo<TipoRegistroDoacao> = {
  DINHEIRO: { rotulo: "Dinheiro" },
  RACAO: { rotulo: "Ração" },
  MEDICAMENTO: { rotulo: "Medicamento" },
  OUTRO: { rotulo: "Outro" },
};

/** `{ valor, rotulo }[]` pronto para um <select>. */
export function opcoes<T extends string>(mapa: Rotulo<T>) {
  return (Object.keys(mapa) as T[]).map((valor) => ({ valor, rotulo: mapa[valor].rotulo }));
}

export const formatarData = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

export const formatarDataHora = (d: Date) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
