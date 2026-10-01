import { ExternalLink, HandCoins, MapPin, PawPrint, Siren } from "lucide-react";
import type { DadosPublicos } from "@/server/dados/publico";
import { nomeDoAnimal, temNome, PORTE, SEXO, TIPO_FORMA_DOACAO, TIPO_NECESSIDADE } from "@/lib/admin/rotulos";
import { PixOrganizacao } from "@/components/publico/pix-organizacao";
import { cn } from "@/lib/utils";

type AnimalPublico = DadosPublicos["animais"][number];
type NecessidadePublica = DadosPublicos["necessidades"][number];
type OrganizacaoPublica = DadosPublicos["organizacoes"][number];

/** Primeiro canal de contato que a organização tiver, na ordem de preferência. */
function contatoDe(org: { whatsapp: string | null; site: string | null; instagram: string | null }) {
  return org.whatsapp ?? org.site ?? org.instagram;
}

const classeBotao =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Link para fora do site: nova aba, `noopener`, e aviso para leitor de tela. */
function LinkExterno({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

/**
 * `mostrarOrganizacao`: com uma ONG parceira só, repetir o nome dela em todo
 * cartão é ruído. Volta a aparecer se houver mais de uma.
 */
export function CartaoAnimal({ animal, mostrarOrganizacao = false }: { animal: AnimalPublico; mostrarOrganizacao?: boolean }) {
  const resumo = [SEXO[animal.sexo].rotulo, animal.idade, animal.porte && PORTE[animal.porte].rotulo]
    .filter((x) => x && x !== "Não informado")
    .join(" • ");
  const destino = animal.linkAdocao ?? contatoDe(animal.organizacao);

  return (
    // Mesmo hover dos cards de "O problema" e "Solução": sobe, ganha sombra e
    // pulsa. A foto aproxima de leve, como na vitrine.
    <article className="pulse-on-hover group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-bone shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-terracotta/20 via-beige to-brown/10">
        {animal.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
          <img src={animal.fotoUrl} alt={temNome(animal.nome) ? `Foto de ${animal.nome}` : "Foto do animal"} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" data-imagem-decorativa="" />
        ) : (
          <div className="flex size-full items-center justify-center" aria-hidden="true">
            <PawPrint className="size-16 text-brown/25" />
          </div>
        )}
        {animal.status === "EM_ADOCAO" && (
          <span className="absolute top-3 left-3 rounded-full bg-bone/95 px-3 py-1 text-xs font-semibold text-brown-dark shadow">
            Em processo de adoção
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-brown-dark">{nomeDoAnimal(animal.nome)}</h3>
        {resumo && <p className="mt-1 text-sm text-taupe">{resumo}</p>}
        {animal.descricao && <p className="mt-3 line-clamp-3 text-sm text-taupe">{animal.descricao}</p>}
        {mostrarOrganizacao && (
          <p className="mt-3 text-sm text-brown-dark">
            <span className="text-taupe">ONG responsável:</span> {animal.organizacao.nome}
          </p>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-taupe">
          <MapPin className="size-3.5" aria-hidden="true" />
          {animal.cidade ?? `${animal.organizacao.cidade}/${animal.organizacao.estado}`}
        </p>
        <div className="mt-auto pt-5">
          {destino ? (
            <LinkExterno href={destino} className={classeBotao}>
              {temNome(animal.nome) ? `Quero adotar ${animal.nome}` : "Quero adotar"} <ExternalLink className="size-4" aria-hidden="true" />
            </LinkExterno>
          ) : (
            <p className="text-sm text-taupe">Fale com {animal.organizacao.nome} pelos canais da ONG.</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function CartaoNecessidade({ necessidade: n, mostrarOrganizacao = false }: { necessidade: NecessidadePublica; mostrarOrganizacao?: boolean }) {
  const destino = n.linkAjuda ?? n.organizacao.linkDoacao ?? contatoDe(n.organizacao);
  const urgente = n.prioridade === "URGENTE";

  return (
    <article className={cn("pulse-on-hover flex h-full flex-col rounded-[1.5rem] border bg-bone p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md", urgente ? "border-terracotta/50" : "border-border")}>
      <div className="flex flex-wrap items-center gap-2">
        {urgente && (
          <span className="inline-flex items-center gap-1 rounded-full bg-terracotta/20 px-2.5 py-0.5 text-xs font-semibold text-brown-dark">
            <Siren className="size-3.5" aria-hidden="true" /> Urgente
          </span>
        )}
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-brown-dark">{TIPO_NECESSIDADE[n.tipo].rotulo}</span>
      </div>
      <h3 className="mt-3 font-heading text-lg font-semibold text-brown-dark">{n.item}</h3>
      {n.quantidade && (
        <p className="mt-1 text-sm text-brown-dark">
          <span className="text-taupe">Precisa de:</span> {n.quantidade} {n.unidade}
        </p>
      )}
      {n.descricao && <p className="mt-2 line-clamp-3 text-sm text-taupe">{n.descricao}</p>}
      {mostrarOrganizacao && (
        <p className="mt-3 text-xs text-taupe">
          {n.organizacao.nome} · {n.organizacao.cidade}/{n.organizacao.estado}
        </p>
      )}
      {destino && (
        <div className="mt-auto pt-4">
          <LinkExterno href={destino} className={classeBotao}>
            Como ajudar <ExternalLink className="size-4" aria-hidden="true" />
          </LinkExterno>
        </div>
      )}
    </article>
  );
}

/**
 * "Doe direto": PIX (QR e copia e cola), link de doação e as formas de doação
 * cadastradas. Tudo vai para a organização; o Patinhas não recebe nada.
 */
export function PainelDoacao({ organizacao: o, mostrarNome = false }: { organizacao: OrganizacaoPublica; mostrarNome?: boolean }) {
  const temAlgo = o.chavePix || o.linkDoacao || o.formasDoacao.length > 0;
  return (
    <div className="rounded-[1.5rem] border border-border bg-bone p-6 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-terracotta-text uppercase">
        <HandCoins className="size-4" aria-hidden="true" /> Doe direto
      </p>
      <h3 className="mt-2 font-heading text-xl font-semibold text-brown-dark">
        {mostrarNome ? o.nome : "Direto para a ONG, sem intermediário"}
      </h3>

      {!temAlgo && (
        <p className="mt-3 text-sm text-taupe">A organização ainda não cadastrou formas de doação. Fale com ela pelos canais acima.</p>
      )}

      {o.chavePix && (
        <div className="mt-5">
          <PixOrganizacao chave={o.chavePix} nome={o.nome} cidade={o.cidade} />
        </div>
      )}

      {o.linkDoacao && (
        <LinkExterno href={o.linkDoacao} className={cn(classeBotao, "mt-4")}>
          Doar pelo site da ONG <ExternalLink className="size-4" aria-hidden="true" />
        </LinkExterno>
      )}

      {o.formasDoacao.length > 0 && (
        // Formas de doação da seção 5.1: cada uma diz COMO ajudar, e leva
        // para fora quando tem link.
        <ul className="mt-5 space-y-2.5">
          {o.formasDoacao.map((f) => (
            <li key={f.id} className="rounded-[1rem] border border-border px-4 py-3">
              <p className="text-xs font-semibold text-terracotta-text">{TIPO_FORMA_DOACAO[f.tipo].rotulo}</p>
              {f.link ? (
                <LinkExterno href={f.link} className="inline-flex items-center gap-1 text-sm font-semibold text-brown-dark underline-offset-4 hover:underline">
                  {f.titulo} <ExternalLink className="size-3.5" aria-hidden="true" />
                </LinkExterno>
              ) : (
                <p className="text-sm font-semibold text-brown-dark">{f.titulo}</p>
              )}
              {f.descricao && <p className="mt-0.5 text-xs text-taupe">{f.descricao}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
