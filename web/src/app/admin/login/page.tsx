import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { obterSessao } from "@/server/auth/sessao";
import { obterTextos } from "@/server/dados/conteudo";
import { AnimalDeFundo } from "@/components/decorative/animal-de-fundo";
import { LinkPularConteudo } from "@/components/acessibilidade/link-pular-conteudo";
import { LogoMarca } from "@/components/logo-marca";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Entrar · Admin Patinhas",
  // O painel não tem o que fazer em resultado de busca.
  robots: { index: false, follow: false },
};

// Os três grupos de trabalho do painel (ver lib/admin/navegacao.ts), ditos
// para quem ainda não entrou: o que se faz lá dentro.
const PILARES = [
  { titulo: "Rede de proteção", texto: "ONGs, animais para adoção e o que cada abrigo precisa agora." },
  { titulo: "Arrecadação", texto: "Formas de doação, campanhas e o registro do que chegou." },
  { titulo: "Atendimento", texto: "As mensagens de quem escreveu pelo site." },
];

/*
 * Tela dividida, no mesmo desenho do login dos CRMs da casa: à esquerda a
 * marca, à direita o formulário. No celular o painel da marca some e o logo
 * sobe para cima do cartão.
 *
 * ⚠️ Cores só por token (brown-dark, cream, terracotta...). O alto contraste
 * troca os tokens, então o painel acompanha sem regra própria; os enfeites
 * (brilhos e bichinhos) somem nele, como no resto do site.
 */
export default async function PaginaLogin() {
  // Quem já está logado e abre /admin/login vai direto para o painel.
  if (await obterSessao()) redirect("/admin");

  const t = await obterTextos();
  const nome = t["config.nome"];
  const logo = t["config.logo"] || undefined;

  return (
    <>
    <LinkPularConteudo />
    <main id="conteudo" tabIndex={-1} className="grid min-h-screen outline-none lg:grid-cols-[1.1fr_1fr]">
      {/* ---- Painel da marca ------------------------------------------------ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brown-dark p-12 text-cream lg:flex">
        <div aria-hidden="true" data-animal-decorativo="" className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-terracotta/25 blur-3xl" />
        <div aria-hidden="true" data-animal-decorativo="" className="pointer-events-none absolute -bottom-16 right-0 size-80 rounded-full bg-cream/10 blur-3xl" />
        <AnimalDeFundo animal="gato" className="-right-16 -bottom-20 size-[26rem] rotate-12 text-cream opacity-[0.08]" />
        <AnimalDeFundo animal="cachorro" className="right-14 top-14 size-16 -rotate-12 text-terracotta opacity-70" />

        <p className="relative text-[11px] font-semibold tracking-[0.32em] text-cream/60 uppercase">Área administrativa</p>

        <div className="relative -mt-8 flex flex-col items-center text-center">
          <LogoMarca url={logo} tamanho={132} prioridade className="size-33 ring-4 ring-cream/15" />
          <p className="mt-6 font-heading text-4xl font-semibold text-cream">{nome}</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/70">
            O painel onde a equipe {nome} e as ONGs parceiras mantêm o site em dia: quem precisa de ajuda, como ajudar e
            quem está esperando um lar.
          </p>
        </div>

        <div className="relative space-y-6">
          <ul className="grid grid-cols-3 gap-6 border-t border-cream/15 pt-6">
            {PILARES.map((p) => (
              <li key={p.titulo} className="space-y-1">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cream uppercase">
                  <span className="size-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                  {p.titulo}
                </p>
                <p className="text-xs leading-relaxed text-cream/60">{p.texto}</p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-cream/50">© {new Date().getFullYear()} {nome}. Projeto de extensão universitária.</p>
        </div>
      </aside>

      {/* ---- Formulário ------------------------------------------------------ */}
      <section className="relative flex items-center justify-center overflow-hidden bg-cream px-4 py-12 sm:px-6">
        {/* No celular o painel some; o bichinho discreto segura o clima sozinho. */}
        <AnimalDeFundo animal="cachorro" className="-right-8 -bottom-8 size-40 -rotate-12 opacity-[0.07] lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMarca url={logo} tamanho={48} prioridade className="size-12" />
            <span className="font-heading text-2xl font-semibold text-brown-dark">{nome}</span>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-bone p-6 shadow-[0_12px_40px_-12px_rgb(61_43_31/0.25)] sm:p-8">
            <div className="mb-7 space-y-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-terracotta-text uppercase">Painel</p>
              <h1 className="font-heading text-3xl font-semibold text-brown-dark">
                Entre no <span className="text-terracotta-text">{nome}</span>
              </h1>
              <p className="text-sm text-taupe">Use a conta que a equipe {nome} criou para você.</p>
            </div>

            <FormularioLogin />

            <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

            <p className="text-center text-xs leading-relaxed text-taupe">
              Esqueceu a senha ou ainda não tem acesso? Fale com a equipe {nome}: as contas são criadas por ela.
            </p>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link href="/" className="inline-flex items-center gap-1.5 text-taupe underline-offset-4 hover:text-terracotta-text hover:underline">
              <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para o site
            </Link>
          </p>
        </div>
      </section>
    </main>
    </>
  );
}
