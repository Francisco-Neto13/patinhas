-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "organizacaoId" TEXT;

-- CreateIndex
CREATE INDEX "Banner_organizacaoId_idx" ON "Banner"("organizacaoId");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
