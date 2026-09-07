"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-heading text-lg font-semibold text-brown">
          <Image src="/logo-patinhas.png" alt="" width={36} height={36} className="size-9 rounded-full" priority />
          {siteConfig.name}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brown-dark/80 transition-colors hover:text-terracotta-text"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a href="#ajudar" className={buttonVariants({ className: "rounded-full" })}>
            Quero ajudar
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full p-2 text-brown md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border/70 bg-cream px-4 py-3 md:hidden">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-brown-dark/80 hover:bg-beige"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#ajudar"
            onClick={() => setOpen(false)}
            className="mt-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground"
          >
            Quero ajudar
          </a>
        </nav>
      )}
    </header>
  );
}
