import "server-only";

import type { StatusMensagem } from "@/generated/prisma/enums";
import { LIMITES, validarContato, type CamposContato, type ErrosContato } from "@/lib/validacao-contato";
import { db } from "@/server/db";
import { exigirAdminPatinhas, exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import { registrarAtividade } from "@/server/atividade";
import { origemDaRequisicao } from "@/server/origem";
import { falha, sucesso, type Resultado } from "@/server/resultado";

/*
 * Mensagens do formulário de contato. Só a equipe Patinhas lê (seção 11.1);
 * qualquer visitante, sem login, envia.
 */

const VALIDOS: StatusMensagem[] = ["NAO_LIDA", "LIDA", "RESPONDIDA", "ARQUIVADA"];

/** Sem filtro: tudo menos as arquivadas. Arquivar serve para tirar da frente sem apagar. */
export async function listar(status?: StatusMensagem) {
  await exigirAdminPatinhas();
  const [mensagens, contagens] = await Promise.all([
    db.mensagem.findMany({
      where: status ? { status } : { status: { not: "ARQUIVADA" } },
      orderBy: { criadoEm: "desc" },
      take: 200,
      select: { id: true, nome: true, email: true, mensagem: true, status: true, criadoEm: true },
    }),
    db.mensagem.groupBy({ by: ["status"], _count: true }),
  ]);
  return { mensagens, contagens };
}

export async function buscar(id: string) {
  await exigirAdminPatinhas();
  return db.mensagem.findUnique({ where: { id } });
}

/** O selo do menu. Para o admin de ONG nem consulta: mensagens não são dele. */
export async function contarNaoLidas() {
  const sessao = await exigirSessao();
  if (!ehAdminPatinhas(sessao)) return 0;
  return db.mensagem.count({ where: { status: "NAO_LIDA" } });
}

export async function alterarStatus(id: string, status: StatusMensagem): Promise<Resultado> {
  await exigirAdminPatinhas();
  // `status` também vem do cliente pelo `.bind`: só um dos quatro passa.
  if (!VALIDOS.includes(status)) return falha({ erroGeral: "Status inválido." });
  await db.mensagem.updateMany({ where: { id }, data: { status } });
  return sucesso();
}

export async function excluir(id: string): Promise<Resultado> {
  await exigirAdminPatinhas();
  await db.mensagem.deleteMany({ where: { id } });
  return sucesso();
}

// ---------------------------------------------------------------------------
// Recebimento, pelo site público (seção 9).
// ---------------------------------------------------------------------------

export type ResultadoEnvio = { ok: true } | { ok: false; erro: string; erros?: ErrosContato };

const MAXIMO_POR_JANELA = 3;
const JANELA_MS = 10 * 60 * 1000;

/**
 * Grava a mensagem de um visitante para o painel.
 *
 * ⚠️ É o ÚNICO caminho de escrita que qualquer visitante, sem login, alcança.
 * Por isso tudo é conferido de novo aqui, mesmo já tendo sido no navegador: a
 * validação do cliente é conforto de quem digita, e quem manda um POST direto
 * nem passa por ela.
 */
export async function receber(entrada: CamposContato & { armadilha?: string }): Promise<ResultadoEnvio> {
  /*
   * Campo-armadilha: invisível para gente, preenchido por robô que preenche
   * todos os campos que encontra. Se veio preenchido, responde "enviado" e
   * descarta. Responder erro ensinaria ao robô qual campo evitar.
   */
  if (entrada.armadilha) return { ok: true };

  // Normaliza para string e aplica os mesmos limites de tamanho do formulário.
  const campos: CamposContato = {
    nome: String(entrada.nome ?? "").slice(0, LIMITES.nome),
    email: String(entrada.email ?? "").slice(0, LIMITES.email),
    telefone: String(entrada.telefone ?? "").slice(0, LIMITES.telefone),
    mensagem: String(entrada.mensagem ?? "").slice(0, LIMITES.mensagem),
  };

  // A MESMA função que valida no navegador: as regras não podem divergir.
  const erros = validarContato(campos);
  if (Object.keys(erros).length > 0) return { ok: false, erro: "Confira os campos destacados.", erros };

  const origemHash = await origemDaRequisicao();
  const recentes = await db.mensagem.count({
    where: { origemHash, criadoEm: { gte: new Date(Date.now() - JANELA_MS) } },
  });
  if (recentes >= MAXIMO_POR_JANELA) {
    return { ok: false, erro: "Recebemos várias mensagens suas agora há pouco. Aguarde alguns minutos para enviar outra." };
  }

  const salva = await db.mensagem.create({
    data: {
      nome: campos.nome.trim(),
      email: campos.email.trim().toLowerCase(),
      telefone: campos.telefone,
      mensagem: campos.mensagem.trim(),
      origemHash,
    },
    select: { nome: true },
  });

  await registrarAtividade({ tipo: "mensagem", descricao: `Nova mensagem recebida de ${salva.nome}` });
  return { ok: true };
}
