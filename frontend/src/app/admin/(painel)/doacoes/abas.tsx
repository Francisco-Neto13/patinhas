import Link from "next/link";
import { cn } from "@/lib/utils";

/** Abas entre as duas partes da seção 5: o que vai para o site e o que fica no painel. */
export function AbasDoacoes({ atual }: { atual: "formas" | "registros" }) {
  const abas = [
    { id: "formas", href: "/admin/doacoes", rotulo: "Formas de doação" },
    { id: "registros", href: "/admin/doacoes/registros", rotulo: "Registros de doações" },
  ] as const;
  return (
    <nav aria-label="Seções de doações" className="mb-6 border-b border-border">
      <ul className="flex gap-1">
        {abas.map((a) => (
          <li key={a.id}>
            <Link
              href={a.href}
              aria-current={a.id === atual ? "page" : undefined}
              className={cn(
                "-mb-px inline-block border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                a.id === atual ? "border-primary text-brown-dark" : "border-transparent text-taupe hover:text-brown-dark",
              )}
            >
              {a.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
