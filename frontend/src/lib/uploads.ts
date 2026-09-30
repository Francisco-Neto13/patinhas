import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/*
 * ⚠️ O comentário `turbopackIgnore` dentro de cada `path` não é enfeite.
 *
 * O `next build` rastreia quais arquivos o servidor lê para montar a imagem
 * standalone. Um caminho montado em tempo de execução ("./uploads" relativo à
 * pasta atual) faz o rastreador desistir e incluir o PROJETO INTEIRO na imagem
 * de produção, código-fonte e pasta public junto. O comentário diz a ele que
 * este caminho é de dados, não de código.
 */

/** Pasta raiz dos uploads. No Docker, o volume montado em /app/uploads. */
export function pastaUploads() {
  return path.resolve(/* turbopackIgnore: true */ process.env.UPLOADS_DIR || "./uploads");
}

/** Maior arquivo aceito. Foto de celular moderno fica entre 3 e 8 MB. */
export const TAMANHO_MAXIMO = 10 * 1024 * 1024;

/**
 * Nome de arquivo aceito na URL pública: exatamente o que `salvarImagem` gera.
 * Qualquer outra coisa (`..`, barra, extensão diferente) é recusada antes de
 * tocar no disco. É isso que impede `/uploads/../../.env`.
 */
export const SEGMENTO_VALIDO = /^[a-z0-9]+(\.webp)?$/;

/**
 * Normaliza e grava uma imagem enviada pelo admin.
 *
 * Tudo sai em WebP, girado conforme o EXIF e com no máximo 1600px de largura.
 * Três motivos para não guardar o arquivo como veio:
 *   1. Foto de celular de 6 MB viraria 6 MB baixados por cada visitante.
 *   2. O EXIF de foto de celular carrega a localização GPS de onde ela foi
 *      tirada, muitas vezes a casa de quem cuida dos animais. Reprocessar
 *      descarta todos os metadados.
 *   3. O sharp só abre imagem de verdade: um .exe renomeado para .jpg falha
 *      aqui, e nunca chega a ser servido.
 */
export async function salvarImagem(entrada: Buffer): Promise<string> {
  const saida = await sharp(entrada, { limitInputPixels: 50_000_000 })
    .rotate() // aplica a orientação do EXIF antes de ele ser descartado
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const agora = new Date();
  const ano = String(agora.getFullYear());
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  // Nome aleatório: não dá para adivinhar a URL de uma foto ainda não
  // publicada, e dois envios nunca colidem.
  const nome = `${randomBytes(12).toString("hex")}.webp`;

  const pasta = path.join(/* turbopackIgnore: true */ pastaUploads(), ano, mes);
  await mkdir(pasta, { recursive: true });
  await writeFile(path.join(pasta, nome), saida);

  return `/uploads/${ano}/${mes}/${nome}`;
}

export { ehUrlDeUpload } from "@/lib/uploads-formato";
