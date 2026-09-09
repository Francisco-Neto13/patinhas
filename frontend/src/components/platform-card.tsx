"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, PawPrint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PawPrintScatter } from "@/components/decorative/blob";

export type Platform = {
  name: string;
  url: string;
  logo?: string;
  heroImage?: string;
  highlight: string;
  description: string;
};

export function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <motion.a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      /*
       * ⚠️ Sem este rotulo, o nome acessivel deste link tem 394 caracteres.
       *
       * O card inteiro e um <a>, entao o leitor de tela junta tudo que esta
       * dentro dele (selo, nome, o paragrafo completo e "Visitar site") e
       * anuncia esse bloco como se fosse o NOME do link. Pior: comeca pelo
       * selo, entao na lista de links do leitor os 17 cards aparecem como
       * "+279 mil animais ajudados", nao como "Adotar.com.br".
       *
       * O `aria-label` substitui esse nome por algo que se ouve de uma vez. O
       * conteudo do card continua todo legivel na leitura normal da pagina.
       */
      aria-label={`${platform.name}, abre o site em nova aba`}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="pulse-on-hover group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-bone shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gradient-to-br from-terracotta/25 via-beige to-brown/15 sm:h-48">
        {platform.heroImage ? (
          <Image
            src={platform.heroImage}
            // Mesma razao do logo: ilustra o card, nao acrescenta informacao.
            alt=""
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            data-imagem-decorativa=""
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PawPrintScatter className="size-24 text-brown/20 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <span
            data-selo-plataforma=""
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-cream transition-transform duration-300 group-hover:scale-110"
          >
            {platform.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={platform.logo}
                // Decorativo: o nome ja vem no aria-label do link e no <h3>
                // logo abaixo. Com texto aqui, o leitor anunciaria a marca
                // tres vezes seguidas no mesmo card.
                alt=""
                className="size-8 object-contain"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <PawPrint className="size-6 text-terracotta-text" />
            )}
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {platform.highlight}
          </span>
        </div>

        <h3 className="mt-4 font-heading text-xl font-semibold text-brown-dark">
          {platform.name}
        </h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-taupe">
          {platform.description}
        </p>

        <span
          className={buttonVariants({
            variant: "outline",
            className: "pointer-events-none mt-6 w-full rounded-full group-hover:border-terracotta/40 group-hover:bg-terracotta/10",
          })}
        >
          Visitar site <ExternalLink className="size-4" />
        </span>
      </div>
    </motion.a>
  );
}
