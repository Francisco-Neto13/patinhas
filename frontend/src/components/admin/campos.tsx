"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Campos dos formulários do admin.
 *
 * ⚠️ `padrao` precisa vir do ESTADO da action quando a validação falha, e não
 * só do registro do banco. O React 19 reseta o formulário depois de toda
 * submissão via `action`: sem devolver o que foi digitado, um erro num campo
 * apaga os outros quinze que a pessoa já tinha preenchido.
 */

type Base = {
  nome: string;
  rotulo: string;
  erros?: string[];
  ajuda?: string;
  obrigatorio?: boolean;
  className?: string;
};

const classeControle =
  "w-full min-w-0 rounded-[0.75rem] border border-input bg-bone px-3.5 py-2.5 text-base text-brown-dark transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm";

function Moldura({
  nome,
  rotulo,
  erros,
  ajuda,
  obrigatorio,
  className,
  children,
}: Base & { children: (ids: { id: string; descricao?: string; invalido: boolean }) => ReactNode }) {
  const id = `campo-${nome}`;
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idErro = erros?.length ? `${id}-erro` : undefined;
  const descricao = [idErro, idAjuda].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-brown-dark">
        {rotulo}
        {/* Escrito por extenso: um asterisco sozinho depende de legenda e some para leitor de tela. */}
        {!obrigatorio && <span className="font-normal text-taupe"> (opcional)</span>}
      </label>
      {children({ id, descricao, invalido: !!idErro })}
      {ajuda && (
        <p id={idAjuda} className="text-xs text-taupe">
          {ajuda}
        </p>
      )}
      {idErro && (
        <p id={idErro} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {erros![0]}
        </p>
      )}
    </div>
  );
}

export function CampoTexto({
  padrao,
  tipo = "text",
  max,
  placeholder,
  modoEntrada,
  ...base
}: Base & {
  padrao?: string | null;
  tipo?: "text" | "email" | "url" | "date" | "number" | "password";
  max?: number;
  placeholder?: string;
  modoEntrada?: "text" | "numeric" | "decimal" | "tel" | "email" | "url";
}) {
  return (
    <Moldura {...base}>
      {({ id, descricao, invalido }) => (
        <input
          id={id}
          name={base.nome}
          type={tipo}
          inputMode={modoEntrada}
          defaultValue={padrao ?? ""}
          maxLength={max}
          required={base.obrigatorio}
          placeholder={placeholder}
          aria-invalid={invalido || undefined}
          aria-describedby={descricao}
          step={tipo === "number" ? "0.01" : undefined}
          className={cn(classeControle, "h-10")}
        />
      )}
    </Moldura>
  );
}

export function CampoArea({
  padrao,
  max,
  linhas = 4,
  ...base
}: Base & { padrao?: string | null; max?: number; linhas?: number }) {
  return (
    <Moldura {...base}>
      {({ id, descricao, invalido }) => (
        <textarea
          id={id}
          name={base.nome}
          defaultValue={padrao ?? ""}
          maxLength={max}
          rows={linhas}
          required={base.obrigatorio}
          aria-invalid={invalido || undefined}
          aria-describedby={descricao}
          className={classeControle}
        />
      )}
    </Moldura>
  );
}

export function CampoSelecao({
  padrao,
  opcoes,
  vazio,
  ...base
}: Base & {
  padrao?: string | null;
  opcoes: { valor: string; rotulo: string }[];
  /** Texto da opção vazia. Sem ele, o select não oferece "nenhum". */
  vazio?: string;
}) {
  return (
    <Moldura {...base}>
      {({ id, descricao, invalido }) => (
        <select
          /*
           * ⚠️ `key` = valor padrão, para o select ser RECRIADO quando ele muda.
           *
           * Depois de um erro de validação o React 19 reseta o formulário, e
           * cada campo volta ao seu `defaultValue`. Input de texto acompanha o
           * novo `defaultValue` que a action devolveu; <select> não: ele volta
           * para a opção que era padrão quando foi montado, e a escolha da
           * pessoa sumia (verificado no navegador). Recriado, nasce certo.
           */
          key={padrao ?? ""}
          id={id}
          name={base.nome}
          defaultValue={padrao ?? ""}
          required={base.obrigatorio}
          aria-invalid={invalido || undefined}
          aria-describedby={descricao}
          className={cn(classeControle, "h-10")}
        >
          {vazio !== undefined && <option value="">{vazio}</option>}
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      )}
    </Moldura>
  );
}

/** Envia um arquivo para /admin/api/upload e devolve a URL gravada. */
async function enviarArquivo(arquivo: File): Promise<string> {
  const corpo = new FormData();
  corpo.append("arquivo", arquivo);
  const resposta = await fetch("/admin/api/upload", { method: "POST", body: corpo });
  const json = (await resposta.json().catch(() => ({}))) as { url?: string; erro?: string };
  if (!resposta.ok || !json.url) throw new Error(json.erro ?? "Falha ao enviar a imagem.");
  return json.url;
}

function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  return { enviando, setEnviando, erro, setErro };
}

/*
 * Imagem única (capa, foto principal, QR Code do PIX).
 *
 * O arquivo sobe na hora em que é escolhido, e o formulário carrega só a URL
 * num campo oculto. Assim a Server Action de salvar nunca recebe binário, e o
 * limite de 1 MB dela deixa de importar.
 */
export function CampoImagem({
  padrao,
  descricaoAlt,
  ...base
}: Base & { padrao?: string | null; descricaoAlt: string }) {
  const [url, setUrl] = useState(padrao ?? "");
  const { enviando, setEnviando, erro, setErro } = useEnvio();
  const entrada = useRef<HTMLInputElement>(null);
  const errosTela = erro ? [erro] : base.erros;

  return (
    <Moldura {...base} erros={errosTela}>
      {({ id, descricao, invalido }) => (
        <div className="space-y-2">
          <input type="hidden" name={base.nome} value={url} />
          {url && (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload */}
              <img src={url} alt={descricaoAlt} className="h-32 w-auto max-w-full rounded-xl border border-border object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={entrada}
              id={id}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={invalido || undefined}
              aria-describedby={descricao}
              disabled={enviando}
              className="sr-only"
              onChange={async (e) => {
                const arquivo = e.target.files?.[0];
                e.target.value = "";
                if (!arquivo) return;
                setErro(null);
                setEnviando(true);
                try {
                  setUrl(await enviarArquivo(arquivo));
                } catch (falha) {
                  setErro((falha as Error).message);
                } finally {
                  setEnviando(false);
                }
              }}
            />
            <Button type="button" variant="outline" size="lg" className="rounded-full" disabled={enviando} onClick={() => entrada.current?.click()}>
              {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
              {enviando ? "Enviando..." : url ? "Trocar imagem" : "Escolher imagem"}
            </Button>
            {url && !enviando && (
              <Button type="button" variant="ghost" size="lg" className="rounded-full text-taupe" onClick={() => setUrl("")}>
                <Trash2 className="size-4" aria-hidden="true" /> Remover
              </Button>
            )}
          </div>
          {/* Anuncia o fim do envio a quem não vê a miniatura aparecer. */}
          <p className="sr-only" aria-live="polite">
            {enviando ? "Enviando imagem" : ""}
          </p>
        </div>
      )}
    </Moldura>
  );
}

export function CampoGaleria({
  padrao,
  descricaoAlt,
  maximo = 12,
  ...base
}: Base & { padrao?: string[]; descricaoAlt: string; maximo?: number }) {
  const [urls, setUrls] = useState<string[]>(padrao ?? []);
  const { enviando, setEnviando, erro, setErro } = useEnvio();
  const entrada = useRef<HTMLInputElement>(null);
  const idLista = useId();
  const cheia = urls.length >= maximo;

  return (
    <Moldura {...base} erros={erro ? [erro] : base.erros} ajuda={base.ajuda ?? `Até ${maximo} fotos.`}>
      {({ id, descricao, invalido }) => (
        <div className="space-y-3">
          {urls.map((u) => (
            <input key={u} type="hidden" name={base.nome} value={u} />
          ))}
          {urls.length > 0 && (
            <ul id={idLista} className="flex flex-wrap gap-3">
              {urls.map((u, i) => (
                <li key={u} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload */}
                  <img src={u} alt={`${descricaoAlt}, foto ${i + 1}`} className="size-24 rounded-xl border border-border object-cover" />
                  <button
                    type="button"
                    onClick={() => setUrls((atual) => atual.filter((x) => x !== u))}
                    className="absolute -top-2 -right-2 rounded-full bg-bone p-1 text-destructive shadow ring-1 ring-border hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label={`Remover foto ${i + 1}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            ref={entrada}
            id={id}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            aria-invalid={invalido || undefined}
            aria-describedby={descricao}
            disabled={enviando || cheia}
            className="sr-only"
            onChange={async (e) => {
              const arquivos = Array.from(e.target.files ?? []).slice(0, maximo - urls.length);
              e.target.value = "";
              if (arquivos.length === 0) return;
              setErro(null);
              setEnviando(true);
              try {
                // Um por vez: cada envio fica bem abaixo do limite de tamanho, e
                // uma foto ruim não derruba as outras que já subiram.
                for (const arquivo of arquivos) {
                  const url = await enviarArquivo(arquivo);
                  setUrls((atual) => [...atual, url]);
                }
              } catch (falha) {
                setErro((falha as Error).message);
              } finally {
                setEnviando(false);
              }
            }}
          />
          <Button type="button" variant="outline" size="lg" className="rounded-full" disabled={enviando || cheia} onClick={() => entrada.current?.click()}>
            {enviando ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
            {enviando ? "Enviando..." : cheia ? "Galeria cheia" : "Adicionar fotos"}
          </Button>
          <p className="sr-only" aria-live="polite">
            {enviando ? "Enviando fotos" : `${urls.length} fotos na galeria`}
          </p>
        </div>
      )}
    </Moldura>
  );
}

export function BotaoSalvar({ rotulo = "Salvar" }: { rotulo?: string }) {
  // `useFormStatus` lê o estado do <form> pai: o botão sabe que o envio está
  // em andamento sem ninguém precisar passar isso por prop.
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-10 rounded-full px-5">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
      {pending ? "Salvando..." : rotulo}
    </Button>
  );
}

export function ErroGeral({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-[0.875rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {texto}
    </p>
  );
}
