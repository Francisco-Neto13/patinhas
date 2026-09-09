import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import {
  ProvedorAcessibilidade,
  SCRIPT_SEM_FLASH,
} from "@/components/acessibilidade/preferencias";
import { BarraAcessibilidade } from "@/components/acessibilidade/barra-acessibilidade";
import { VLibras } from "@/components/acessibilidade/vlibras";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Patinhas",
  description:
    "Patinhas conecta abrigos, voluntários, doadores e adotantes para reduzir a falta de recursos e a sobrecarga dos abrigos de animais.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/*
          ⚠️ Primeiro elemento do <body>, e tem de continuar sendo.

          Ele aplica a preferencia de contraste/fonte salva ANTES do navegador
          pintar qualquer coisa. Empurrado para baixo, ou trocado por um
          useEffect, a pagina acende em creme e so depois vira preta, a cada
          navegacao. Para quem ligou alto contraste por sensibilidade a luz,
          esse flash e o problema, nao um detalhe.
        */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_SEM_FLASH }} />

        {/*
          Primeiro elemento focavel da pagina, de proposito.

          Fica fora da tela ate receber foco pelo teclado, e ai aparece. Sem
          ele, quem navega por Tab passa pelo logo, pelos 6 links do menu e
          pelo CTA em TODA visita. E, para chegar ao formulario de contato,
          ainda atravessa os 17 links dos cards de plataforma.

          `accessKey="1"` e o atalho que o eMAG padroniza para "ir ao
          conteudo" nos sites brasileiros.
        */}
        <a
          href="#conteudo"
          accessKey="1"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-3 focus:ring-ring/50"
        >
          Pular para o conteudo principal
        </a>

        {/*
          ⚠️ Sem JavaScript, o site fica quase em branco.

          O scroll reveal do Framer Motion serve 39 elementos em `opacity:0` e
          conta com o JS para revela-los. Se ele nao rodar, o conteudo esta no
          HTML mas invisivel. Esta regra so vale quando nao ha JS, entao ela
          nao interfere na animacao de quem tem.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>

        <ProvedorAcessibilidade>
          {children}
          <BarraAcessibilidade />
        </ProvedorAcessibilidade>

        {/* Fora do provider: o widget monta a propria interface em shadow DOM e
            nao le nenhuma das nossas preferencias. */}
        <VLibras />
      </body>
    </html>
  );
}
