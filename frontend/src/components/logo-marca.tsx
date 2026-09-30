import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo do site: o enviado em Configurações ou, sem ele, o original.
 *
 * O enviado vai em `<img>` comum porque já foi redimensionado para WebP no
 * upload; o `next/image` só otimiza de novo o que está em `public/`.
 */
export function LogoMarca({ url, tamanho, className, prioridade }: { url?: string; tamanho: number; className?: string; prioridade?: boolean }) {
  const classes = cn("shrink-0 rounded-full object-cover", className);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- já é WebP redimensionado no upload
    return <img src={url} alt="" width={tamanho} height={tamanho} className={classes} />;
  }
  return <Image src="/logo-patinhas.png" alt="" width={tamanho} height={tamanho} className={classes} priority={prioridade} />;
}
