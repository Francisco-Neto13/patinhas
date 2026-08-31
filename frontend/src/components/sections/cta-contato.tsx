"use client";

import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site-config";

export function CtaContato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const mailtoHref = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(
    `Contato pelo site — ${nome || "visitante"}`,
  )}&body=${encodeURIComponent(`${mensagem}\n\n${email}`)}`;

  return (
    <section id="contato" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold text-brown-dark sm:text-4xl">
            Vamos juntos por mais focinhos felizes?
          </h2>
          <p className="mt-4 text-taupe">
            Manda uma mensagem pra gente — abre seu e-mail já preenchido com o
            que você escrever aqui.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            className="mt-10 space-y-4 rounded-3xl border border-border bg-bone p-6 shadow-sm sm:p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Como podemos ajudar?"
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
            <a
              href={mailtoHref}
              className={buttonVariants({ size: "lg", className: "w-full rounded-full sm:w-auto" })}
            >
              Enviar mensagem <Send className="size-4" />
            </a>
          </form>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-taupe sm:flex-row">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="inline-flex items-center gap-2 hover:text-terracotta"
            >
              <Mail className="size-4" /> {siteConfig.contact.email}
            </a>
            <a
              href={siteConfig.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-terracotta"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
