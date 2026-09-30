import { NextResponse, type NextRequest } from "next/server";
import { NOME_COOKIE } from "@/lib/auth/nome-cookie";

/*
 * Checagem OTIMISTA do admin: sem cookie de sessão, nem renderiza a página,
 * manda direto para o login.
 *
 * ⚠️ Isto NÃO é a segurança do admin, e não pode virar.
 *
 * O proxy só sabe se o cookie EXISTE, não se ele é válido, expirou ou pertence
 * a um usuário desativado. Quem decide de verdade é `exigirSessao()`, chamado
 * dentro de cada página e de cada Server Action. A documentação do Next 16 é
 * explícita: proxy serve para redirecionamento otimista, não para autorização.
 * Este arquivo existe para poupar uma ida ao banco de quem claramente não está
 * logado, e nada além disso.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const temCookie = request.cookies.has(NOME_COOKIE);

  if (pathname === "/admin/login") return NextResponse.next();
  // As rotas de API respondem o próprio 401 em JSON. Redirecionar para a
  // página de login devolveria HTML a um `fetch` que espera JSON.
  if (pathname.startsWith("/admin/api/")) return NextResponse.next();

  if (!temCookie) {
    const destino = new URL("/admin/login", request.url);
    return NextResponse.redirect(destino);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
