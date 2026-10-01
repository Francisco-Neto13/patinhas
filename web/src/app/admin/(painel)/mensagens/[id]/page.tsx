import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, Mail, MailCheck, MailOpen, Phone, Reply } from "lucide-react";
import * as mensagens from "@/server/dados/mensagens";
import { formatarDataHora, STATUS_MENSAGEM } from "@/lib/admin/rotulos";
import type { StatusMensagem } from "@/generated/prisma/enums";
import { BotaoExcluir } from "@/components/admin/botao-excluir";
import { exclusao } from "@/lib/admin/exclusao";
import { FormularioPainel } from "@/components/admin/confirmacao";
import { Sobretitulo } from "@/components/admin/sobretitulo";
import { Selo } from "@/components/admin/ui";
import { alterarStatusMensagem, excluirMensagem } from "../actions";

export const metadata: Metadata = { title: "Mensagem" };

const classeBotao =
  "inline-flex items-center gap-2 rounded-full border border-borda-forte bg-bone px-4 py-2 text-sm font-medium text-brown-dark transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function PaginaMensagem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await mensagens.buscar(id);
  if (!m) notFound();

  /*
   * ⚠️ Abrir a mensagem NÃO a marca como lida sozinho.
   *
   * Parece conveniente, mas gravar no banco durante a renderização faz a
   * mensagem virar "lida" também quando o Next pré-carrega o link, ou quando
   * alguém só passa o mouse na lista. Um botão explícito não mente.
   */
  // Só Arquivar pergunta: a mensagem some da caixa de entrada, e quem clicou
  // por engano não a acharia mais na lista. Marcar como lida é um clique que
  // se desfaz com outro, e perguntar ali ensinaria a confirmar sem ler.
  const botaoStatus = (status: StatusMensagem, rotulo: string, Icone: typeof Mail) =>
    m.status !== status && (
      <FormularioPainel
        acao={alterarStatusMensagem.bind(null, m.id, status)}
        protegerSaida={false}
        className=""
        confirmar={
          status === "ARQUIVADA"
            ? {
                titulo: "Arquivar esta mensagem?",
                descricao: "Ela sai da caixa de entrada e só aparece no filtro Arquivada. Nada é apagado.",
                rotuloConfirmar: "Arquivar",
              }
            : null
        }
      >
        <button type="submit" className={classeBotao}>
          <Icone className="size-4" aria-hidden="true" /> {rotulo}
        </button>
      </FormularioPainel>
    );

  const assunto = encodeURIComponent("Re: contato pelo site Patinhas");

  return (
    <>
      <Link href="/admin/mensagens" className="mb-6 inline-flex items-center gap-1.5 text-sm text-taupe hover:text-terracotta-text">
        <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para as mensagens
      </Link>

      <article className="rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <Sobretitulo />
            <h1 className="painel-titulo">{m.nome}</h1>
            <p className="painel-subtitulo">Recebida em {formatarDataHora(m.criadoEm)}</p>
          </div>
          <Selo tom={STATUS_MENSAGEM[m.status].tom}>{STATUS_MENSAGEM[m.status].rotulo}</Selo>
        </header>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt className="sr-only">E-mail</dt>
            <Mail className="size-4 text-terracotta-text" aria-hidden="true" />
            <dd><a href={`mailto:${m.email}?subject=${assunto}`} className="underline underline-offset-4 hover:text-terracotta-text">{m.email}</a></dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Telefone</dt>
            <Phone className="size-4 text-terracotta-text" aria-hidden="true" />
            <dd><a href={`tel:${m.telefone.replace(/\D/g, "")}`} className="underline underline-offset-4 hover:text-terracotta-text">{m.telefone}</a></dd>
          </div>
        </dl>

        {/* `whitespace-pre-wrap`: mantém as quebras de linha de quem escreveu.
            O texto entra como conteúdo do React, nunca como HTML, então nada
            que um visitante digite vira código na tela do admin. */}
        <p className="mt-6 text-base leading-relaxed whitespace-pre-wrap text-brown-dark">{m.mensagem}</p>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
          <a href={`mailto:${m.email}?subject=${assunto}`} className={classeBotao}>
            <Reply className="size-4" aria-hidden="true" /> Responder por e-mail
          </a>
          {botaoStatus("LIDA", "Marcar como lida", MailOpen)}
          {botaoStatus("RESPONDIDA", "Marcar como respondida", MailCheck)}
          {botaoStatus("NAO_LIDA", "Marcar como não lida", Mail)}
          {botaoStatus("ARQUIVADA", "Arquivar", Archive)}
        </div>
      </article>

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="zona-exclusao">
        <h2 id="zona-exclusao" className="font-heading text-xl font-semibold text-brown-dark">Excluir mensagem</h2>
        <p className="mt-1 mb-4 text-sm text-taupe">Apaga definitivamente. Para só tirar da caixa de entrada, arquive.</p>
        <BotaoExcluir acao={excluirMensagem.bind(null, m.id)} {...exclusao.mensagem()} />
      </section>
    </>
  );
}
