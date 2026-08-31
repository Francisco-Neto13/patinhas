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
      <main className="flex-1">
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
