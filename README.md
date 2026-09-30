# Patinhas | Tecnologia a Serviço da Proteção Animal

<div align="center">
  <img src="./frontend/public/logo-patinhas.png" width="120" alt="Logo do Patinhas" style="border-radius: 50%">
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

## Rodando localmente

Precisa de Node 24 e Docker.

```bash
# 1. Um Postgres só para desenvolvimento, preso ao localhost
docker run -d --name patinhas-dev-pg \
  -e POSTGRES_USER=patinhas -e POSTGRES_PASSWORD=patinhas-dev -e POSTGRES_DB=patinhas \
  -p 127.0.0.1:5439:5432 -v patinhas-dev-pg:/var/lib/postgresql/data postgres:17-alpine

# 2. Dependências, variáveis e tabelas
cd frontend
npm install
cp .env.example .env
npm run db:migrate

# 3. O primeiro administrador (rodar de novo com o mesmo e-mail troca a senha)
npm run admin:criar -- voce@exemplo.com "Seu Nome" "uma-senha-de-10+"

# 4. Site em http://localhost:3000 e painel em http://localhost:3000/admin
npm run dev
```

> ⚠️ **Depois de rodar uma migration, reinicie o `npm run dev`.** O servidor de desenvolvimento guarda a conexão com o banco entre recargas, e com ela o formato antigo das tabelas. Sem reiniciar, as telas que tocam na tabela alterada quebram com "column does not exist". Em produção isso não acontece: cada deploy sobe um processo novo, depois das migrations.

## Deploy

```bash
cp .env.example .env        # na raiz: defina POSTGRES_PASSWORD
docker compose up -d --build
docker compose exec patinhas-frontend node scripts/criar-admin.mjs voce@exemplo.com "Seu Nome" "senha-forte"
```

Sobem três contêineres: o banco (só na rede interna), um que aplica as migrations e termina, e o site. Nenhum publica porta: quem expõe o site é o nginx da VPS.

> ⚠️ **O nginx precisa repassar o domínio original.** O Next compara a origem de cada formulário com o `Host` da requisição para barrar CSRF. Sem as linhas abaixo, o `Host` chega como `patinhas-frontend:3000`, não bate com a origem, e **todo** formulário do painel (inclusive o login) é recusado:
>
> ```nginx
> proxy_set_header Host $host;
> proxy_set_header X-Forwarded-Host $host;
> proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
> proxy_set_header X-Forwarded-Proto $scheme;
> ```
>
> O site também precisa estar em **HTTPS**: em produção o cookie de sessão só trafega por conexão segura, e sem ela o login parece funcionar mas não mantém ninguém logado.

**Backup:** o estado está em dois volumes, `patinhas-db` (o banco) e `patinhas-uploads` (as fotos enviadas pelo painel). Os dois precisam entrar no backup, um não serve sem o outro.

```bash
docker compose exec -T patinhas-db pg_dump -U patinhas patinhas | gzip > banco-$(date +%F).sql.gz
docker run --rm -v patinhas_patinhas-uploads:/dados -v "$PWD":/destino alpine tar czf /destino/uploads-$(date +%F).tgz -C /dados .
```

## Licença

Este projeto está licenciado sob a **Licença MIT**. É um projeto de extensão universitária, aberto para ser estudado, adaptado e reaproveitado.

Veja o arquivo `LICENSE` para o texto completo.

---

<div align="center">
  <p>Feito para aproximar quem quer ajudar de quem já ajuda.</p>
</div>
