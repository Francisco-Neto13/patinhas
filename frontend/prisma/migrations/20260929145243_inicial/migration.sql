-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN_PATINHAS', 'ADMIN_ONG');

-- CreateEnum
CREATE TYPE "TipoOrganizacao" AS ENUM ('ONG', 'ABRIGO', 'PROTETOR_INDEPENDENTE', 'PROJETO');

-- CreateEnum
CREATE TYPE "StatusOrganizacao" AS ENUM ('PUBLICADA', 'RASCUNHO', 'INATIVA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'FEMEA', 'NAO_INFORMADO');

-- CreateEnum
CREATE TYPE "Porte" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('DISPONIVEL', 'EM_ADOCAO', 'ADOTADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "TipoNecessidade" AS ENUM ('RACAO', 'MEDICAMENTO', 'DINHEIRO', 'LIMPEZA', 'HIGIENE', 'OUTROS');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('NORMAL', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusNecessidade" AS ENUM ('ATIVA', 'ATENDIDA', 'INATIVA');

-- CreateEnum
CREATE TYPE "StatusMensagem" AS ENUM ('NAO_LIDA', 'LIDA', 'RESPONDIDA', 'ARQUIVADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "organizacaoId" TEXT,
    "ultimoAcessoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoOrganizacao" NOT NULL,
    "status" "StatusOrganizacao" NOT NULL DEFAULT 'RASCUNHO',
    "capaUrl" TEXT,
    "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descricaoCurta" TEXT NOT NULL,
    "descricaoCompleta" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" CHAR(2) NOT NULL,
    "endereco" TEXT,
    "chavePix" TEXT,
    "qrCodePixUrl" TEXT,
    "linkDoacao" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "site" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "galeria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sexo" "Sexo" NOT NULL DEFAULT 'NAO_INFORMADO',
    "idade" TEXT,
    "porte" "Porte",
    "raca" TEXT,
    "descricao" TEXT,
    "cidade" TEXT,
    "status" "StatusAnimal" NOT NULL DEFAULT 'DISPONIVEL',
    "linkAdocao" TEXT,
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Necessidade" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNecessidade" NOT NULL,
    "item" TEXT NOT NULL,
    "descricao" TEXT,
    "quantidade" DECIMAL(12,2),
    "unidade" TEXT,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'NORMAL',
    "status" "StatusNecessidade" NOT NULL DEFAULT 'ATIVA',
    "validadeEm" TIMESTAMP(3),
    "linkAjuda" TEXT,
    "atendidaEm" TIMESTAMP(3),
    "organizacaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Necessidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "status" "StatusMensagem" NOT NULL DEFAULT 'NAO_LIDA',
    "origemHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuarioId" TEXT,
    "organizacaoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_organizacaoId_idx" ON "Usuario"("organizacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Sessao_tokenHash_key" ON "Sessao"("tokenHash");

-- CreateIndex
CREATE INDEX "Sessao_usuarioId_idx" ON "Sessao"("usuarioId");

-- CreateIndex
CREATE INDEX "Organizacao_status_idx" ON "Organizacao"("status");

-- CreateIndex
CREATE INDEX "Animal_organizacaoId_idx" ON "Animal"("organizacaoId");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Necessidade_organizacaoId_idx" ON "Necessidade"("organizacaoId");

-- CreateIndex
CREATE INDEX "Necessidade_status_prioridade_idx" ON "Necessidade"("status", "prioridade");

-- CreateIndex
CREATE INDEX "Mensagem_status_idx" ON "Mensagem"("status");

-- CreateIndex
CREATE INDEX "Mensagem_origemHash_criadoEm_idx" ON "Mensagem"("origemHash", "criadoEm");

-- CreateIndex
CREATE INDEX "Atividade_criadoEm_idx" ON "Atividade"("criadoEm");

-- CreateIndex
CREATE INDEX "Atividade_organizacaoId_criadoEm_idx" ON "Atividade"("organizacaoId", "criadoEm");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Necessidade" ADD CONSTRAINT "Necessidade_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
