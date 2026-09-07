import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { Problema } from "@/components/sections/problema";
import { Solucao } from "@/components/sections/solucao";
import { Animais } from "@/components/sections/animais";
import { ComoAjudar } from "@/components/sections/como-ajudar";
import { Sobre } from "@/components/sections/sobre";
import { CtaContato } from "@/components/sections/cta-contato";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      {/* Alvo do "Pular para o conteudo" do layout. `tabIndex={-1}` deixa o
          <main> receber foco programaticamente: sem isso, alguns navegadores
          rolam ate a ancora mas mantem o foco no link, e o proximo Tab volta
          para o menu — o pulo nao acontece de verdade. */}
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <Problema />
        <Solucao />
        <Animais />
        <ComoAjudar />
        <Sobre />
        <CtaContato />
      </main>
      <SiteFooter />
    </div>
  );
}
