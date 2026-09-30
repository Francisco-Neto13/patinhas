import "server-only";

import { db } from "@/server/db";
import { conferirSenha, gerarHashDeSenha, obterHashFantasma, problemaNaSenha } from "@/server/auth/senha";
import { criarSessao, exigirSessao, hashDaSessaoAtual } from "@/server/auth/sessao";
import { bloqueado, limpar, registrarFalha } from "@/server/limitador";
import { origemDaRequisicao } from "@/server/origem";
import { falha, sucesso, type Resultado } from "@/server/resultado";

/**
 * Confere e-mail e senha e, se baterem, abre a sessão (cookie incluído).
 * Devolve `null` quando entrou, ou a mensagem de erro para a tela.
 */
export async function entrar(emailBruto: string, senhaBruta: string): Promise<string | null> {
  const email = emailBruto.trim().toLowerCase().slice(0, 200);
  const senha = senhaBruta.slice(0, 200);

  if (!email || !senha) return "Informe e-mail e senha.";

  // Por origem E e-mail: travar só pelo e-mail deixaria qualquer um bloquear o
  // login de um administrador de propósito, errando a senha dele cinco vezes.
  const chave = `${await origemDaRequisicao()}:${email}`;
  if (bloqueado(chave)) return "Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo.";

  const usuario = await db.usuario.findUnique({
    where: { email },
    select: { id: true, senhaHash: true, ativo: true },
  });

  // Com e-mail inexistente compara contra um hash descartável, para as duas
  // respostas custarem o mesmo tempo. Ver `obterHashFantasma`.
  const senhaConfere = await conferirSenha(senha, usuario?.senhaHash ?? (await obterHashFantasma()));

  /*
   * ⚠️ UMA mensagem para os três casos: e-mail que não existe, senha errada e
   * usuário desativado. Mensagens diferentes ensinariam a quem está tentando
   * quais e-mails têm conta no painel.
   */
  if (!usuario || !senhaConfere || !usuario.ativo) {
    registrarFalha(chave);
    return "E-mail ou senha incorretos.";
  }

  limpar(chave);
  await criarSessao(usuario.id);
  return null;
}

/**
 * Troca da própria senha.
 *
 * ⚠️ Pede a senha ATUAL. Sem isso, qualquer pessoa diante de um computador com
 * o painel aberto trocaria a senha e trancaria o dono para fora da conta.
 * Pelo mesmo motivo, a tentativa de senha atual passa pelo limitador do login.
 */
export async function trocarSenha(dados: FormData): Promise<Resultado> {
  const sessao = await exigirSessao();
  const atual = String(dados.get("senhaAtual") ?? "").slice(0, 200);
  const nova = String(dados.get("novaSenha") ?? "").slice(0, 200);
  const confirmacao = String(dados.get("confirmacao") ?? "").slice(0, 200);
  const noCampo = (campo: string, msg: string) => falha({ erros: { [campo]: [msg] }, erroGeral: "Confira os campos destacados." });

  const chave = `troca-senha:${sessao.usuarioId}`;
  if (bloqueado(chave)) return falha({ erroGeral: "Muitas tentativas seguidas. Aguarde 15 minutos." });

  const usuario = await db.usuario.findUnique({ where: { id: sessao.usuarioId }, select: { senhaHash: true } });
  if (!usuario || !(await conferirSenha(atual, usuario.senhaHash))) {
    registrarFalha(chave);
    return noCampo("senhaAtual", "Senha atual incorreta.");
  }

  const problema = problemaNaSenha(nova);
  if (problema) return noCampo("novaSenha", problema);
  if (nova !== confirmacao) return noCampo("confirmacao", "As duas senhas não são iguais.");
  if (nova === atual) return noCampo("novaSenha", "A nova senha precisa ser diferente da atual.");

  limpar(chave);
  await db.usuario.update({ where: { id: sessao.usuarioId }, data: { senhaHash: await gerarHashDeSenha(nova) } });

  // Derruba os OUTROS dispositivos (onde a senha antiga pode ter vazado), mas
  // mantém este, para a pessoa não cair no login no meio da troca.
  const poupar = await hashDaSessaoAtual();
  await db.sessao.deleteMany({ where: { usuarioId: sessao.usuarioId, ...(poupar && { tokenHash: { not: poupar } }) } });
  return sucesso();
}
