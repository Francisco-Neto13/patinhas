"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { Bloco } from "@/components/admin/ui";
import type { EstadoFormulario } from "@/lib/admin/validacao";
import { trocarSenha } from "./actions";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export function FormularioSenha() {
  const [estado, enviar] = useActionState<EstadoFormulario, FormData>(trocarSenha, {});

  const confirmar: PedidoConfirmacao = {
    titulo: "Trocar sua senha?",
    descricao: "Os outros aparelhos conectados com a sua conta são desconectados. Este continua conectado.",
    rotuloConfirmar: "Trocar senha",
  };
  const e = estado.erros ?? {};
  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />
      <Bloco titulo="Trocar senha">
        <CampoTexto nome="senhaAtual" rotulo="Senha atual" tipo="password" obrigatorio max={200} erros={e.senhaAtual} className="sm:col-span-2" />
        <CampoTexto nome="novaSenha" rotulo="Nova senha" tipo="password" obrigatorio max={200} erros={e.novaSenha} ajuda="Pelo menos 10 caracteres." />
        <CampoTexto nome="confirmacao" rotulo="Repita a nova senha" tipo="password" obrigatorio max={200} erros={e.confirmacao} />
      </Bloco>
      <BotaoSalvar rotulo="Trocar senha" />
    </FormularioPainel>
  );
}
