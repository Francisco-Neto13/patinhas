import { AtSign, Globe, HeartHandshake, MapPin, MessageCircle, PawPrint, ThumbsUp } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";
import { TIPO_ORGANIZACAO } from "@/lib/admin/rotulos";
import type { DadosPublicos } from "@/server/dados/publico";

type Organizacao = DadosPublicos["organizacoes"][number];

/**
 * A ONG parceira, apresentada como NOSSA: quem ela é, onde fica, fotos e
 * como falar com ela. Tudo vem do cadastro dela no painel.
 *
 * Pensada para uma organização (a parceria de hoje). Se um dia houver mais
 * de uma publicada, cada uma ganha o seu bloco, na mesma ordem do painel.
 * Sem nenhuma publicada, a seção não existe.
 */
export function OngParceira({
  organizacoes,
  animais,
  necessidades,
}: {
  organizacoes: DadosPublicos["organizacoes"];
  animais: DadosPublicos["animais"];
  necessidades: DadosPublicos["necessidades"];
}) {
  if (organizacoes.length === 0) return null;

  return (
    <section id="ong" className="relative scroll-mt-16 overflow-hidden bg-beige/60 py-20 sm:py-28">
      <AnimalDeFundo animal="cachorro" className="-left-16 bottom-10 size-64 text-brown/[0.08] lg:size-80" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.18em] text-terracotta-text uppercase">
            <HeartHandshake className="size-4" aria-hidden="true" />
            {organizacoes.length === 1 ? "Nossa ONG parceira" : "Nossas ONGs parceiras"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-brown-dark sm:text-4xl">Conheça quem cuida deles</h2>
          <p className="mt-4 text-taupe">
            Todo animal, pedido e doação deste site é de quem está no dia a dia do resgate. O Patinhas só aproxima você de quem faz.
          </p>
        </Reveal>

        <div className="mt-14 space-y-20">
          {organizacoes.map((o) => (
            <BlocoOrganizacao
              key={o.id}
              organizacao={o}
              animais={animais.filter((a) => a.organizacao.id === o.id).length}
              pedidos={necessidades.filter((n) => n.organizacao.id === o.id).length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlocoOrganizacao({ organizacao: o, animais, pedidos }: { organizacao: Organizacao; animais: number; pedidos: number }) {
  const fotos = o.galeria.slice(0, 3);
  const canais = [
    o.whatsapp && { href: o.whatsapp, rotulo: "WhatsApp", Icone: MessageCircle },
    o.instagram && { href: o.instagram, rotulo: "Instagram", Icone: AtSign },
    o.facebook && { href: o.facebook, rotulo: "Facebook", Icone: ThumbsUp },
    o.site && { href: o.site, rotulo: "Site", Icone: Globe },
  ].filter(Boolean) as { href: string; rotulo: string; Icone: typeof Globe }[];

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14" aria-labelledby={`ong-${o.id}`}>
      <Reveal>
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-terracotta via-terracotta/85 to-brown shadow-md">
            {o.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
              <img src={o.capaUrl} alt={`Foto de ${o.nome}`} className="size-full object-cover" data-imagem-decorativa="" />
            ) : (
              <div className="flex size-full items-center justify-center" aria-hidden="true">
                <PawPrint className="size-24 text-bone/40" />
              </div>
            )}
          </div>
          {fotos.length > 0 && (
            <ul className="grid grid-cols-3 gap-3" aria-label={`Mais fotos de ${o.nome}`}>
              {fotos.map((f, i) => (
                <li key={f} className="aspect-square overflow-hidden rounded-[1.1rem] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload */}
                  <img src={f} alt={`${o.nome}, foto ${i + 1}`} loading="lazy" className="size-full object-cover" data-imagem-decorativa="" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-xs font-semibold tracking-[0.18em] text-terracotta-text uppercase">{TIPO_ORGANIZACAO[o.tipo].rotulo}</p>
        <h3 id={`ong-${o.id}`} className="mt-2 font-heading text-3xl font-semibold text-brown-dark sm:text-4xl">{o.nome}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-taupe">
          <MapPin className="size-4" aria-hidden="true" /> {o.cidade}/{o.estado}
        </p>
        <p className="mt-5 text-lg leading-relaxed text-brown-dark">{o.descricaoCurta}</p>
        {o.descricaoCompleta && <p className="mt-4 leading-relaxed whitespace-pre-line text-taupe">{o.descricaoCompleta}</p>}

        {(animais > 0 || pedidos > 0) && (
          <dl className="mt-7 grid max-w-sm grid-cols-2 gap-3">
            <div className="flex flex-col-reverse rounded-[1rem] bg-bone p-4 shadow-sm ring-1 ring-border">
              <dt className="text-sm text-taupe">para adoção agora</dt>
              <dd className="font-heading text-3xl font-semibold text-brown-dark">{animais}</dd>
            </div>
            <div className="flex flex-col-reverse rounded-[1rem] bg-bone p-4 shadow-sm ring-1 ring-border">
              <dt className="text-sm text-taupe">{pedidos === 1 ? "pedido de ajuda" : "pedidos de ajuda"}</dt>
              <dd className="font-heading text-3xl font-semibold text-brown-dark">{pedidos}</dd>
            </div>
          </dl>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#ajudar"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <HeartHandshake className="size-4" aria-hidden="true" /> Quero ajudar
          </a>
          {canais.map(({ href, rotulo, Icone }) => (
            <a
              key={rotulo}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-borda-forte bg-bone px-4 py-2.5 text-sm font-medium text-brown-dark hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Icone className="size-4" aria-hidden="true" /> {rotulo}
              <span className="sr-only"> de {o.nome} (abre em nova aba)</span>
            </a>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
