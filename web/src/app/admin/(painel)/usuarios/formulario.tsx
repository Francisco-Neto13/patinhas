"use client";

import { useActionState, useState } from "react";
import { BotaoSalvar, CampoSelecao, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { Bloco } from "@/components/admin/ui";
import { opcoes, PAPEL } from "@/lib/admin/rotulos";
import type { EstadoFormulario } from "@/lib/admin/formulario";
import { FormularioPainel, type PedidoConfirmacao } from "@/components/admin/confirmacao";

export type UsuarioForm = {
  nome: string;
  email: string;
  papel: string;
  organizacaoId: string | null;
  ativo: boolean;
};

export function FormularioUsuario({
  acao,
  inicial,
  organizacoes,
  ehVoceMesmo,
}: {
  acao: (anterior: EstadoFormulario, dados: FormData) => Promise<EstadoFormulario>;
  inicial?: UsuarioForm;
  organizacoes: { id: string; nome: string }[];
  ehVoceMesmo?: boolean;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};
  const v = (campo: keyof UsuarioForm) => estado.valores?.[campo] ?? (inicial?.[campo] as string | null | undefined) ?? "";
  // O campo de organização só faz sentido para admin de ONG: some e aparece
  // conforme o perfil escolhido.
  const [papel, setPapel] = useState(v("papel") || "ADMIN_ONG");
  const ativoInicial = estado.valores ? estado.valores.ativo === "on" : (inicial?.ativo ?? true);

  // Acesso ao painel é o que mais custa errar: quem entra, com que poder e
  // quem perde o acesso.
  const confirmar = (d: FormData): PedidoConfirmacao | null => {
    const nome = String(d.get("nome") ?? "").trim() || "Esta pessoa";
    const novoPapel = String(d.get("papel") ?? "");
    const ativo = d.get("ativo") === "on";
    const poder =
      novoPapel === "ADMIN_PATINHAS"
        ? "Administrador Patinhas, com acesso completo ao painel"
        : "administrador da ONG escolhida, vendo só a própria organização";
    if (!inicial) {
      return { titulo: "Cadastrar usuário?", descricao: `${nome} passa a entrar no painel como ${poder}.`, rotuloConfirmar: "Cadastrar" };
    }
    if (inicial.ativo && !ativo) {
      return {
        titulo: "Desativar acesso?",
        descricao: `${nome} perde o acesso ao painel na hora, e as sessões abertas são encerradas. O cadastro continua e pode ser reativado.`,
        rotuloConfirmar: "Desativar",
        destrutiva: true,
      };
    }
    if (novoPapel && novoPapel !== inicial.papel) {
      return { titulo: "Mudar o perfil?", descricao: `${nome} passa a ser ${poder}.`, rotuloConfirmar: "Mudar perfil" };
    }
    if (String(d.get("senha") ?? "")) {
      return {
        titulo: "Trocar a senha?",
        descricao: `As sessões abertas de ${nome} são encerradas, e a pessoa precisa entrar de novo com a senha nova.`,
        rotuloConfirmar: "Trocar senha",
      };
    }
    return null;
  };

  return (
    <FormularioPainel acao={enviar} confirmar={confirmar}>
      <ErroGeral texto={estado.erroGeral} />

      <Bloco titulo="Conta">
        <CampoTexto nome="nome" rotulo="Nome" obrigatorio max={100} padrao={v("nome")} erros={e.nome} />
        <CampoTexto nome="email" rotulo="E-mail" tipo="email" modoEntrada="email" obrigatorio max={200} padrao={v("email")} erros={e.email} />
        <CampoTexto
          nome="senha"
          rotulo={inicial ? "Nova senha" : "Senha"}
          tipo="password"
          obrigatorio={!inicial}
          max={200}
          erros={e.senha}
          ajuda={inicial ? "Deixe em branco para manter a atual. Trocar a senha encerra as sessões abertas dessa pessoa." : "Pelo menos 10 caracteres."}
          className="sm:col-span-2"
        />
      </Bloco>

      <Bloco titulo="Permissões">
        <div className="space-y-1.5">
          <label htmlFor="campo-papel" className="block text-sm font-medium text-brown-dark">Perfil</label>
          <select
            id="campo-papel"
            name="papel"
            value={papel}
            onChange={(ev) => setPapel(ev.target.value)}
            disabled={ehVoceMesmo}
            className="h-10 w-full rounded-[0.75rem] border border-input bg-bone px-3.5 text-base text-brown-dark outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            {opcoes(PAPEL).map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </select>
          {/* `disabled` não envia o campo: o valor vai por este oculto. */}
          {ehVoceMesmo && <input type="hidden" name="papel" value={papel} />}
          <p className="text-xs text-taupe">
            {papel === "ADMIN_PATINHAS" ? "Acesso completo ao painel." : "Só enxerga e edita a própria organização."}
          </p>
        </div>

        {papel === "ADMIN_ONG" && (
          <CampoSelecao
            nome="organizacaoId"
            rotulo="Organização"
            obrigatorio
            opcoes={organizacoes.map((o) => ({ valor: o.id, rotulo: o.nome }))}
            vazio="Escolha..."
            padrao={v("organizacaoId")}
            erros={e.organizacaoId}
          />
        )}

        <div className="flex items-start gap-3 sm:col-span-2">
          <input
            // Recriado quando o padrão muda: o reset do React 19 não
            // acompanha `defaultChecked` (ver CampoSelecao em campos.tsx).
            key={String(ativoInicial)}
            id="campo-ativo"
            name="ativo"
            type="checkbox"
            defaultChecked={ativoInicial}
            disabled={ehVoceMesmo}
            className="mt-0.5 size-4 accent-primary"
          />
          {ehVoceMesmo && <input type="hidden" name="ativo" value="on" />}
          <label htmlFor="campo-ativo" className="text-sm text-brown-dark">
            Conta ativa
            <span className="block text-xs text-taupe">
              {ehVoceMesmo ? "Você não pode desativar a própria conta." : "Desativar encerra o acesso na hora, sem apagar o cadastro."}
            </span>
          </label>
        </div>
      </Bloco>

      <BotaoSalvar />
    </FormularioPainel>
  );
}
