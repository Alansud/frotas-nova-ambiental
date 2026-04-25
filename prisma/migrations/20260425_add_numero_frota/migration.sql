-- AlterTable: Add numeroFrota column to Veiculo
ALTER TABLE "Veiculo" ADD COLUMN "numeroFrota" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_numeroFrota_key" ON "Veiculo"("numeroFrota");
