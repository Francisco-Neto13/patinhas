/*
 * Nome do site, e-mail, WhatsApp e redes sociais NÃO moram aqui: são editados
 * no painel (Configurações) e lidos de src/lib/conteudo. Este arquivo guarda
 * só a estrutura do site (o menu).
 *
 * As plataformas externas de adoção e doação saíram quando a parceria com a
 * ONG foi fechada: o site passou a apontar para ela, não para terceiros.
 */
export const siteConfig = {
  nav: [
    { label: "O problema", href: "#problema" },
    { label: "Nossa solução", href: "#solucao" },
    { label: "A ONG", href: "#ong" },
    { label: "Animais", href: "#animais" },
    { label: "Como ajudar", href: "#ajudar" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],
};
