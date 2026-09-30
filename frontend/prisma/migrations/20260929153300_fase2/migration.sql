-- CreateEnum
CREATE TYPE "TipoFormaDoacao" AS ENUM ('PIX', 'VAQUINHA', 'OUTRA_PLATAFORMA', 'RACAO', 'MEDICAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoRegistroDoacao" AS ENUM ('DINHEIRO', 'RACAO', 'MEDICAMENTO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusBanner" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "FormaDoacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoFormaDoacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "link" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormaDoacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroDoacao" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoRegistroDoacao" NOT NULL,
    "valor" DECIMAL(12,2),
    "item" TEXT,
    "quantidade" DECIMAL(12,2),
    "unidade" TEXT,
    "doador" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroDoacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "link" TEXT,
    "textoBotao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "status" "StatusBanner" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conteudo" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conteudo_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "PerguntaFrequente" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerguntaFrequente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormaDoacao_organizacaoId_idx" ON "FormaDoacao"("organizacaoId");

-- CreateIndex
CREATE INDEX "RegistroDoacao_organizacaoId_data_idx" ON "RegistroDoacao"("organizacaoId", "data");

-- AddForeignKey
ALTER TABLE "FormaDoacao" ADD CONSTRAINT "FormaDoacao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDoacao" ADD CONSTRAINT "RegistroDoacao_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
