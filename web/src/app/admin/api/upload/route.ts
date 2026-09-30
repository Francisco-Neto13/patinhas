import { NextResponse, type NextRequest } from "next/server";
import { obterSessao } from "@/server/auth/sessao";
import { salvarImagem, TAMANHO_MAXIMO } from "@/server/uploads";

/*
 * Upload de imagem do admin.
 *
 * ⚠️ Route Handler, e não Server Action, por causa da ORDEM das checagens.
 *
 * Uma Server Action recebe o corpo já lido: o Next faz o parse do multipart
 * antes de a função rodar. Aumentar o limite de 1 MB delas para caber foto
 * significaria aceitar 10 MB de QUALQUER um, logado ou não, em qualquer action
 * do site. Aqui a sessão e o tamanho declarado são conferidos primeiro, e o
 * corpo só é lido depois de passar pelos dois.
 */
export async function POST(request: NextRequest) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });

  /*
   * Server Actions ganham do Next uma checagem de Origin contra CSRF. Route
   * Handler não ganha, então ela é feita aqui. O cookie `SameSite=Lax` já
   * bloqueia o caso comum; isto cobre o resto.
   */
  const origem = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origem || new URL(origem).host !== host) {
    return NextResponse.json({ erro: "Origem não permitida." }, { status: 403 });
  }

  const declarado = Number(request.headers.get("content-length") ?? 0);
  // Folga de 64 KB para os cabeçalhos do multipart.
  if (!declarado || declarado > TAMANHO_MAXIMO + 64 * 1024) {
    return NextResponse.json({ erro: "Imagem grande demais. O limite é 10 MB." }, { status: 413 });
  }

  let arquivo: FormDataEntryValue | null;
  try {
    arquivo = (await request.formData()).get("arquivo");
  } catch {
    return NextResponse.json({ erro: "Envio inválido." }, { status: 400 });
  }
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return NextResponse.json({ erro: "Nenhuma imagem recebida." }, { status: 400 });
  }
  // O Content-Length pode mentir; o tamanho real do arquivo não.
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Imagem grande demais. O limite é 10 MB." }, { status: 413 });
  }

  try {
    const url = await salvarImagem(Buffer.from(await arquivo.arrayBuffer()));
    return NextResponse.json({ url });
  } catch {
    // O sharp falha com qualquer coisa que não seja imagem, e é assim que um
    // arquivo disfarçado de .jpg é recusado.
    return NextResponse.json(
      { erro: "Não foi possível ler a imagem. Use JPG, PNG ou WebP." },
      { status: 415 },
    );
  }
}
