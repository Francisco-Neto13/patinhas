/**
 * A navegação do painel, agrupada pelo que a pessoa está FAZENDO.
 *
 * É a fonte única de três coisas: os itens da barra lateral, o rótulo da
 * página na barra superior e o sobretítulo de cada página. Mudar um grupo aqui
 * muda os três; espalhar a mesma lista em três lugares deixaria o sobretítulo
 * dizendo "Arrecadação" numa página que o menu mostra em outro grupo.
 *
 * ⚠️ Esconder um item NÃO é a autorização. Cada página e cada action chamam
 * `exigirSessao()`/`exigirAdminPatinhas()` por conta própria. O menu só evita
 * oferecer um caminho que o servidor vai recusar.
 *
 * Sem imports de propósito: o arquivo é lido por Server e Client Components, e
 * ícone vai como NOME (componente não atravessa a fronteira servidor/cliente).
 */

/**
 * Barra lateral aberta ou recolhida. Lido pelo layout no servidor, para a
 * barra já nascer do jeito certo, sem piscar.
 */
export const COOKIE_BARRA = "patinhas_barra";

export type IconeNav =
  | "dashboard"
  | "organizacoes"
  | "animais"
  | "necessidades"
  | "doacoes"
  | "campanhas"
  | "mensagens"
  | "conteudo"
  | "usuarios"
  | "configuracoes";

export type ItemNav = {
  href: string;
  rotulo: string;
  icone: IconeNav;
  /** Só a equipe Patinhas vê (seção 11.1 do ADMINISTRACAO.MD). */
  soPatinhas?: boolean;
  /** Chave do contador que o layout calcula. Sem número > 0, sem selo. */
  contador?: "mensagens";
};

export type GrupoNav = { rotulo: string; itens: ItemNav[] };

const GRUPOS: GrupoNav[] = [
  {
    rotulo: "Acompanhamento",
    itens: [{ href: "/admin", rotulo: "Dashboard", icone: "dashboard" }],
  },
  {
    // Quem é ajudado: as organizações e o que elas divulgam.
    rotulo: "Rede de proteção",
    itens: [
      { href: "/admin/organizacoes", rotulo: "ONGs / Abrigos", icone: "organizacoes" },
      { href: "/admin/animais", rotulo: "Animais", icone: "animais" },
      { href: "/admin/necessidades", rotulo: "Necessidades", icone: "necessidades" },
    ],
  },
  {
    // Como a comunidade ajuda: dinheiro, itens e as campanhas que pedem.
    rotulo: "Arrecadação",
    itens: [
      { href: "/admin/doacoes", rotulo: "Doações", icone: "doacoes" },
      { href: "/admin/campanhas", rotulo: "Campanhas", icone: "campanhas" },
    ],
  },
  {
    // O que CHEGA de fora e espera resposta.
    rotulo: "Atendimento",
    itens: [
      { href: "/admin/mensagens", rotulo: "Mensagens", icone: "mensagens", soPatinhas: true, contador: "mensagens" },
    ],
  },
  {
    rotulo: "Administração",
    itens: [
      { href: "/admin/conteudo", rotulo: "Conteúdo", icone: "conteudo", soPatinhas: true },
      { href: "/admin/usuarios", rotulo: "Usuários", icone: "usuarios", soPatinhas: true },
      { href: "/admin/configuracoes", rotulo: "Configurações", icone: "configuracoes", soPatinhas: true },
    ],
  },
];

/**
 * Os grupos que este papel enxerga. Grupo sem item visível some inteiro: um
 * título sozinho, sem nada embaixo, parece tela quebrada.
 */
export function gruposVisiveis(ehPatinhas: boolean): GrupoNav[] {
  return GRUPOS.map((g) => ({
    ...g,
    itens: g.itens
      .filter((i) => ehPatinhas || !i.soPatinhas)
      // Para o admin de ONG, a lista de organizações tem uma linha só: a dele.
      .map((i) => (!ehPatinhas && i.href === "/admin/organizacoes" ? { ...i, rotulo: "Minha organização" } : i)),
  })).filter((g) => g.itens.length > 0);
}

/** O Dashboard só está ativo na raiz; os outros também nas subpáginas. */
export function itemAtivo(href: string, caminho: string) {
  return href === "/admin" ? caminho === "/admin" : caminho === href || caminho.startsWith(href + "/");
}

// Páginas que não estão no menu, mas têm lugar na hierarquia.
const FORA_DO_MENU: { href: string; rotulo: string; grupo: string }[] = [
  { href: "/admin/conta", rotulo: "Minha conta", grupo: "Sua conta" },
];

// Subseções com nome próprio. O resto da URL vira "Novo" ou "Editar".
const SUBSECOES: Record<string, string> = {
  "/admin/doacoes/formas": "Formas de doação",
  "/admin/doacoes/registros": "Registros",
  "/admin/conteudo/textos": "Textos",
  "/admin/conteudo/faq": "Perguntas frequentes",
};

/**
 * Onde a pessoa está: grupo (sobretítulo) e rótulo (barra superior).
 *
 * `/admin/animais/abc123` vira `Rede de proteção` e `Animais · Editar`.
 */
export function localizar(caminho: string, ehPatinhas = true): { grupo: string; rotulo: string } {
  for (const g of gruposVisiveis(ehPatinhas)) {
    const item = g.itens.find((i) => itemAtivo(i.href, caminho));
    if (item) return { grupo: g.rotulo, rotulo: montarRotulo(item.rotulo, item.href, caminho) };
  }
  const fora = FORA_DO_MENU.find((f) => itemAtivo(f.href, caminho));
  if (fora) return { grupo: fora.grupo, rotulo: fora.rotulo };
  return { grupo: "Painel", rotulo: "Painel" };
}

function montarRotulo(base: string, href: string, caminho: string) {
  if (caminho === href) return base;
  const partes = [base];
  const sub = Object.keys(SUBSECOES).find((s) => itemAtivo(s, caminho));
  let resto = caminho.slice(href.length + 1);
  if (sub) {
    partes.push(SUBSECOES[sub]);
    resto = caminho === sub ? "" : caminho.slice(sub.length + 1);
  }
  // Mensagem não se edita, só se lê.
  if (resto) partes.push(/^(novo|nova)$/.test(resto) ? "Novo" : href === "/admin/mensagens" ? "Detalhe" : "Editar");
  return partes.join(" · ");
}
