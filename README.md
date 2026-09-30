# Patinhas | Tecnologia a Serviço da Proteção Animal

<div align="center">
  <img src="./web/public/logo-patinhas.png" width="120" alt="Logo do Patinhas" style="border-radius: 50%">
  <p>Uma plataforma que aproxima a comunidade dos abrigos de animais, sem tentar reinventar o que redes de adoção, ração e arrecadação já fazem bem.</p>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white">
</div>

---

## Visão Geral

Abrigos de animais convivem com um problema recorrente: falta de recursos básicos, desorganização interna e sobrecarga dos voluntários. Boa parte das plataformas que tentam resolver isso acaba tentando fazer tudo sozinha (seu próprio catálogo de adoção, seu próprio sistema de arrecadação, sua própria logística de doação), reinventando o que redes já consolidadas no Brasil fazem melhor.

O Patinhas nasceu com uma proposta diferente: em vez de competir com o que já existe, ele funciona como uma frente de comunicação e engajamento que conecta a comunidade às redes reais de adoção, doação e arrecadação já estabelecidas no país. Nenhuma doação financeira é processada pela plataforma. Todo o dinheiro passa por canais oficiais e reconhecidos, e o Patinhas atua no que sabe fazer de verdade: aproximar quem quer ajudar de quem já ajuda.

## Destaques

* **Focado na ONG parceira:** o site apresenta a ONG com quem o Patinhas tem parceria: quem ela é, os animais dela para adoção, o que ela está precisando agora e as campanhas em andamento, tudo cadastrado pelo painel.
* **Zero manipulação de dinheiro:** o Patinhas nunca processa, guarda ou administra valores. O PIX (com QR Code gerado a partir da chave), o link de doação e as vaquinhas levam direto para a ONG.
* **Identidade visual própria:** paleta terrosa, tipografia arredondada e microinterações pensadas para transmitir acolhimento, sem abrir mão de uma cara moderna.
* **Honestidade acima de tudo:** só aparece animal cadastrado de verdade pela ONG. Sem nenhum, o site diz isso, em vez de mostrar um bichinho de exemplo. As fotos da vitrine avisam que não são animais para adoção.
* **Área administrativa:** em `/admin`, a equipe Patinhas e as ONGs parceiras cadastram organizações, animais para adoção, necessidades e formas de doação. A equipe Patinhas também edita os textos do site, banners, perguntas frequentes e os contatos institucionais, sem mexer no código. O site público mostra só o que estiver publicado, e o formulário de contato chega direto no painel.

## Stack Tecnológica

* **Framework:** Next.js 16 (App Router) com React 19. Site e painel no mesmo app, com Server Actions.
* **Linguagem:** TypeScript.
* **Banco:** PostgreSQL 17 com Prisma 7.
* **Autenticação:** própria. Senhas com scrypt e sessões guardadas no banco, para desativar um usuário cortar o acesso na hora.
* **Estilização:** Tailwind CSS 4, com um design system próprio de cores e tipografia.
* **Animações:** Framer Motion, aplicado em transições de rolagem e microinterações.
* **Componentes:** shadcn/ui como base, com ícones via Lucide.

## Organização do código

Um app Next só, em `web/`, com o backend separado por dentro dele:

```
web/
├── prisma/          schema e migrations
├── scripts/         criar-admin, limpar-uploads, testar-pix
└── src/
    ├── app/         rotas: páginas e Server Actions finas
    ├── components/  só interface (site, painel, ui)
    ├── server/      o backend, tudo com `server-only`
    │   ├── auth/    sessão, senha e permissões
    │   ├── dados/   uma camada por assunto (animais, organizações...), com a permissão dentro
    │   └── validacao/  esquemas zod dos formulários
    └── lib/         o que roda nos dois lados (datas, rótulos, PIX, validação de contato)
```

A regra é que **só `src/server/` fala com o banco**. Páginas e actions chamam a camada de dados, e é ela que confere a sessão e o isolamento entre ONGs. Uma action nova que esqueça de checar permissão continua barrada lá dentro.

## Licença

Este projeto está licenciado sob a **Licença MIT**. É um projeto de extensão universitária, aberto para ser estudado, adaptado e reaproveitado.

Veja o arquivo `LICENSE` para o texto completo.

---

<div align="center">
  <p>Feito para aproximar quem quer ajudar de quem já ajuda.</p>
</div>
