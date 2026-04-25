/*
  Warnings:

  - Added the required column `numeroFrota` to the `Veiculo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Veiculo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroFrota" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "cor" TEXT,
    "renavam" TEXT,
    "chassi" TEXT,
    "fotoUrl" TEXT,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Veiculo" ("ano", "ativo", "chassi", "cor", "createdAt", "fotoUrl", "id", "kmAtual", "marca", "modelo", "numeroFrota", "placa", "renavam", "updatedAt") SELECT "ano", "ativo", "chassi", "cor", "createdAt", "fotoUrl", "id", "kmAtual", "marca", "modelo", "placa", "placa", "renavam", "updatedAt" FROM "Veiculo";
DROP TABLE "Veiculo";
ALTER TABLE "new_Veiculo" RENAME TO "Veiculo";
CREATE UNIQUE INDEX "Veiculo_numeroFrota_key" ON "Veiculo"("numeroFrota");
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
