import QRCode from "qrcode";
import { gerarBrCode } from "@/lib/pix";
import { BotaoCopiarPix } from "@/components/publico/botao-copiar-pix";

/**
 * PIX de uma organização: QR Code, chave e "Pix copia e cola".
 *
 * Tudo sai da CHAVE, na hora de renderizar. Não existe imagem de QR guardada
 * que possa ficar desatualizada em relação à chave exibida.
 *
 * O QR é SVG gerado no servidor: nítido em qualquer tamanho, sem arquivo para
 * baixar e sem biblioteca de QR indo para o navegador.
 */
export async function PixOrganizacao({
  chave,
  nome,
  cidade,
  compacto = false,
}: {
  chave: string;
  nome: string;
  cidade: string;
  compacto?: boolean;
}) {
  const brCode = gerarBrCode({ chave, nome, cidade });
  // Correção de erro "M": aguenta um pouco de sujeira ou reflexo na tela sem
  // deixar o desenho denso demais para câmera de celular simples.
  const svg = await QRCode.toString(brCode, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
      <div
        role="img"
        aria-label={`QR Code do PIX de ${nome}`}
        className={`${compacto ? "size-20" : "size-32"} shrink-0 rounded-lg bg-white p-1 [&_svg]:size-full`}
        // Saída da biblioteca `qrcode` a partir de um texto que NÓS montamos
        // (chave já validada, nome e cidade reduzidos a ASCII). Nada digitado
        // por visitante chega aqui.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <BotaoCopiarPix valor={chave} />
        {/* No celular não dá para escanear a própria tela: o copia e cola é
            o caminho que funciona para quem está navegando pelo telefone. */}
        <BotaoCopiarPix valor={brCode} rotulo="Pix copia e cola" rotuloBotao="Copiar código" mostrarValor={false} />
      </div>
    </div>
  );
}
