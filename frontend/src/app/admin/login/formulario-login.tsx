"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entrar, type EstadoLogin } from "./actions";

export function FormularioLogin() {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={acao} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-medium text-brown-dark">
          E-mail
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={200}
          defaultValue={estado.email}
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "login-erro" : undefined}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-senha" className="block text-sm font-medium text-brown-dark">
          Senha
        </label>
        <Input
          id="login-senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "login-erro" : undefined}
          className="h-10"
        />
      </div>

      {estado.erro && (
        <p id="login-erro" role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="lg" disabled={enviando} className="h-10 w-full rounded-full">
        {enviando ? "Entrando..." : "Entrar"}
        <LogIn className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
