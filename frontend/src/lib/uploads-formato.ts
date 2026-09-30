/*
 * Formato das URLs de upload, em arquivo sem dependência de servidor.
 *
 * A validação dos formulários (zod) importa isto, e ela é usada tanto no
 * servidor quanto, potencialmente, no cliente. `uploads.ts` puxa `sharp` e
 * `node:fs`, que não podem ir para o navegador.
 */
export function ehUrlDeUpload(url: string) {
  return /^\/uploads\/\d{4}\/\d{2}\/[a-f0-9]{24}\.webp$/.test(url);
}
