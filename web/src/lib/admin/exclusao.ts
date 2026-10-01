import { temNome } from "@/lib/admin/rotulos";

/*
 * O que o diálogo de exclusão diz, por tipo de registro.
 *
 * Num lugar só porque o mesmo diálogo abre de dois lugares: a lixeira da
 * linha na lista e o botão "Excluir" no fim da página de edição. Escrito duas
 * vezes, um dos dois acabaria dizendo outra coisa.
 *
 * Toda descrição diz o que some e qual a saída sem apagar: "Tem certeza?"
 * sozinho não ajuda ninguém a decidir.
 */

export type TextoExclusao = { titulo: string; descricao: string; rotulo?: string };

export const exclusao = {
  animal: (nome: string | null): TextoExclusao => ({
    titulo: temNome(nome) ? `Remover ${nome}?` : "Remover este animal?",
    descricao: "O animal e as fotos dele saem do painel e do site. Não dá para desfazer. Para só tirar do site, mude o status para Inativo.",
    rotulo: "Remover",
  }),
  organizacao: (nome: string): TextoExclusao => ({
    titulo: `Excluir ${nome}?`,
    descricao:
      "A organização, as formas de doação, as campanhas e os registros dela são apagados, e os usuários dela ficam sem organização. Não dá para desfazer. Para só tirar do site, mude o status para Inativa.",
  }),
  necessidade: (item: string): TextoExclusao => ({
    titulo: "Excluir esta necessidade?",
    descricao: `"${item}" sai do painel e do site. Não dá para desfazer. Se ela foi atendida, marque como Atendida: assim ela conta nos números.`,
  }),
  campanha: (titulo: string): TextoExclusao => ({
    titulo: "Excluir esta campanha?",
    descricao: `"${titulo}" sai do site e do painel. Não dá para desfazer. Para só pausar, mude o status para Inativo.`,
  }),
  formaDoacao: (titulo: string): TextoExclusao => ({
    titulo: "Excluir esta forma de doação?",
    descricao: `"${titulo}" sai do card da organização no site. Não dá para desfazer. Para só esconder, desmarque Mostrar no site.`,
  }),
  registroDoacao: (): TextoExclusao => ({
    titulo: "Excluir este registro de doação?",
    descricao: "O registro some do controle interno e dos totais. Não dá para desfazer.",
  }),
  pergunta: (): TextoExclusao => ({
    titulo: "Excluir esta pergunta?",
    descricao: "Ela sai da seção de perguntas frequentes do site. Não dá para desfazer. Para só esconder, desmarque Mostrar no site.",
  }),
  mensagem: (): TextoExclusao => ({
    titulo: "Excluir esta mensagem?",
    descricao: "A mensagem e os dados de contato de quem escreveu são apagados. Não dá para desfazer. Para só tirar da caixa de entrada, arquive.",
  }),
};
