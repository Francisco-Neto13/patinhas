/**
 * "Pular para o conteúdo": primeiro elemento focável da página, invisível até
 * receber foco pelo teclado.
 *
 * Usado no painel e no login. O site público não precisa dele: lá a barra de
 * acessibilidade do topo já mostra o mesmo atalho, visível, e dois links
 * iguais seguidos seriam dois Tabs para o mesmo lugar.
 *
 * `accessKey="1"` é o atalho que o eMAG padroniza para "ir ao conteúdo".
 */
export function LinkPularConteudo() {
  return (
    <a
      href="#conteudo"
      accessKey="1"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:ring-3 focus:ring-ring/50 focus:outline-none"
    >
      Pular para o conteúdo principal
    </a>
  );
}
