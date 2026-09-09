import Image from "next/image";
import { MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-brown-dark py-10 text-bone/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <span className="flex items-center gap-2 font-heading text-lg font-semibold text-bone">
          <Image src="/logo-patinhas.png" alt="" width={28} height={28} className="size-7 rounded-full" />
          {siteConfig.name}
        </span>
        <p className="max-w-md text-sm">
          Projeto de extensão universitária de tecnologia a serviço da proteção
          animal. Nenhum valor financeiro é processado por esta plataforma.
        </p>
        <p className="flex items-center gap-2 text-xs text-bone/60">
          <MapPin className="size-3.5" /> Abrigos e ONGs parceiras. Consulte o
          contato de cada uma na área de doações
        </p>
        <p className="text-xs text-bone/50">
          © {new Date().getFullYear()} {siteConfig.name}. Feito com carinho por
          quem ama patinhas.
        </p>
      </div>
    </footer>
  );
}
