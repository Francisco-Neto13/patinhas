import Script from "next/script";

/**
 * Tradutor de português para Libras, do governo federal.
 *
 * Libras é língua própria, com gramática própria — não é português sinalizado.
 * Para parte da comunidade surda ela é a primeira língua e o português escrito é
 * a segunda, então legenda e texto simples não resolvem sozinhos. É por isso que
 * isto não é redundante com o resto da acessibilidade da página.
 *
 * ⚠️ QUASE TODO TUTORIAL DE VLIBRAS NA INTERNET ESTÁ DESATUALIZADO.
 *
 * Eles mandam colar um bloco assim antes do script:
 *
 *     <div vw class="enabled">
 *       <div vw-access-button class="active"></div>
 *       <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>
 *     </div>
 *
 * Isso é da versão 5/6. Na 7.9.1 — que é o que `vlibras-plugin.js` serve hoje —
 * o script não procura por nenhum desses atributos: ele mesmo cria um
 * `<div id="vlibras-access-wrapper">`, anexa ao `<body>` e monta a interface
 * dentro de um **shadow root**. Copiar o markup antigo só deixa três divs
 * mortas no HTML.
 *
 * O shadow DOM é uma boa notícia: o CSS do widget fica isolado, então ele não
 * briga com o Tailwind e nosso `data-contraste` não vaza para dentro dele.
 *
 * Custo real: o arquivo abaixo tem **2 KB**. Ele só desenha o botão flutuante;
 * o avatar 3D (`vlibras-plugin-app.js`, o pesado) só é baixado quando alguém
 * clica. Quem não usa não paga — e por isso não faz sentido esconder o widget
 * atrás de um "carregar sob demanda" nosso.
 */
export function VLibras() {
  return (
    <Script
      src="https://vlibras.gov.br/app/vlibras-plugin.js"
      /*
       * `afterInteractive` e não `lazyOnload`.
       *
       * São 2 KB: adiar não ganha praticamente nada em desempenho, e atrasaria
       * o aparecimento do botão para exatamente quem veio atrás dele. Numa
       * ferramenta de acessibilidade, estar disponível vale mais que o
       * milissegundo economizado.
       *
       * Nada é configurado aqui de propósito. O script auto-inicializa ~50ms
       * depois de carregar, e um `new window.VLibras.Widget({...})` que chegue
       * depois disso é ignorado em silêncio — a chamada teria de vencer uma
       * corrida com esse timer. Os padrões (avatar Ícaro, botão à direita)
       * atendem, então não vale correr atrás de um bug intermitente.
       */
      strategy="afterInteractive"
    />
  );
}
