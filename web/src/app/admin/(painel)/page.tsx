import type { Metadata } from "next";
import Link from "next/link";
import {
  AlarmClock,
  CalendarClock,
  Camera,
  Dog,
  FileText,
  HandCoins,
  HeartHandshake,
  Home,
  Hourglass,
  Mail,
  MailWarning,
  Megaphone,
  PawPrint,
  Plus,
  ShieldAlert,
  Siren,
  UserRoundCog,
  Users,
} from "lucide-react";
import { exigirSessao } from "@/server/auth/sessao";
import { ehAdminPatinhas } from "@/server/auth/permissoes";
import { dadosDoDashboard } from "@/server/dados/painel";
import { formatarDataHora, STATUS_ORGANIZACAO, TIPO_NECESSIDADE } from "@/lib/admin/rotulos";
import { CabecalhoPagina, Selo, Tabela, classeCelula, LinkEditar } from "@/components/admin/ui";
import { Barras, ColunasMensais, Indicador, ListaDeAtencao, TituloSecao, classeCartao, type ItemAtencao } from "@/components/admin/dashboard";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

const ICONE_ATIVIDADE = {
  organizacao: Home,
  animal: Dog,
  necessidade: HeartHandshake,
  mensagem: Mail,
  usuario: Users,
  doacao: HandCoins,
  banner: Megaphone,
  conteudo: FileText,
} as const;

const DIA = 24 * 60 * 60 * 1000;
const FUSO = "America/Sao_Paulo";

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** "2026-09" no fuso de Brasília: a doação de 23h do dia 30 é de setembro. */
function chaveDoMes(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit" }).formatToParts(d);
  return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}`;
}

/** Os últimos `n` meses, do mais antigo ao atual, com o rótulo curto e o longo. */
function ultimosMeses(agora: Date, n: number) {
  const curto = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, month: "short" });
  const longo = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, month: "long", year: "numeric" });
  const [ano, mes] = chaveDoMes(agora).split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    // Dia 15 ao meio-dia UTC: longe de qualquer virada de mês em qualquer fuso.
    const d = new Date(Date.UTC(ano, mes - 1 - (n - 1 - i), 15, 12));
    return { chave: chaveDoMes(d), rotulo: curto.format(d).replace(".", ""), rotuloLongo: longo.format(d), inicio: d };
  });
}

export default async function PaginaDashboard({ searchParams }: { searchParams: Promise<{ acesso?: string }> }) {
  const sessao = await exigirSessao();
  const { acesso } = await searchParams;
  const patinhas = ehAdminPatinhas(sessao);

  const agora = new Date();
  const meses = ultimosMeses(agora, 6);
  // Uma folga de 20 dias antes do primeiro mês cobre a virada de fuso; o
  // agrupamento por mês (em Brasília) descarta o que sobrar.
  const desde = new Date(meses[0].inicio.getTime() - 20 * DIA);

  const {
    animais, necessidades, urgentes, porTipo, vencidas, vencendo, semFoto, paradas, campanhasAcabando,
    registros, atividades, rascunhos, mensagensEsperando, organizacoes, minhaOrg,
  } = await dadosDoDashboard(desde);

  const de = <T extends string>(g: { status: T; _count: number }[], s: T) => g.find((c) => c.status === s)?._count ?? 0;
  const disponiveis = de(animais, "DISPONIVEL");
  const emAdocao = de(animais, "EM_ADOCAO");
  const adotados = de(animais, "ADOTADO");
  const ativas = de(necessidades, "ATIVA");

  // Doações por mês, no fuso de Brasília.
  const porMes = new Map(meses.map((m) => [m.chave, { total: 0, valor: 0 }]));
  for (const r of registros) {
    const m = porMes.get(chaveDoMes(r.data));
    if (!m) continue;
    m.total += 1;
    if (r.tipo === "DINHEIRO" && r.valor) m.valor += Number(r.valor);
  }
  const colunas = meses.map((m) => {
    const x = porMes.get(m.chave)!;
    return { rotulo: m.rotulo, rotuloLongo: m.rotuloLongo, total: x.total, valor: x.valor > 0 ? reais.format(x.valor) : "sem valor" };
  });
  const esteMes = porMes.get(meses[5].chave)!;
  const mesPassado = porMes.get(meses[4].chave)!;

  // O que falta no perfil da ONG. Cada item muda o que o visitante consegue
  // fazer no card dela: sem PIX nem link, não há como doar.
  const faltando = minhaOrg
    ? [
        !minhaOrg.chavePix && !minhaOrg.linkDoacao && "chave PIX ou link de doação",
        !minhaOrg.capaUrl && "imagem de capa",
        !minhaOrg.descricaoCompleta && "descrição completa",
        !minhaOrg.whatsapp && !minhaOrg.instagram && "um canal de contato (WhatsApp ou Instagram)",
        minhaOrg._count.formasDoacao === 0 && "formas de doação",
      ].filter((x): x is string => Boolean(x))
    : [];

  const atencao: ItemAtencao[] = [
    {
      chave: "mensagens",
      icone: MailWarning,
      texto: mensagensEsperando === 1 ? "mensagem sem leitura há mais de 2 dias" : "mensagens sem leitura há mais de 2 dias",
      detalhe: "Quem escreveu pelo site está esperando resposta.",
      total: mensagensEsperando,
      href: "/admin/mensagens?status=NAO_LIDA",
      acao: "Responder",
      grave: true,
    },
    {
      chave: "urgentes",
      icone: Siren,
      texto: urgentes === 1 ? "necessidade urgente em aberto" : "necessidades urgentes em aberto",
      detalhe: "Aparecem em destaque no site. Atualize assim que forem atendidas.",
      total: urgentes,
      href: "/admin/necessidades?status=ATIVA",
      acao: "Ver",
      grave: true,
    },
    {
      chave: "vencidas",
      icone: AlarmClock,
      texto: vencidas === 1 ? "necessidade vencida ainda ativa" : "necessidades vencidas ainda ativas",
      detalhe: "Já saíram do site sozinhas. Marque como atendida ou atualize a validade.",
      total: vencidas,
      href: "/admin/necessidades?status=ATIVA",
      acao: "Revisar",
      grave: true,
    },
    {
      chave: "vencendo",
      icone: CalendarClock,
      texto: vencendo === 1 ? "necessidade vence nos próximos 7 dias" : "necessidades vencem nos próximos 7 dias",
      detalhe: "Depois da validade elas saem do site.",
      total: vencendo,
      href: "/admin/necessidades?status=ATIVA",
      acao: "Revisar",
    },
    {
      chave: "sem-foto",
      icone: Camera,
      texto: semFoto === 1 ? "animal para adoção sem foto" : "animais para adoção sem foto",
      detalhe: "A foto é o que faz alguém parar para ler o anúncio.",
      total: semFoto,
      href: "/admin/animais?status=DISPONIVEL",
      acao: "Adicionar foto",
    },
    {
      chave: "paradas",
      icone: Hourglass,
      texto: paradas === 1 ? "animal em processo de adoção há mais de 30 dias" : "animais em processo de adoção há mais de 30 dias",
      detalhe: "Se a adoção foi concluída, marque como Adotado.",
      total: paradas,
      href: "/admin/animais?status=EM_ADOCAO",
      acao: "Atualizar",
    },
    {
      chave: "campanhas",
      icone: Megaphone,
      texto: campanhasAcabando === 1 ? "campanha termina nos próximos 7 dias" : "campanhas terminam nos próximos 7 dias",
      detalhe: "Depois da data de término elas saem do site.",
      total: campanhasAcabando,
      href: "/admin/campanhas",
      acao: "Ver",
    },
    {
      chave: "rascunhos",
      icone: ShieldAlert,
      texto: rascunhos === 1 ? "organização em rascunho" : "organizações em rascunho",
      detalhe: "Não aparecem no site até serem publicadas.",
      total: rascunhos,
      href: "/admin/organizacoes",
      acao: "Revisar",
    },
    {
      chave: "perfil",
      icone: UserRoundCog,
      texto: faltando.length === 1 ? "item faltando no perfil da organização" : "itens faltando no perfil da organização",
      detalhe: `Falta: ${faltando.join(", ")}.`,
      total: faltando.length,
      href: minhaOrg ? `/admin/organizacoes/${minhaOrg.id}` : "/admin/organizacoes",
      acao: "Completar",
    },
  ];

  const hoje = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, weekday: "long", day: "numeric", month: "long" }).format(agora);
  // Só a primeira letra: "Terça-feira, 29 de setembro", como se escreve.
  const hojeTexto = hoje.charAt(0).toUpperCase() + hoje.slice(1);
  const atalho = buttonVariants({ variant: "outline", size: "lg", className: "h-10 rounded-full px-4" });

  return (
    <>
      <CabecalhoPagina
        destaque
        titulo={`Olá, ${sessao.nome.split(" ")[0]}`}
        descricao={
          <>
            {hojeTexto}. {patinhas ? "Visão geral do Patinhas." : `Visão geral de ${sessao.organizacaoNome}.`}
          </>
        }
      />

      {acesso === "negado" && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-[0.875rem] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" /> Essa área é exclusiva da equipe Patinhas.
        </p>
      )}

      <div className="space-y-8">
        <nav aria-label="Atalhos" className="-mt-2 flex flex-wrap gap-2">
          <Link href="/admin/animais/novo" className={atalho}><Plus className="size-4" aria-hidden="true" /> Cadastrar animal</Link>
          <Link href="/admin/necessidades/nova" className={atalho}><Plus className="size-4" aria-hidden="true" /> Nova necessidade</Link>
          <Link href="/admin/doacoes/registros/novo" className={atalho}><Plus className="size-4" aria-hidden="true" /> Registrar doação</Link>
          <Link href="/admin/campanhas/novo" className={atalho}><Plus className="size-4" aria-hidden="true" /> Nova campanha</Link>
        </nav>

        <section aria-label="Indicadores" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Indicador
            titulo="Para adoção"
            valor={disponiveis + emAdocao}
            icone={PawPrint}
            href="/admin/animais"
            dica={emAdocao > 0 ? `${emAdocao} em processo de adoção` : "Disponíveis e em processo de adoção"}
          />
          <Indicador titulo="Adotados" valor={adotados} icone={Dog} href="/admin/animais?status=ADOTADO" dica="Marcados como adotados no painel" />
          <Indicador
            titulo="Necessidades ativas"
            valor={ativas}
            icone={HeartHandshake}
            href="/admin/necessidades"
            alerta={urgentes > 0}
            dica={urgentes > 0 ? <span className="font-semibold text-terracotta-text">{urgentes} {urgentes === 1 ? "urgente" : "urgentes"}</span> : "Nenhuma urgente"}
          />
          <Indicador
            titulo="Doações no mês"
            valor={esteMes.total}
            icone={HandCoins}
            href="/admin/doacoes/registros"
            dica={`${esteMes.valor > 0 ? `${reais.format(esteMes.valor)} em dinheiro. ` : ""}Mês passado: ${mesPassado.total}`}
          />
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className={`${classeCartao} lg:col-span-2`} aria-labelledby="atencao">
            <TituloSecao id="atencao" sobretitulo="Fila de trabalho" titulo="Precisa de atenção" subtitulo="Só aparece o que pede ação. Cada item leva direto para onde resolver." />
            <ListaDeAtencao itens={atencao} />
          </section>

          <section className={classeCartao} aria-labelledby="funil">
            <TituloSecao id="funil" sobretitulo="Adoção" titulo="Funil de adoção" />
            <Barras
              vazio="Nenhum animal cadastrado ainda."
              itens={[
                { rotulo: "Disponíveis", valor: disponiveis, tom: "bg-terracotta/60" },
                { rotulo: "Em processo de adoção", valor: emAdocao, tom: "bg-terracotta/80" },
                { rotulo: "Adotados", valor: adotados, tom: "bg-brown" },
              ]}
            />
          </section>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className={`${classeCartao} lg:col-span-2`} aria-labelledby="doacoes-mes">
            <TituloSecao
              id="doacoes-mes"
              sobretitulo="Arrecadação"
              titulo="Doações registradas"
              subtitulo="Últimos 6 meses, pelos registros feitos no painel. O Patinhas não recebe dinheiro: estes números são o que as organizações informaram."
            />
            <ColunasMensais meses={colunas} />
          </section>

          <section className={classeCartao} aria-labelledby="por-tipo">
            <TituloSecao id="por-tipo" sobretitulo="Necessidades" titulo="O que falta hoje" />
            <Barras
              vazio="Nenhuma necessidade ativa."
              itens={porTipo
                .map((t) => ({ rotulo: TIPO_NECESSIDADE[t.tipo].rotulo, valor: t._count }))
                .sort((a, b) => b.valor - a.valor)}
            />
          </section>
        </div>

        {patinhas && (
          <section aria-labelledby="organizacoes">
            <TituloSecao
              id="organizacoes"
              sobretitulo="Rede de proteção"
              titulo="Organizações"
              subtitulo="As atualizadas mais recentemente."
              acao={
                <Link href="/admin/organizacoes" className="text-sm font-medium text-terracotta-text underline-offset-4 hover:underline">
                  Ver todas
                </Link>
              }
            />
            {organizacoes.length === 0 ? (
              <p className="text-sm text-taupe">Nenhuma organização cadastrada ainda.</p>
            ) : (
              <Tabela legenda="Organizações atualizadas recentemente" cabecalhos={["Organização", "Cidade", "Animais para adoção", "Necessidades ativas", "Status"]}>
                {organizacoes.map((o) => (
                  <tr key={o.id}>
                    <td className={classeCelula}><LinkEditar href={`/admin/organizacoes/${o.id}`} nome={o.nome} /></td>
                    <td className={`${classeCelula} text-taupe`}>{o.cidade}/{o.estado}</td>
                    <td className={`${classeCelula} tabular-nums`}>{o._count.animais}</td>
                    <td className={`${classeCelula} tabular-nums`}>{o._count.necessidades}</td>
                    <td className={classeCelula}><Selo tom={STATUS_ORGANIZACAO[o.status].tom}>{STATUS_ORGANIZACAO[o.status].rotulo}</Selo></td>
                  </tr>
                ))}
              </Tabela>
            )}
          </section>
        )}

        <section className={classeCartao} aria-labelledby="atividade">
          <TituloSecao id="atividade" sobretitulo="Histórico" titulo="Atividade recente" />
          {atividades.length === 0 ? (
            <p className="text-sm text-taupe">Nada por aqui ainda.</p>
          ) : (
            <ol className="grid gap-x-8 divide-y divide-border md:grid-cols-2 md:divide-y-0">
              {atividades.map((a) => {
                const Icone = ICONE_ATIVIDADE[a.tipo as keyof typeof ICONE_ATIVIDADE] ?? Home;
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 md:border-b md:border-border">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-muted/60 text-terracotta-text" aria-hidden="true">
                      <Icone className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-brown-dark">{a.descricao}</p>
                      <p className="text-xs text-taupe">
                        {formatarDataHora(a.criadoEm)}
                        {a.usuario && ` · por ${a.usuario.nome}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
