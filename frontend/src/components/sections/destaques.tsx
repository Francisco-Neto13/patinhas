import { ArrowRight, CalendarClock, Megaphone, PawPrint } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { AnimalDeFundo, type Animal } from "@/components/decorative/animal-de-fundo";
import { BotaoCompartilhar } from "@/components/publico/botao-compartilhar";
import { diasAte } from "@/lib/datas";
import type { DadosPublicos } from "@/lib/publico/dados";
import { cn } from "@/lib/utils";

type Banner = DadosPublicos["banners"][number];

/**
 * Campanhas e destaques (seção 8 do ADMINISTRACAO.MD).
 *
 * Desenho a partir dos padrões de páginas de arrecadação:
 *
 * - **Foto grande**, porque é a foto que faz alguém parar. Sem foto, um painel
 *   na cor da marca com um bichinho, nunca um cartão branco vazio.
 * - **Urgência honesta**: "faltam 3 dias" só aparece quando a campanha tem
 *   data de término de verdade. Nada de contagem regressiva inventada.
 * - **Uma ação clara** e, ao lado, **Compartilhar**: a área existe para
 *   divulgar, e quem não pode doar agora quase sempre pode repassar.
 *
 * A primeira campanha ganha destaque; as outras (até duas) vêm menores, lado
 * a lado. Sem campanha no ar, a seção não existe.
 */
export function Destaques({ banners }: { banners: DadosPublicos["banners"] }) {
  if (banners.length === 0) return null;
  const [principal, ...outras] = banners;

  return (
    <section aria-labelledby="destaques-titulo" className="relative pt-4 pb-12 sm:pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-terracotta-text uppercase">
              <Megaphone className="size-3.5" aria-hidden="true" /> Campanhas
            </p>
            <h2 id="destaques-titulo" className="mt-1 font-heading text-2xl font-semibold text-brown-dark sm:text-3xl">
              Acontecendo agora
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <CampanhaPrincipal banner={principal} />
        </Reveal>

        {outras.length > 0 && (
          <div className={cn("mt-6 grid gap-6", outras.length > 1 && "md:grid-cols-2")}>
            {outras.map((b, i) => (
              <Reveal key={b.id} delay={0.08 * (i + 1)} className="h-full">
                <CampanhaSecundaria banner={b} animal={i === 0 ? "gato" : "coelho"} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Prazo({ fim, className }: { fim: Date | null; className?: string }) {
  if (!fim) return null;
  const dias = diasAte(fim);
  const texto = dias === 0 ? "Termina hoje" : dias === 1 ? "Termina amanhã" : `Faltam ${dias} dias`;
  const data = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" }).format(fim);
  const perto = dias <= 7;
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        // Terracota escura: o texto claro sobre a terracota clara ficaria em 3:1.
        perto ? "bg-terracotta-text text-bone" : "bg-muted text-brown-dark",
        className,
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden="true" />
      {texto}
      <span className={perto ? "text-bone/85" : "text-taupe"}>· até {data}</span>
    </p>
  );
}

function Selo({ banner }: { banner: Banner }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-bone/95 px-3 py-1 text-xs font-semibold text-brown-dark shadow-sm">
      <PawPrint className="size-3.5 text-terracotta-text" aria-hidden="true" />
      {/* Só o nome: "Campanha da" erraria o gênero de "Instituto Fulano". */}
      {banner.organizacao ? banner.organizacao.nome : "Equipe Patinhas"}
    </span>
  );
}

/** Foto da campanha, ou o painel da marca quando não há foto. */
function Midia({ banner, animal, className }: { banner: Banner; animal: Animal; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {banner.imagemUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
        <img src={banner.imagemUrl} alt="" data-imagem-decorativa="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta via-terracotta/85 to-brown" aria-hidden="true">
          {/* Patinhas espalhadas: textura da marca, sem imagem para baixar. */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, var(--bone) 0 6px, transparent 7px), radial-gradient(circle at 70% 65%, var(--bone) 0 5px, transparent 6px)",
              backgroundSize: "90px 90px",
            }}
          />
          <AnimalDeFundo animal={animal} className="-right-6 -bottom-8 size-56 text-bone/25 sm:size-72" />
        </div>
      )}
      <div className="absolute top-4 left-4">
        <Selo banner={banner} />
      </div>
    </div>
  );
}

function BotaoAcao({ banner, className }: { banner: Banner; className?: string }) {
  if (!banner.link || !banner.textoBotao) return null;
  const externo = banner.link.startsWith("http");
  return (
    <a
      href={banner.link}
      {...(externo && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {banner.textoBotao} <ArrowRight className="size-4" aria-hidden="true" />
      {externo && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  );
}

function CampanhaPrincipal({ banner }: { banner: Banner }) {
  return (
    <article
      id={`campanha-${banner.id}`}
      className="grid scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-border bg-bone shadow-md lg:grid-cols-[1.1fr_1fr]"
    >
      <Midia banner={banner} animal="cachorro" className="aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]" />
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <Prazo fim={banner.fimEm} className="mb-4 w-fit" />
        <h3 className="font-heading text-3xl leading-tight font-semibold text-brown-dark sm:text-4xl">{banner.titulo}</h3>
        {banner.descricao && <p className="mt-4 text-base leading-relaxed text-taupe">{banner.descricao}</p>}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <BotaoAcao banner={banner} />
          <BotaoCompartilhar titulo={banner.titulo} texto={banner.descricao} ancora={`campanha-${banner.id}`} />
        </div>
      </div>
    </article>
  );
}

function CampanhaSecundaria({ banner, animal }: { banner: Banner; animal: Animal }) {
  return (
    <article
      id={`campanha-${banner.id}`}
      className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[1.5rem] border border-border bg-bone shadow-sm sm:flex-row"
    >
      <Midia banner={banner} animal={animal} className="aspect-[16/9] sm:aspect-auto sm:w-2/5 sm:min-h-56" />
      <div className="flex flex-1 flex-col p-6">
        <Prazo fim={banner.fimEm} className="mb-3 w-fit" />
        <h3 className="font-heading text-xl leading-snug font-semibold text-brown-dark">{banner.titulo}</h3>
        {banner.descricao && <p className="mt-2 line-clamp-3 text-sm text-taupe">{banner.descricao}</p>}
        <div className="mt-auto flex items-center gap-2 pt-5">
          <BotaoAcao banner={banner} className="px-5 py-2" />
          <BotaoCompartilhar titulo={banner.titulo} texto={banner.descricao} ancora={`campanha-${banner.id}`} compacto />
        </div>
      </div>
    </article>
  );
}
