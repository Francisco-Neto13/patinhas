"use client";

import { usePathname } from "next/navigation";
import { localizar } from "@/lib/admin/navegacao";

/**
 * O sobretítulo da página é o grupo da barra lateral onde ela mora
 * ("Rede de proteção", "Arrecadação"...). Sai da mesma lista do menu, então
 * nunca diz um grupo diferente do que o menu mostra.
 */
export function Sobretitulo() {
  return <p className="painel-sobretitulo">{localizar(usePathname()).grupo}</p>;
}
