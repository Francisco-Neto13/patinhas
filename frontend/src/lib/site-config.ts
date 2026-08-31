export const siteConfig = {
  name: "Patinhas",
  tagline: "Tecnologia a serviço da proteção animal",
  nav: [
    { label: "O problema", href: "#problema" },
    { label: "Nossa solução", href: "#solucao" },
    { label: "Animais", href: "#animais" },
    { label: "Como ajudar", href: "#ajudar" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ],
  contact: {
    email: "contato@patinhas.exemplo.org",
    whatsapp: "https://wa.me/5500000000000",
  },
  // Sem abrigo parceiro confirmado ainda, então divulgamos redes de adoção
  // reais já estabelecidas no Brasil em vez de simular um catálogo próprio.
  // Apenas link de saída — nunca copiar fotos/nomes de animais de lá pro
  // nosso site (motivo: ver documentation/contexto/CONTEXTO.MD, seção
  // "Catálogo de adoção" — direitos autorais sobre as fotos).
  adoptionPlatforms: [
    {
      name: "Adotar.com.br",
      url: "https://adotar.com.br",
      logo: "/logos/adotar.png",
      highlight: "+279 mil animais ajudados",
      description:
        "O maior portal de adoção e doação de animais do Brasil, ativo desde 2009. Reúne cães e gatos disponíveis em praticamente todas as cidades do país, com busca por localização, e também ajuda a divulgar animais perdidos e achados. A comunidade em torno do projeto tem mais de 4 milhões de seguidores nas redes sociais engajados na causa animal.",
    },
    {
      name: "Adote Petz",
      url: "https://www.adotepetz.com.br",
      logo: "/logos/adote-petz.ico",
      highlight: "Maior rede de adoção do Brasil",
      description:
        "Programa de adoção da rede de lojas Petz, que cede espaço físico dentro das lojas para ONGs e protetores parceiros exibirem cães e gatos resgatados. Além da vitrine física, o site centraliza os perfis dos animais disponíveis por região, funcionando como ponte entre quem protege e quem quer adotar.",
    },
    {
      name: "UIPA — União Internacional Protetora dos Animais",
      url: "https://www.uipa.org.br/adocao/",
      logo: "/logos/uipa.png",
      highlight: "Desde 1895 · São Paulo",
      description:
        "Uma das organizações de proteção animal mais antigas do Brasil, fundada em 1895. Mantém um abrigo físico em São Paulo aberto à visitação para adoção presencial, com processo de entrevista e questionário para garantir responsabilidade do adotante. Todo animal disponível já passou por avaliação veterinária.",
    },
    {
      name: "Instituto Ampara Animal",
      url: "https://institutoamparanimal.org.br/adote/",
      logo: "/logos/ampara.svg",
      heroImage: "/logos/ampara-hero.jpg",
      highlight: "\"ONG-mãe\" há 15 anos",
      description:
        "Uma das maiores organizações de proteção animal do Brasil, atuando há 15 anos. Funciona como uma \"ONG-mãe\": além de cuidar de adoções próprias, repassa doações de ração e medicamentos e dá suporte a outras ONGs e protetores independentes. Todos os animais disponíveis para adoção já são castrados, vacinados e vermifugados.",
    },
    {
      name: "Adote Vi.Ca",
      url: "https://adotevica.com.br",
      logo: "/logos/vica.png",
      highlight: "~300 adoções por mês",
      description:
        "O maior centro de adoção fixo do Brasil. É uma empresa privada (não uma ONG) especializada em preparar cães e gatos resgatados por ONGs e protetores parceiros para adoção responsável, com espaço físico dedicado e uma estrutura pensada só para isso — cerca de 300 adoções acontecem por mês através do centro.",
    },
  ],
  // Pesquisa registrada em documentation/contexto/CONTEXTO.MD — plataformas
  // reais e verificadas, usadas aqui só como link de saída (redirecionamento).
  racaoPlatforms: [
    {
      name: "Petlove Doações",
      url: "https://www.petlove.com.br/doacoes",
      logo: "/logos/petlove.png",
      highlight: "Frete grátis por conta da Petlove",
      description:
        "Página do maior petshop online do Brasil dedicada exclusivamente a doações. Você escolhe uma ONG parceira reconhecida, seleciona os produtos que ela precisa naquele momento, faz o pagamento e a Petlove cobre o frete até a instituição — resolve toda a logística de entrega que normalmente afasta quem quer ajudar.",
    },
    {
      name: "PetsDoBem",
      url: "https://petsdobem.com.br",
      highlight: "10% de toda venda vai pra ONGs",
      description:
        "Marca de ração que embutiu a doação no próprio modelo de negócio: 10% de todo o volume vendido é repassado para ONGs de proteção animal parceiras. Não é preciso fazer nada além da compra que você já faria — o valor da doação não é somado ao preço final do produto.",
    },
    {
      name: "Ração Solidária — Instituto Adimax",
      url: "https://institutoadimax.org.br/racao-solidaria/",
      logo: "/logos/adimax.png",
      highlight: "Campanha de 30 dias",
      description:
        "Programa do Instituto Adimax que organiza campanhas de arrecadação de ração com duração de 30 dias, reunindo parceiros como petshops e clínicas veterinárias. Ao final do período, o próprio instituto complementa o volume arrecadado, ampliando o alcance da doação antes de distribuir para ONGs e protetores independentes.",
    },
    {
      name: "Adote Petz — Como ajudar",
      url: "https://www.adotepetz.com.br/institucional/como-posso-ajudar",
      logo: "/logos/adote-petz.ico",
      highlight: "+95 instituições parceiras",
      description:
        "Central de doações da Petz que já apoiou mais de 95 instituições de proteção animal parceiras em todo o Brasil. Reúne diferentes formas de contribuir — desde a compra de itens específicos até campanhas sazonais — sempre direcionando o recurso para ONGs e protetores já cadastrados na rede.",
    },
  ],
  medicamentosPlatforms: [
    {
      name: "Instituto Ampara Animal",
      url: "https://institutoamparanimal.org.br/doacao/",
      logo: "/logos/ampara.svg",
      heroImage: "/logos/ampara-hero.jpg",
      highlight: "\"ONG-mãe\" há 15 anos",
      description:
        "Uma das maiores organizações de proteção animal do Brasil. Atua como \"ONG-mãe\": recebe e administra doações de ração e medicamentos e repassa para outras ONGs e protetores independentes que não têm estrutura própria de captação, ampliando o alcance de cada doação recebida.",
    },
    {
      name: "Petlove Doações",
      url: "https://www.petlove.com.br/doacoes",
      logo: "/logos/petlove.png",
      highlight: "Escolha o item que a ONG precisa",
      description:
        "A mesma central de doações da Petlove usada para ração também cobre itens de saúde e higiene, sempre conforme a necessidade cadastrada pela ONG escolhida. Frete gratuito e entrega direta na instituição, sem você precisar descobrir sozinho o endereço ou a logística de envio.",
    },
    {
      name: "Instituto Vida Amor Animal — Abrigo da Thati",
      url: "https://www.institutovidaamoranimal.com",
      logo: "/logos/vida-amor-animal.png",
      heroImage: "/logos/vida-amor-animal-hero.png",
      highlight: "+100 animais abrigados",
      description:
        "Abrigo em São Paulo que cuida de mais de 100 animais entre cães, gatos e coelhos. Mantém uma lista pública e sempre atualizada dos medicamentos e materiais descartáveis que estão faltando no momento — dá pra doar exatamente o que o abrigo precisa, sem adivinhação.",
    },
  ],
  financeiraPlatforms: [
    {
      name: "Vakinha",
      url: "https://www.vakinha.com.br",
      logo: "/logos/vakinha.png",
      heroImage: "/logos/vakinha-hero.png",
      highlight: "Maior vaquinha online do Brasil",
      description:
        "A plataforma de crowdfunding mais conhecida do país, com uma categoria própria dedicada a causas envolvendo animais. Todos os dias, dezenas de campanhas de resgate, tratamento veterinário e castração passam por ali — protetores e ONGs usam a Vakinha justamente pela visibilidade e confiança que a marca já construiu.",
    },
    {
      name: "Doare",
      url: "https://doare.org/causas/animais",
      logo: "/logos/doare.svg",
      heroImage: "/logos/doare-hero.png",
      highlight: "Doação recorrente via Pix",
      description:
        "Plataforma pensada especificamente para organizações captarem doações recorrentes via Pix automático, em vez de uma arrecadação única. Isso dá ao abrigo um caixa mais previsível pra planejar despesas fixas como ração, castração e consultas veterinárias, em vez de depender de picos isolados de arrecadação.",
    },
    {
      name: "Benfeitoria",
      url: "https://benfeitoria.com",
      logo: "/logos/benfeitoria.png",
      heroImage: "/logos/benfeitoria-hero.jpg",
      highlight: "Sem taxa obrigatória",
      description:
        "Plataforma de financiamento coletivo voltada a projetos de impacto social, cultural e ambiental, com mais de 11 mil projetos já lançados. Diferente de boa parte do mercado, não cobra taxa obrigatória sobre o valor arrecadado — quem capta decide quanto (e se) contribui pra manter a plataforma.",
    },
    {
      name: "Pet Coletivo — Vaquinha para Animais",
      url: "https://www.petcoletivo.com.br/vaquinha-para-animais",
      logo: "/logos/petcoletivo.ico",
      highlight: "Feita só pra causa animal",
      description:
        "Vaquinha online construída especificamente para resgates, ONGs e protetores independentes centralizarem a arrecadação em um único lugar. A proposta é dar mais transparência sobre como o dinheiro arrecadado é usado, o que ajuda a manter a confiança de quem doa ao longo de campanhas mais longas.",
    },
  ],
};
