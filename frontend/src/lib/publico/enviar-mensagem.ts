"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { origemDaRequisicao } from "@/lib/origem";
import { registrarAtividade } from "@/lib/admin/atividade";
import { LIMITES, validarContato, type CamposContato, type ErrosContato } from "@/lib/validacao-contato";

export type ResultadoEnvio = { ok: true } | { ok: false; erro: string; erros?: ErrosContato };

const MAXIMO_POR_JANELA = 3;
const JANELA_MS = 10 * 60 * 1000;

/**
 * Recebe o formulário de contato do site e grava para o painel (seção 9).
 *
 * ⚠️ Esta é a ÚNICA Server Action que qualquer visitante, sem login, consegue
 * chamar. Por isso tudo é conferido de novo aqui, mesmo já tendo sido no
 * navegador: a validação do cliente é conforto de quem digita, e quem manda
 * um POST direto nem passa por ela.
 */
export async function enviarMensagem(entrada: CamposContato & { armadilha?: string }): Promise<ResultadoEnvio> {
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
  revalidatePath("/admin", "layout");
  return { ok: true };
}
