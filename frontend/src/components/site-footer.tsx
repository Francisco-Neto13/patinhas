import { AtSign, Mail, MapPin, MessageCircle, Phone, ThumbsUp } from "lucide-react";
import { LogoMarca } from "@/components/logo-marca";
import type { Textos } from "@/lib/conteudo/ler";
import type { DadosPublicos } from "@/lib/publico/dados";

/** Nome, logo, texto e canais vêm do painel (Conteúdo e Configurações). */
export function SiteFooter({
  textos: t,
  parceira,
}: {
  textos: Textos;
  /** A ONG parceira, quando há exatamente uma publicada. */
  parceira?: Pick<DadosPublicos["organizacoes"][number], "nome" | "cidade" | "estado"> | null;
}) {
  const nome = t["config.nome"];
  const canais = [
    t["config.email"] && { href: `mailto:${t["config.email"]}`, rotulo: t["config.email"], Icone: Mail, externo: false },
    t["config.telefone"] && { href: `tel:${t["config.telefone"].replace(/\D/g, "")}`, rotulo: t["config.telefone"], Icone: Phone, externo: false },
    t["config.whatsapp"] && { href: t["config.whatsapp"], rotulo: "WhatsApp", Icone: MessageCircle, externo: true },
    t["config.instagram"] && { href: t["config.instagram"], rotulo: "Instagram", Icone: AtSign, externo: true },
    t["config.facebook"] && { href: t["config.facebook"], rotulo: "Facebook", Icone: ThumbsUp, externo: true },
  ].filter(Boolean) as { href: string; rotulo: string; Icone: typeof Mail; externo: boolean }[];

  return (
    <footer className="border-t border-border bg-brown-dark py-10 text-bone/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold text-bone">
          <LogoMarca url={t["config.logo"]} tamanho={28} className="size-7" />
          {nome}
        </span>
        <p className="max-w-md text-sm">{t["rodape.texto"]}</p>

        {canais.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {canais.map(({ href, rotulo, Icone, externo }) => (
              <li key={href}>
                <a
                  href={href}
                  {...(externo && { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex items-center gap-1.5 text-bone/80 underline-offset-4 hover:text-bone hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icone className="size-4" aria-hidden="true" /> {rotulo}
                  {externo && <span className="sr-only"> (abre em nova aba)</span>}
                </a>
              </li>
            ))}
          </ul>
        )}

        {parceira && (
          <p className="flex items-center gap-2 text-xs text-bone/70">
            <MapPin className="size-3.5" aria-hidden="true" /> Em parceria com {parceira.nome}, {parceira.cidade}/{parceira.estado}
          </p>
        )}
        <p className="text-xs text-bone/50">
          © {new Date().getFullYear()} {nome}. Feito com carinho por quem ama patinhas.
        </p>
      </div>
    </footer>
  );
}
