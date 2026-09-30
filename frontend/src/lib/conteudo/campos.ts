/*
 * Todo texto do site que o painel pode editar, com o valor padrão.
 *
 * ⚠️ O PADRÃO É O TEXTO QUE O SITE JÁ TINHA, palavra por palavra. O banco só
 * guarda o que alguém alterou; chave ausente = padrão. Então um banco vazio, ou
 * um banco fora do ar, mostra o site exatamente como ele era antes do painel.
 *
 * O que NÃO está aqui ficou fixo de propósito. O caso principal é a ressalva
 * da vitrine de fotos ("não são animais nossos nem estão disponíveis para
 * adoção"): ela é a regra do CONTEXTO.MD que impede o site de sugerir um pet
 * que não existe. Um texto editável seria um texto que pode sumir.
 *
 * Para tornar um texto novo editável: acrescente o campo aqui e troque o texto
 * fixo do componente por `t("chave")`. Nada muda no banco.
 */

export type TipoCampo = "texto" | "area" | "link" | "email" | "whatsapp" | "imagem" | "sim_nao";

export type Campo = {
  chave: string;
  rotulo: string;
  tipo: TipoCampo;
  padrao: string;
  max: number;
  ajuda?: string;
};

export type Grupo = { id: string; titulo: string; descricao?: string; campos: Campo[] };

const texto = (chave: string, rotulo: string, padrao: string, max = 120): Campo => ({ chave, rotulo, tipo: "texto", padrao, max });
const area = (chave: string, rotulo: string, padrao: string, max = 600): Campo => ({ chave, rotulo, tipo: "area", padrao, max });
const link = (chave: string, rotulo: string, padrao: string): Campo => ({
  chave, rotulo, tipo: "link", padrao, max: 500,
  ajuda: "Uma seção da página (#ajudar, #animais, #contato...) ou um link completo https://",
});

/** Seções 6 e 7: página inicial e páginas institucionais. */
export const GRUPOS_CONTEUDO: Grupo[] = [
  {
    id: "inicio",
    titulo: "Topo da página inicial",
    descricao: "A primeira coisa que o visitante vê.",
    campos: [
      texto("inicio.selo", "Selo acima do título", "Tecnologia a serviço da proteção animal", 80),
      texto("inicio.titulo", "Título principal", "Cada patinha merece um lar, um prato cheio e um abrigo bem cuidado", 120),
      area("inicio.subtitulo", "Subtítulo", "O Patinhas conecta abrigos, voluntários e a comunidade para reduzir a falta de recursos, organizar as doações e dar mais visibilidade aos animais que esperam por adoção.", 300),
      texto("inicio.botao1.texto", "Botão principal: texto", "Quero ajudar", 40),
      link("inicio.botao1.link", "Botão principal: link", "#ajudar"),
      texto("inicio.botao2.texto", "Botão secundário: texto", "Ver animais para adoção", 40),
      link("inicio.botao2.link", "Botão secundário: link", "#animais"),
      {
        chave: "inicio.imagem", rotulo: "Imagem do topo", tipo: "imagem", padrao: "", max: 200,
        ajuda: "Opcional. Aparece abaixo dos botões. Sem imagem, o topo fica só com o texto.",
      },
      texto("inicio.imagemAlt", "Descrição da imagem do topo", "", 150),
    ],
  },
  {
    id: "vitrine",
    titulo: "Vitrine de fotos",
    descricao: "A ressalva de que as fotos não são de animais para adoção é fixa e não aparece aqui.",
    campos: [texto("vitrine.titulo", "Título", "É por eles que a gente faz isso", 80)],
  },
  {
    id: "problema",
    titulo: "O problema",
    campos: [
      texto("problema.titulo", "Título", "O problema que queremos enfrentar", 80),
      area("problema.intro", "Texto de abertura", "A falta recorrente de recursos básicos para os animais está associada à ausência de uma organização adequada nos abrigos, e isso afeta todo mundo envolvido no cuidado.", 400),
      texto("problema.card1.titulo", "Card 1: título", "Falta de recursos", 60),
      area("problema.card1.texto", "Card 1: texto", "Escassez recorrente e imprevisibilidade no estoque de ração e medicamentos.", 200),
      texto("problema.card2.titulo", "Card 2: título", "Dificuldade de organização", 60),
      area("problema.card2.texto", "Card 2: texto", "Controles manuais ou inexistentes sobre estoque, alimentação e histórico dos animais.", 200),
      texto("problema.card3.titulo", "Card 3: título", "Sobrecarga dos cuidadores", 60),
      area("problema.card3.texto", "Card 3: texto", "Alta taxa de estresse e esgotamento mental nos voluntários dos abrigos.", 200),
      texto("problema.card4.titulo", "Card 4: título", "Falta de comunicação", 60),
      area("problema.card4.texto", "Card 4: texto", "Baixo engajamento e falta de doações constantes por parte da comunidade.", 200),
    ],
  },
  {
    id: "solucao",
    titulo: "Como o Patinhas ajuda",
    campos: [
      texto("solucao.titulo", "Título", "Como o Patinhas ajuda", 80),
      area("solucao.intro", "Texto de abertura", "Uma plataforma gratuita que une a organização interna do abrigo com uma comunidade mais próxima e engajada.", 400),
      texto("solucao.card1.titulo", "Pilar 1: título", "Gestão inteligente de estoque", 60),
      area("solucao.card1.texto", "Pilar 1: texto", "Controle de entrada, saída e alertas de ração e medicamentos para evitar a escassez imprevisível.", 200),
      texto("solucao.card2.titulo", "Pilar 2: título", "Apoio à rotina dos voluntários", 60),
      area("solucao.card2.texto", "Pilar 2: texto", "Organização digital de prontuários, alimentação e tarefas, reduzindo a carga mental da equipe.", 200),
      texto("solucao.card3.titulo", "Pilar 3: título", "Engajamento contínuo da comunidade", 60),
      area("solucao.card3.texto", "Pilar 3: texto", "Um portal com metas e conteúdo que incentivam doações constantes e direcionam quem quer contribuir.", 200),
    ],
  },
  {
    id: "sobre",
    titulo: "Sobre o Patinhas",
    campos: [
      texto("sobre.titulo", "Título", "Sobre o Patinhas", 80),
      area("sobre.texto", "Texto", "O Patinhas nasceu como projeto de extensão universitária com um objetivo simples: usar tecnologia para aproximar a comunidade dos animais resgatados e aliviar o peso que recai sobre abrigos e voluntários. É uma plataforma gratuita, pensada para ONGs e abrigos de proteção animal.", 800),
      texto("sobre.ods1.titulo", "ODS 3: título", "Saúde e bem-estar", 60),
      area("sobre.ods1.texto", "ODS 3: texto", "Reduz a carga mental dos voluntários e ajuda a prevenir surtos zoonóticos.", 200),
      texto("sobre.ods2.titulo", "ODS 9: título", "Indústria, inovação e infraestrutura", 60),
      area("sobre.ods2.texto", "ODS 9: texto", "Moderniza a gestão da ONG com uma solução digital gratuita e acessível.", 200),
      texto("sobre.ods3.titulo", "ODS 15: título", "Vida terrestre", 60),
      area("sobre.ods3.texto", "ODS 15: texto", "Ajuda a garantir segurança alimentar contínua para os animais resgatados.", 200),
    ],
  },
  {
    id: "numeros",
    titulo: "Números do Patinhas",
    descricao:
      "Contados sozinhos a partir do painel (animais disponíveis e adotados, necessidades atendidas). Aparecem na seção Sobre, só quando ligados e quando houver pelo menos um número acima de zero.",
    campos: [
      { chave: "numeros.mostrar", rotulo: "Mostrar os números no site", tipo: "sim_nao", padrao: "nao", max: 3 },
      texto("numeros.titulo", "Título", "O Patinhas em números", 60),
    ],
  },
  {
    id: "contato",
    titulo: "Contato",
    campos: [
      texto("contato.titulo", "Título", "Vamos juntos por mais focinhos felizes?", 80),
      area("contato.intro", "Texto de abertura", "Manda uma mensagem pra gente. A equipe do Patinhas lê tudo e responde pelo e-mail ou telefone que você deixar.", 300),
    ],
  },
  {
    id: "rodape",
    titulo: "Rodapé",
    campos: [
      area("rodape.texto", "Texto do rodapé", "Projeto de extensão universitária de tecnologia a serviço da proteção animal. Nenhum valor financeiro é processado por esta plataforma.", 300),
    ],
  },
];

/** Seção 12: configurações gerais. */
export const GRUPOS_CONFIGURACAO: Grupo[] = [
  {
    id: "identidade",
    titulo: "Identidade",
    campos: [
      texto("config.nome", "Nome do sistema", "Patinhas", 40),
      {
        chave: "config.logo", rotulo: "Logo", tipo: "imagem", padrao: "", max: 200,
        ajuda: "Aparece no topo e no rodapé. Sem imagem, usa o logo original do Patinhas.",
      },
      {
        chave: "config.favicon", rotulo: "Ícone da aba do navegador (favicon)", tipo: "imagem", padrao: "", max: 200,
        ajuda: "Use uma imagem quadrada. Sem imagem, usa o ícone original. O navegador pode demorar a trocar por guardar o antigo.",
      },
    ],
  },
  {
    id: "contato",
    titulo: "Contato institucional",
    descricao: "Aparece no rodapé e na seção de contato do site.",
    campos: [
      { chave: "config.email", rotulo: "E-mail institucional", tipo: "email", padrao: "contato@patinhas.exemplo.org", max: 200 },
      {
        chave: "config.whatsapp", rotulo: "WhatsApp", tipo: "whatsapp", padrao: "https://wa.me/5500000000000", max: 200,
        ajuda: "Número com DDD ou link wa.me.",
      },
      texto("config.telefone", "Telefone", "", 20),
    ],
  },
  {
    id: "redes",
    titulo: "Redes sociais",
    campos: [
      { chave: "config.instagram", rotulo: "Instagram", tipo: "link", padrao: "", max: 500, ajuda: "Link completo https://" },
      { chave: "config.facebook", rotulo: "Facebook", tipo: "link", padrao: "", max: 500, ajuda: "Link completo https://" },
    ],
  },
];

export const TODOS_OS_CAMPOS = [...GRUPOS_CONTEUDO, ...GRUPOS_CONFIGURACAO].flatMap((g) => g.campos);
export const CAMPO_POR_CHAVE = new Map(TODOS_OS_CAMPOS.map((c) => [c.chave, c]));
export const PADROES: Record<string, string> = Object.fromEntries(TODOS_OS_CAMPOS.map((c) => [c.chave, c.padrao]));
