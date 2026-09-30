import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { VitrinePets } from "@/components/sections/vitrine-pets";
import { Problema } from "@/components/sections/problema";
import { Solucao } from "@/components/sections/solucao";
import { Animais } from "@/components/sections/animais";
import { ComoAjudar } from "@/components/sections/como-ajudar";
import { Sobre } from "@/components/sections/sobre";
import { CtaContato } from "@/components/sections/cta-contato";
import { Destaques } from "@/components/sections/destaques";
import { OngParceira } from "@/components/sections/ong-parceira";
import { obterDadosPublicos } from "@/lib/publico/dados";
import { obterTextos } from "@/lib/conteudo/ler";

export default async function Home() {
  // O que o painel administrativo publicou. Se o banco estiver fora, vem
  // vazio e o site mostra só o conteúdo fixo (ver obterDadosPublicos).
  const [{ animais, necessidades, organizacoes, banners, perguntas, numeros }, textos] = await Promise.all([
    obterDadosPublicos(),
    obterTextos(),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader nome={textos["config.nome"]} logoUrl={textos["config.logo"] || undefined} temOng={organizacoes.length > 0} />
      {/* Alvo do "Pular para o conteudo" do layout. `tabIndex={-1}` deixa o
          <main> receber foco programaticamente: sem isso, alguns navegadores
          rolam ate a ancora mas mantem o foco no link, e o proximo Tab volta
          para o menu, e o pulo nao acontece de verdade. */}
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <Hero textos={textos} />
        <Destaques banners={banners} />
        {/* Logo depois do hero, e longe da secao de adocao de proposito: uma
            fita de fotos encostada em "Animais para adocao" seria lida como o
            catalogo do abrigo, que e exatamente o que o CONTEXTO.MD proibe. */}
        <VitrinePets titulo={textos["vitrine.titulo"]} />
        <Problema textos={textos} />
        <Solucao textos={textos} />
        {/* A ONG parceira antes dos animais e dos pedidos: primeiro quem
            cuida, depois o que ela cuida e do que precisa. */}
        <OngParceira organizacoes={organizacoes} animais={animais} necessidades={necessidades} />
        <Animais animais={animais} organizacoes={organizacoes} />
        <ComoAjudar necessidades={necessidades} organizacoes={organizacoes} />
        <Sobre textos={textos} numeros={numeros} />
        <CtaContato
          titulo={textos["contato.titulo"]}
          intro={textos["contato.intro"]}
          email={textos["config.email"]}
          whatsapp={textos["config.whatsapp"]}
          perguntas={perguntas}
        />
      </main>
      <SiteFooter textos={textos} parceira={organizacoes.length === 1 ? organizacoes[0] : null} />
    </div>
  );
}
