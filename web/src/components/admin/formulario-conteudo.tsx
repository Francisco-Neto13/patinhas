"use client";

import { useActionState } from "react";
import { BotaoSalvar, CampoArea, CampoImagem, CampoSelecao, CampoTexto, ErroGeral } from "@/components/admin/campos";
import { FormularioPainel } from "@/components/admin/confirmacao";
import type { Grupo } from "@/lib/conteudo/campos";
import type { EstadoFormulario } from "@/lib/admin/formulario";

export function FormularioConteudo({
  acao,
  grupos,
  valores,
}: {
  acao: (anterior: EstadoFormulario, dados: FormData) => Promise<EstadoFormulario>;
  grupos: Grupo[];
  /** Só o que está SALVO no banco. Campo sem valor salvo usa o padrão. */
  valores: Record<string, string>;
}) {
  const [estado, enviar] = useActionState(acao, {});
  const e = estado.erros ?? {};

  return (
    <FormularioPainel
      acao={enviar}
      confirmar={{
        titulo: "Publicar no site?",
        descricao: "O que você alterou aqui vai ao ar na hora, para todos os visitantes. Campo em branco volta ao texto original.",
        rotuloConfirmar: "Publicar",
      }}
    >
      <ErroGeral texto={estado.erroGeral} />

      {grupos.map((g) => (
        <fieldset key={g.id} className="rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm sm:p-7">
          <legend className="px-2 font-heading text-xl font-semibold text-brown-dark">{g.titulo}</legend>
          {g.descricao && <p className="mb-2 text-sm text-taupe">{g.descricao}</p>}
          {/* Duas colunas em tela larga: com o formulário na largura toda, um
              campo de uma linha esticado a 1600px fica ilegível. Texto longo
              ocupa as duas. */}
          <div className="mt-2 grid gap-5 lg:grid-cols-2">
            {g.campos.map((c) => {
              const atual = estado.valores?.[c.chave] ?? valores[c.chave] ?? c.padrao;
              // Mostra o original quando o campo foi alterado: dá para
              // comparar, e para desfazer basta apagar o campo.
              const ajuda = [
                c.ajuda,
                c.padrao && valores[c.chave] !== undefined ? `Original: "${c.padrao}". Apague o campo para voltar a ele.` : null,
              ].filter(Boolean).join(" ") || undefined;

              if (c.tipo === "sim_nao") {
                return (
                  <CampoSelecao
                    key={c.chave}
                    nome={c.chave}
                    rotulo={c.rotulo}
                    obrigatorio
                    opcoes={[{ valor: "sim", rotulo: "Sim" }, { valor: "nao", rotulo: "Não" }]}
                    padrao={atual}
                    erros={e[c.chave]}
                    ajuda={c.ajuda}
                  />
                );
              }
              if (c.tipo === "imagem") {
                return (
                  <CampoImagem key={c.chave} nome={c.chave} rotulo={c.rotulo} padrao={valores[c.chave] ?? null} descricaoAlt={c.rotulo} erros={e[c.chave]} ajuda={ajuda} />
                );
              }
              if (c.tipo === "area") {
                return (
                  <div key={c.chave} className="lg:col-span-2">
                    <CampoArea nome={c.chave} rotulo={c.rotulo} padrao={atual} max={c.max} linhas={c.max > 300 ? 5 : 3} erros={e[c.chave]} ajuda={ajuda} />
                  </div>
                );
              }
              return (
                <CampoTexto
                  key={c.chave}
                  nome={c.chave}
                  rotulo={c.rotulo}
                  padrao={atual}
                  max={c.max}
                  tipo={c.tipo === "email" ? "email" : "text"}
                  modoEntrada={c.tipo === "whatsapp" ? "tel" : c.tipo === "email" ? "email" : c.tipo === "link" ? "url" : undefined}
                  erros={e[c.chave]}
                  ajuda={ajuda}
                />
              );
            })}
          </div>
        </fieldset>
      ))}

      <BotaoSalvar />
    </FormularioPainel>
  );
}
