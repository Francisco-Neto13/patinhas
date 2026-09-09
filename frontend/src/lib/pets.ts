/**
 * Fotos da vitrine de pets.
 *
 * ⚠️ DE ONDE ELAS VIERAM, E POR QUE ESTA LISTA EXISTE.
 *
 * O CONTEXTO.MD proíbe reproduzir fotos de animais de outros sites, que é a regra
 * que impede a seção de adoção de exibir bichinho nenhum. Estas fotos NÃO
 * violam aquela regra, e a diferença importa:
 *
 *   - Lá o problema era exibir um animal REAL e ESPECÍFICO de um site de
 *     adoção, com direito autoral do fotógrafo e sugerindo que aquele pet
 *     existe e está disponível. Aqui são fotos genéricas de banco de imagem.
 *   - Todas são **CC0** (domínio público), obtidas via API do Openverse, que
 *     é feita para acesso programático, diferente de raspar um site que o
 *     robots.txt proíbe (foi o caso do Unsplash e do Pexels, ambos bloqueiam
 *     download automatizado).
 *   - CC0 dispensa atribuição. O campo `origem` fica registrado mesmo assim,
 *     porque saber a procedência é o padrão que este projeto já adotou para
 *     qualquer imagem de terceiro.
 *
 * As fotos foram recortadas em 3:4 no rosto do animal e receberam uma gradação
 * quente leve, para o conjunto conversar com a paleta creme/terracota em vez
 * de parecer uma colagem de fotógrafos diferentes.
 */
export type FotoPet = {
  src: string;
  /** Descrição escrita à mão. É o conteúdo da seção para quem não enxerga. */
  alt: string;
  /** Página de origem. CC0 não exige crédito; fica para rastreabilidade. */
  origem: string;
};

export const fotosPets: FotoPet[] = [
  {
    src: "/pets/corgi.webp",
    alt: "Corgi de pelo alaranjado deitado, olhando para a câmera",
    origem: "https://www.rawpixel.com/image/4022183/photo-image-wood-dog",
  },
  {
    src: "/pets/gato-tigrado.webp",
    alt: "Filhote de gato tigrado de olhos claros, encarando a câmera",
    origem: "https://www.rawpixel.com/image/5966764/animal-face-close",
  },
  {
    src: "/pets/golden.webp",
    alt: "Golden retriever de pelo dourado em close, olhando de frente",
    origem: "https://www.rawpixel.com/image/6023523/photo-image-face-light-public-domain",
  },
  {
    src: "/pets/gato-laranja.webp",
    alt: "Gato laranja de olhos verdes bem próximo da câmera",
    origem: "https://www.rawpixel.com/image/5914378/image-face-public-domain-cat",
  },
  {
    src: "/pets/vira-lata.webp",
    alt: "Cachorro peludo cor de caramelo sorrindo para a câmera",
    origem: "https://wordpress.org/photos/photo/57969e82db/",
  },
  {
    src: "/pets/gato-rua.webp",
    alt: "Gato tigrado de olhos verdes sentado, atento à câmera",
    origem: "https://wordpress.org/photos/photo/6465fdd63e/",
  },
  {
    src: "/pets/lulu.webp",
    alt: "Filhote de lulu da pomerânia castanho olhando para cima",
    origem: "https://stocksnap.io/photo/dog-puppy-X8VPPWVKKY",
  },
  {
    src: "/pets/gatinho.webp",
    alt: "Gatinho tigrado de olhos grandes olhando para a câmera",
    origem: "https://stocksnap.io/photo/animal-face-QRNXI8PBGO",
  },
  {
    src: "/pets/golden-feliz.webp",
    alt: "Golden retriever de boca aberta, parecendo sorrir",
    origem: "https://www.rawpixel.com/image/6037047/photo-image-face-light-public-domain",
  },
  {
    src: "/pets/coelho.webp",
    alt: "Coelho marrom entre a vegetação seca",
    origem: "https://stocksnap.io/photo/rabbit-nature-FFYENROKJG",
  },
  {
    src: "/pets/boiadeiro.webp",
    alt: "Cachorro branco e marrom de orelhas caídas encarando a câmera",
    origem: "https://www.rawpixel.com/image/6025763/photo-image-face-public-domain-green",
  },
  {
    src: "/pets/gato-filhote.webp",
    alt: "Gato filhote no colo de alguém, olhando para a câmera",
    origem: "https://www.rawpixel.com/image/5911599/image-background-face-public-domain",
  },
  {
    src: "/pets/pug.webp",
    alt: "Pug sentado usando gravata-borboleta vermelha",
    origem: "https://www.rawpixel.com/image/11515826/pug-looking-wearing-red-bowtie",
  },
  {
    src: "/pets/shih-tzu.webp",
    alt: "Filhote de shih-tzu em pé, olhando para a câmera",
    origem: "https://stocksnap.io/photo/dog-puppy-FBDF4RCNJW",
  },
  {
    src: "/pets/gato-preto-branco.webp",
    alt: "Gato preto e branco de olhos amarelos, olhando para a câmera",
    origem: "https://www.rawpixel.com/image/5966969/animal-face-close",
  },
  {
    src: "/pets/maltes.webp",
    alt: "Filhote de maltês branco sentado sobre uma pedra",
    origem: "https://www.rawpixel.com/image/5904999/photo-image-public-domain-dog-free",
  },
  {
    src: "/pets/cao-branco.webp",
    alt: "Cachorro branco de focinho escuro usando plaquinha de identificação",
    origem: "https://stocksnap.io/photo/white-dog-GSWRIR8DTS",
  },
  {
    src: "/pets/dachshund.webp",
    alt: "Dachshund castanho olhando para a câmera",
    origem: "https://stocksnap.io/photo/dachshund-dog-4ZRQA6WGWF",
  },
  {
    src: "/pets/shiba.webp",
    alt: "Shiba inu de pelo alaranjado, de perfil",
    origem: "https://stocksnap.io/photo/dog-animal-DOTORLBDD7",
  },
  {
    src: "/pets/gato-cinza.webp",
    alt: "Gatinho cinza de olhos claros encarando a câmera",
    origem: "https://stocksnap.io/photo/animal-face-ZUILYYNGW3",
  },
  {
    src: "/pets/filhote-grama.webp",
    alt: "Filhote dourado na grama, olhando para cima",
    origem: "https://www.rawpixel.com/image/6071982/free-public-domain-cc0-photo",
  },
  {
    src: "/pets/filhote-marrom.webp",
    alt: "Filhote marrom sentado, olhando para a câmera",
    origem: "https://stocksnap.io/photo/animals-puppy-OOH59BAHBL",
  },
];
