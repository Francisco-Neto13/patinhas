"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entrar, type EstadoLogin } from "./actions";

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const erro = estado.erro ? "login-erro" : undefined;

  return (
    <form action={acao} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-medium text-brown-dark">
          E-mail
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          maxLength={200}
          placeholder="voce@exemplo.org"
          defaultValue={estado.email}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro}
          className="h-11"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-senha" className="block text-sm font-medium text-brown-dark">
          Senha
        </label>
        <div className="relative">
          <Input
            id="login-senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={200}
            placeholder="••••••••••"
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro}
            className="h-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            // `aria-pressed` diz ao leitor de tela se a senha está visível agora.
            aria-pressed={mostrarSenha}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-taupe transition-colors hover:bg-muted hover:text-brown-dark focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {mostrarSenha ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {estado.erro && (
        <p id="login-erro" role="alert" className="flex items-start gap-1.5 rounded-[0.75rem] border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="lg" disabled={enviando} className="mt-2 h-11 w-full rounded-full text-sm font-semibold">
        {enviando ? "Entrando..." : "Entrar no painel"}
        <LogIn className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
