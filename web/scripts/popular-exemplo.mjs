/**
 * Popula o banco de DESENVOLVIMENTO com dados de exemplo: pelo menos um de
 * cada coisa, para ver o site e o painel preenchidos.
 *
 *     npm run db:exemplo
 *
 * ⚠️ Só para desenvolvimento. Tudo que ele cria tem id começando com
 * `exemplo-`, e rodar de novo APAGA esses registros e recria do zero (o resto
 * do banco não é tocado). Recusa rodar com NODE_ENV=production.
 *
 * O que fica montado:
 *   - "Abrigo Patas Unidas", PUBLICADA: aparece no site, com animais,
 *     necessidades, PIX, formas de doação, campanha e registros de doação.
 *   - "Projeto Focinho Feliz", RASCUNHO: nada dele pode aparecer no site.
 *   - Um Administrador de ONG ligado ao Patas Unidas, para testar que ele NÃO
 *     enxerga nada do Focinho Feliz.
 *
 * As fotos saem de public/pets/ e são copiadas para a pasta de uploads no
 * formato que o painel gera, porque o sistema só aceita imagem de upload
 * próprio. São fotos de banco de imagem, não animais reais para adoção.
 */
import { createHash, randomBytes, scrypt } from "node:crypto";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

if (process.env.NODE_ENV === "production") {
  console.error("popular-exemplo é só para desenvolvimento.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não definida (use --env-file=.env)");
  process.exit(1);
}

const DIA = 24 * 60 * 60 * 1000;
const agora = Date.now();
const diasAtras = (n) => new Date(agora - n * DIA);
const daquiA = (n) => new Date(agora + n * DIA);
/** Data de `<input type="date">`: meio-dia de Brasília, como o painel grava. */
const dataDoPainel = (d) => new Date(`${d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })}T12:00:00-03:00`);

// ---------------------------------------------------------------------------
// Fotos: public/pets/x.webp -> uploads/AAAA/MM/<24 hex>.webp
// ---------------------------------------------------------------------------
const pastaUploads = path.resolve(process.env.UPLOADS_DIR || "./uploads");
const ano = String(new Date().getFullYear());
const mes = String(new Date().getMonth() + 1).padStart(2, "0");

async function foto(nome) {
  // Nome derivado do arquivo de origem: rodar de novo reaproveita a mesma URL.
  const hex = createHash("sha256").update(`exemplo:${nome}`).digest("hex").slice(0, 24);
  const pasta = path.join(pastaUploads, ano, mes);
  await mkdir(pasta, { recursive: true });
  await copyFile(path.resolve("public/pets", `${nome}.webp`), path.join(pasta, `${hex}.webp`));
  return `/uploads/${ano}/${mes}/${hex}.webp`;
}

// Mesmo formato de src/server/auth/senha.ts.
async function hashDeSenha(senha) {
  const N = 32768, R = 8, P = 1;
  const salt = randomBytes(16);
  const chave = await new Promise((ok, erro) =>
    scrypt(senha, salt, 64, { N, r: R, p: P, maxmem: 256 * N * R }, (e, k) => (e ? erro(e) : ok(k))),
  );
  return `scrypt$${N}$${R}$${P}$${salt.toString("hex")}$${chave.toString("hex")}`;
}

const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();

/** INSERT a partir de um objeto: as chaves viram colunas. */
async function inserir(tabela, linha) {
  const colunas = Object.keys(linha);
  const valores = Object.values(linha);
  await cliente.query(
    `INSERT INTO "${tabela}" (${colunas.map((c) => `"${c}"`).join(", ")})
     VALUES (${colunas.map((_, i) => `$${i + 1}`).join(", ")})`,
    valores,
  );
}

try {
  await cliente.query("BEGIN");

  // Limpa a rodada anterior. Animais e necessidades primeiro: o banco não
  // deixa apagar organização que ainda tem algum (onDelete: Restrict).
  await cliente.query(`DELETE FROM "Animal" WHERE id LIKE 'exemplo-%'`);
  await cliente.query(`DELETE FROM "Necessidade" WHERE id LIKE 'exemplo-%'`);
  await cliente.query(`DELETE FROM "Organizacao" WHERE id LIKE 'exemplo-%'`); // cascata: formas, registros, campanhas, atividades
  for (const t of ["Banner", "Mensagem", "PerguntaFrequente", "Atividade"]) {
    await cliente.query(`DELETE FROM "${t}" WHERE id LIKE 'exemplo-%'`);
  }

  const [capa, corgi, gato, golden, viraLata, gatoCinza, galeria1, galeria2] = await Promise.all(
    ["filhote-grama", "corgi", "gato-tigrado", "golden", "vira-lata", "gato-cinza", "gato-laranja", "boiadeiro"].map(foto),
  );

  // --- Organizações ----------------------------------------------------------
  const agoraData = new Date();
  await inserir("Organizacao", {
    id: "exemplo-org-patas",
    nome: "Abrigo Patas Unidas",
    tipo: "ABRIGO",
    status: "PUBLICADA",
    capaUrl: capa,
    galeria: [galeria1, galeria2],
    descricaoCurta: "Abrigo comunitário que resgata, trata e encaminha para adoção cães e gatos da zona sul.",
    descricaoCompleta:
      "Fundado por um grupo de vizinhos em 2016, o Patas Unidas cuida hoje de cerca de 60 animais resgatados das ruas. Todos saem vacinados, vermifugados e castrados. O abrigo vive de doações e do trabalho de 20 voluntários.",
    cidade: "São Paulo",
    estado: "SP",
    endereco: "Rua das Acácias, 123 (visitas com agendamento)",
    chavePix: "pix@patasunidas.exemplo.org",
    linkDoacao: "https://www.exemplo.org/patas-unidas/doe",
    whatsapp: "https://wa.me/5511900000000",
    instagram: "https://instagram.com/patasunidas.exemplo",
    site: "https://www.exemplo.org/patas-unidas",
    atualizadoEm: agoraData,
  });
  await inserir("Organizacao", {
    id: "exemplo-org-focinho",
    nome: "Projeto Focinho Feliz",
    tipo: "PROJETO",
    status: "RASCUNHO",
    descricaoCurta: "Projeto de castração e resgate em Campinas. Ainda em rascunho: não pode aparecer no site.",
    cidade: "Campinas",
    estado: "SP",
    atualizadoEm: agoraData,
  });

  // --- Animais ---------------------------------------------------------------
  const animal = (id, dados) => inserir("Animal", { id: `exemplo-animal-${id}`, organizacaoId: "exemplo-org-patas", cidade: "São Paulo", atualizadoEm: agoraData, ...dados });
  await animal("thor", {
    nome: "Thor", fotoUrl: corgi, galeria: [golden], sexo: "MACHO", idade: "2 anos", porte: "MEDIO", raca: "SRD",
    descricao: "Brincalhão, se dá bem com crianças e outros cães. Já castrado e vacinado.", status: "DISPONIVEL",
    linkAdocao: "https://www.exemplo.org/patas-unidas/adote/thor",
  });
  await animal("mia", {
    nome: "Mia", fotoUrl: gato, sexo: "FEMEA", idade: "8 meses", porte: "PEQUENO",
    descricao: "Curiosa e carinhosa. Ideal para apartamento com tela.", status: "DISPONIVEL",
  });
  await animal("caramelo", {
    nome: "Caramelo", fotoUrl: viraLata, sexo: "MACHO", idade: "5 anos", porte: "GRANDE", raca: "Vira-lata caramelo",
    descricao: "Calmo, adora passear. Está em conversa com uma família.", status: "EM_ADOCAO",
  });
  await animal("nina", {
    nome: "Nina", fotoUrl: gatoCinza, sexo: "FEMEA", idade: "3 anos", porte: "PEQUENO",
    descricao: "Adotada em agosto!", status: "ADOTADO",
  });
  // Da ONG em rascunho: não pode aparecer no site, nem para o admin do Patas Unidas.
  await inserir("Animal", {
    id: "exemplo-animal-bolinha", organizacaoId: "exemplo-org-focinho", nome: "Bolinha (não deve aparecer)",
    sexo: "NAO_INFORMADO", status: "DISPONIVEL", atualizadoEm: agoraData,
  });

  // --- Necessidades ----------------------------------------------------------
  const necessidade = (id, dados) => inserir("Necessidade", { id: `exemplo-nec-${id}`, organizacaoId: "exemplo-org-patas", atualizadoEm: agoraData, ...dados });
  await necessidade("racao", {
    tipo: "RACAO", item: "Ração para cães adultos", quantidade: "150", unidade: "kg", prioridade: "URGENTE",
    descricao: "O estoque acaba na próxima semana. Qualquer marca premium ou super premium ajuda.",
    linkAjuda: "https://www.exemplo.org/patas-unidas/racao",
  });
  await necessidade("vermifugo", {
    tipo: "MEDICAMENTO", item: "Vermífugo para gatos", quantidade: "30", unidade: "doses",
    validadeEm: dataDoPainel(daquiA(5)), descricao: "Para a campanha de vermifugação do mês.",
  });
  await necessidade("areia", { tipo: "HIGIENE", item: "Areia sanitária", quantidade: "20", unidade: "pacotes" });
  await necessidade("cobertores", {
    tipo: "OUTROS", item: "Cobertores para o inverno", status: "ATENDIDA", atendidaEm: diasAtras(10),
  });
  await inserir("Necessidade", {
    id: "exemplo-nec-focinho", organizacaoId: "exemplo-org-focinho", tipo: "DINHEIRO",
    item: "Mutirão de castração (não deve aparecer)", atualizadoEm: agoraData,
  });

  // --- Doações ---------------------------------------------------------------
  const forma = (id, dados) => inserir("FormaDoacao", { id: `exemplo-forma-${id}`, organizacaoId: "exemplo-org-patas", atualizadoEm: agoraData, ...dados });
  await forma("vaquinha", {
    tipo: "VAQUINHA", titulo: "Vaquinha da cirurgia do Thor", ordem: 0,
    descricao: "Ajude a pagar a cirurgia ortopédica.", link: "https://www.exemplo.org/vaquinha/thor",
  });
  await forma("racao", { tipo: "RACAO", titulo: "Doe ração no ponto de coleta", ordem: 1, descricao: "Pet shop Bom Amigo, Av. Central, 500." });

  const registros = [
    [150, "DINHEIRO", { valor: "250.00", doador: "Mariana S." }],
    [120, "DINHEIRO", { valor: "100.00", anonimo: true }],
    [90, "RACAO", { item: "Ração para gatos", quantidade: "40", unidade: "kg", doador: "Pet shop Bom Amigo" }],
    [60, "DINHEIRO", { valor: "500.00", doador: "Empresa Exemplo Ltda." }],
    [30, "MEDICAMENTO", { item: "Antipulgas", quantidade: "12", unidade: "doses", anonimo: true }],
    [5, "DINHEIRO", { valor: "80.00", doador: "João P." }],
    [2, "RACAO", { item: "Ração para cães", quantidade: "25", unidade: "kg", doador: "Carla M." }],
  ];
  for (const [i, [dias, tipo, extra]] of registros.entries()) {
    await inserir("RegistroDoacao", {
      id: `exemplo-reg-${i}`, organizacaoId: "exemplo-org-patas", data: dataDoPainel(diasAtras(dias)), tipo,
      atualizadoEm: agoraData, ...extra,
    });
  }

  // --- Campanhas -------------------------------------------------------------
  await inserir("Banner", {
    id: "exemplo-banner-patinhas", titulo: "Adotar é um ato de amor", ordem: 0,
    descricao: "Conheça os animais que esperam por um lar e divulgue para quem pode adotar.",
    link: "#animais", textoBotao: "Ver animais", atualizadoEm: agoraData,
  });
  await inserir("Banner", {
    id: "exemplo-banner-inverno", organizacaoId: "exemplo-org-patas", titulo: "Campanha do agasalho pet", ordem: 1,
    descricao: "Arrecadando cobertores e caminhas até o fim do mês.", imagemUrl: golden,
    link: "https://www.exemplo.org/patas-unidas/inverno", textoBotao: "Quero doar",
    inicioEm: dataDoPainel(diasAtras(10)), fimEm: dataDoPainel(daquiA(5)), atualizadoEm: agoraData,
  });

  // --- Perguntas frequentes --------------------------------------------------
  await inserir("PerguntaFrequente", {
    id: "exemplo-faq-1", ordem: 0, atualizadoEm: agoraData,
    pergunta: "O Patinhas recebe o dinheiro das doações?",
    resposta: "Não. Toda doação vai direto para a organização, pelo PIX ou pelo link dela. O Patinhas só divulga.",
  });
  await inserir("PerguntaFrequente", {
    id: "exemplo-faq-2", ordem: 1, atualizadoEm: agoraData,
    pergunta: "Como faço para adotar?",
    resposta: "Clique no animal que você gostou e fale com a organização responsável pelo WhatsApp ou pelo link de adoção.",
  });

  // --- Mensagens -------------------------------------------------------------
  const origem = createHash("sha256").update("exemplo").digest("hex");
  await inserir("Mensagem", {
    id: "exemplo-msg-1", nome: "Fernanda Lima", email: "fernanda@exemplo.com", telefone: "(11) 91234-5678",
    mensagem: "Olá! Tenho uma ONG em Santo André e gostaria de saber como participar do Patinhas.",
    origemHash: origem, criadoEm: diasAtras(3),
  });
  await inserir("Mensagem", {
    id: "exemplo-msg-2", nome: "Ricardo Alves", email: "ricardo@exemplo.com", telefone: "(21) 3456-7890",
    mensagem: "Parabéns pelo projeto! Posso ajudar como voluntário na parte de fotografia.",
    status: "LIDA", origemHash: origem, criadoEm: diasAtras(1),
  });

  // --- Textos e configurações ------------------------------------------------
  await cliente.query(
    `INSERT INTO "Conteudo" ("chave", "valor", "atualizadoEm") VALUES
       ('numeros.mostrar', 'sim', now()),
       ('config.telefone', '(11) 4000-0000', now())
     ON CONFLICT ("chave") DO UPDATE SET "valor" = EXCLUDED."valor", "atualizadoEm" = now()`,
  );

  // --- Admin de ONG ----------------------------------------------------------
  const senhaOng = randomBytes(9).toString("base64url");
  await cliente.query(
    `INSERT INTO "Usuario" ("id", "nome", "email", "senhaHash", "papel", "organizacaoId", "ativo", "atualizadoEm")
     VALUES ('exemplo-usuario-ong', 'Admin Patas Unidas', 'ong@patinhas.local', $1, 'ADMIN_ONG', 'exemplo-org-patas', true, now())
     ON CONFLICT ("email") DO UPDATE SET "senhaHash" = EXCLUDED."senhaHash", "papel" = 'ADMIN_ONG',
       "organizacaoId" = 'exemplo-org-patas', "ativo" = true, "atualizadoEm" = now()`,
    [await hashDeSenha(senhaOng)],
  );

  // --- Atividade recente -----------------------------------------------------
  const atividades = [
    ["organizacao", "Abrigo Patas Unidas foi cadastrada", "exemplo-org-patas", 20],
    ["animal", "Thor foi adicionado", "exemplo-org-patas", 15],
    ["necessidade", "Nova necessidade cadastrada: Ração para cães adultos", "exemplo-org-patas", 4],
    ["mensagem", "Nova mensagem recebida de Fernanda Lima", null, 3],
    ["doacao", "Nova doação registrada", "exemplo-org-patas", 2],
  ];
  for (const [i, [tipo, descricao, organizacaoId, dias]] of atividades.entries()) {
    await inserir("Atividade", { id: `exemplo-atv-${i}`, tipo, descricao, organizacaoId, criadoEm: diasAtras(dias) });
  }

  await cliente.query("COMMIT");
  console.log("Dados de exemplo criados.");
  console.log(`Admin de ONG (Patas Unidas): ong@patinhas.local / ${senhaOng}`);
} catch (erro) {
  await cliente.query("ROLLBACK");
  throw erro;
} finally {
  await cliente.end();
}
