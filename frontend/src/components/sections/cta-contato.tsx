"use client";

import { useState } from "react";
import { AlertCircle, Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site-config";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";
import {
  formatarTelefone,
  LIMITES,
  ORDEM_CAMPOS,
  validarContato,
  type CamposContato,
  type ErrosContato,
} from "@/lib/validacao-contato";

const VAZIO: CamposContato = { nome: "", email: "", telefone: "", mensagem: "" };

/** id do campo no DOM — usado pelo <label>, pelo aria-describedby e pelo foco. */
const idDoCampo = (campo: keyof CamposContato) => `contato-${campo}`;

function MensagemDeErro({ id, texto }: { id: string; texto: string }) {
  return (
    // ⚠️ `role="alert"` faz o leitor de tela anunciar o erro assim que ele
    // aparece, sem esperar a pessoa navegar até lá. E o ícone existe porque a
    // WCAG 1.4.1 proíbe usar SÓ a cor para informar algo: quem não distingue o
    // vermelho precisa de outro sinal.
    <p id={id} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {texto}
    </p>
  );
}

export function CtaContato() {
  const [campos, setCampos] = useState<CamposContato>(VAZIO);
  const [erros, setErros] = useState<ErrosContato>({});
  /*
   * Só valida depois da primeira tentativa de envio.
   *
   * Marcar o campo de e-mail como inválido enquanto a pessoa ainda está
   * digitando a primeira letra é hostil — ela ainda não errou, só não terminou.
   * Depois do primeiro envio, aí sim revalida a cada tecla, para o erro sumir
   * assim que for corrigido.
   */
  const [jaTentou, setJaTentou] = useState(false);

  function alterar(campo: keyof CamposContato, valor: string) {
    /*
     * ⚠️ O corte acontece aqui TAMBEM, e nao so no `maxLength` do campo.
     *
     * O atributo limita digitacao e colagem — que e o caminho normal —, mas nao
     * vale para valor atribuido por codigo: preenchimento automatico do
     * navegador, extensao, ou um `.value = ...` qualquer entram inteiros. Como
     * quem monta o corpo do e-mail e este estado, e nao o DOM, o limite tem de
     * valer aqui para ser um limite de verdade.
     *
     * O telefone nao precisa: o `formatarTelefone` ja para nos 11 digitos.
     */
    const cortado =
      campo === "telefone" ? formatarTelefone(valor) : valor.slice(0, LIMITES[campo]);
    const proximo = { ...campos, [campo]: cortado };
    setCampos(proximo);
    if (jaTentou) setErros(validarContato(proximo));
  }

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setJaTentou(true);

    const encontrados = validarContato(campos);
    setErros(encontrados);

    if (Object.keys(encontrados).length > 0) {
      /*
       * ⚠️ Mandar o foco para o primeiro campo inválido.
       *
       * Sem isto, quem envia pelo teclado fica com o foco no botão, os erros
       * aparecem acima — fora da vista de quem usa ampliador de tela — e a
       * única saída é sair navegando por Shift+Tab para achar qual campo
       * reclamou. É o WCAG 3.3.1 na prática.
       */
      const primeiro = ORDEM_CAMPOS.find((c) => encontrados[c]);
      if (primeiro) document.getElementById(idDoCampo(primeiro))?.focus();
      return;
    }

    const corpo = [
      campos.mensagem,
      "",
      `Nome: ${campos.nome}`,
      `E-mail: ${campos.email}`,
      `Telefone: ${campos.telefone}`,
    ].join("\n");

    window.location.href = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
      `Contato pelo site — ${campos.nome}`,
    )}&body=${encodeURIComponent(corpo)}`;
  }

  /** Atributos que ligam campo, erro e ajuda — repetidos em todos os campos. */
  const acessibilidadeDo = (campo: keyof CamposContato, ajudaId?: string) => {
    const erroId = `${idDoCampo(campo)}-erro`;
    const descricoes = [erros[campo] ? erroId : null, ajudaId].filter(Boolean).join(" ");
    return {
      id: idDoCampo(campo),
      name: campo,
      "aria-invalid": erros[campo] ? (true as const) : undefined,
      "aria-describedby": descricoes || undefined,
    };
  };

  const restantes = LIMITES.mensagem - campos.mensagem.length;

  return (
    <section id="contato" className="relative overflow-hidden py-20 sm:py-28">
      <AnimalDeFundo animal="peixe" className="-right-12 bottom-12 size-56 -scale-x-100 text-brown/[0.09] lg:size-72" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            Vamos juntos por mais focinhos felizes?
          </h2>
          <p className="mt-4 text-taupe">
            Manda uma mensagem pra gente — abre seu e-mail já preenchido com o
            que você escrever aqui.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            /*
             * ⚠️ `noValidate` desliga as bolhas do navegador de propósito.
             *
             * Elas aparecem no idioma do navegador (não no do site), somem
             * sozinhas depois de alguns segundos, só mostram um erro por vez e
             * não são lidas de forma confiável por todo leitor de tela. Os
             * atributos nativos continuam nos campos — eles é que dão o teclado
             * certo no celular e o preenchimento automático —, mas quem escreve
             * a mensagem é o `validarContato`.
             */
            noValidate
            onSubmit={enviar}
            className="mt-10 space-y-5 rounded-3xl border border-border bg-bone p-6 shadow-sm sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={idDoCampo("nome")}
                  className="block text-sm font-medium text-brown-dark"
                >
                  Seu nome
                </label>
                <Input
                  {...acessibilidadeDo("nome")}
                  autoComplete="name"
                  maxLength={LIMITES.nome}
                  required
                  placeholder="Como podemos te chamar?"
                  value={campos.nome}
                  onChange={(e) => alterar("nome", e.target.value)}
                />
                {erros.nome && (
                  <MensagemDeErro id={`${idDoCampo("nome")}-erro`} texto={erros.nome} />
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={idDoCampo("email")}
                  className="block text-sm font-medium text-brown-dark"
                >
                  Seu e-mail
                </label>
                <Input
                  {...acessibilidadeDo("email")}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={LIMITES.email}
                  required
                  placeholder="voce@exemplo.com"
                  value={campos.email}
                  onChange={(e) => alterar("email", e.target.value)}
                />
                {erros.email && (
                  <MensagemDeErro id={`${idDoCampo("email")}-erro`} texto={erros.email} />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={idDoCampo("telefone")}
                className="block text-sm font-medium text-brown-dark"
              >
                Seu telefone
              </label>
              <Input
                {...acessibilidadeDo("telefone", `${idDoCampo("telefone")}-ajuda`)}
                type="tel"
                // `inputMode="tel"` abre o teclado numérico no celular. O campo
                // continua `type="tel"` e não `number`: número não aceita
                // parênteses nem hífen, e ainda vem com setinhas de incremento.
                inputMode="tel"
                autoComplete="tel"
                maxLength={LIMITES.telefone}
                required
                placeholder="(11) 91234-5678"
                value={campos.telefone}
                onChange={(e) => alterar("telefone", e.target.value)}
              />
              <p id={`${idDoCampo("telefone")}-ajuda`} className="text-xs text-taupe">
                Fixo ou celular, com DDD. A formatação é automática.
              </p>
              {erros.telefone && (
                <MensagemDeErro id={`${idDoCampo("telefone")}-erro`} texto={erros.telefone} />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <label
                  htmlFor={idDoCampo("mensagem")}
                  className="block text-sm font-medium text-brown-dark"
                >
                  Sua mensagem
                </label>
                {/*
                  ⚠️ Sem `aria-live` de propósito.
                  Um contador que se anuncia a cada tecla transforma a digitação
                  num tagarelar constante. Ele entra no `aria-describedby` do
                  campo: é lido quando o foco chega, e continua visível o tempo
                  todo para quem enxerga.
                */}
                <span
                  id={`${idDoCampo("mensagem")}-contador`}
                  className={`text-xs tabular-nums ${
                    restantes <= 50 ? "font-medium text-destructive" : "text-taupe"
                  }`}
                >
                  {campos.mensagem.length}/{LIMITES.mensagem}
                </span>
              </div>
              <Textarea
                {...acessibilidadeDo("mensagem", `${idDoCampo("mensagem")}-contador`)}
                rows={4}
                maxLength={LIMITES.mensagem}
                required
                placeholder="Como podemos ajudar?"
                value={campos.mensagem}
                onChange={(e) => alterar("mensagem", e.target.value)}
              />
              {erros.mensagem && (
                <MensagemDeErro id={`${idDoCampo("mensagem")}-erro`} texto={erros.mensagem} />
              )}
            </div>

            <p className="text-xs text-taupe">
              Ao enviar, abrimos seu programa de e-mail com a mensagem já
              escrita — nada é enviado por este site.
            </p>

            <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto">
              Enviar mensagem <Send className="size-4" />
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-taupe sm:flex-row">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-2 hover:text-terracotta-text"
            >
              <Mail className="size-4" /> {siteConfig.contact.email}
            </a>
            <a
              href={siteConfig.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-terracotta-text"
            >
              <MessageCircle className="size-4" /> WhatsApp
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
