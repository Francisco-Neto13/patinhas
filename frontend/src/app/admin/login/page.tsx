import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { obterSessao } from "@/lib/auth/sessao";
import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = {
  title: "Entrar · Admin Patinhas",
  // O painel não tem o que fazer em resultado de busca.
  robots: { index: false, follow: false },
};

export default async function PaginaLogin() {
  // Quem já está logado e abre /admin/login vai direto para o painel.
  if (await obterSessao()) redirect("/admin");

  return (
    <main id="conteudo" tabIndex={-1} className="flex min-h-screen items-center justify-center px-4 py-12 outline-none">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo-patinhas.png" alt="" width={56} height={56} className="size-14 rounded-full" priority />
          <h1 className="mt-4 text-2xl font-semibold text-brown-dark">Área administrativa</h1>
          <p className="mt-1 text-sm text-taupe">Entre com a conta que a equipe Patinhas criou para você.</p>
        </div>

        <div className="rounded-[1.25rem] border border-border bg-bone p-6 shadow-sm sm:p-8">
          <FormularioLogin />
        </div>

        <p className="mt-6 text-center text-sm text-taupe">
          <Link href="/" className="underline underline-offset-4 hover:text-terracotta-text">
            Voltar para o site
          </Link>
        </p>
      </div>
    </main>
  );
}
